import { PermissionFlagsBits } from "discord-api-types/v10";
import { ChatInputCommandInteraction, Collection, Formatters, GuildMember, GuildMemberRoleManager, Role, SelectMenuInteraction } from "discord.js";
import { error } from "../../index";
import { basicCollector, createButtons } from "../../utils/functions/discord";
import { getColor, splitArray } from "../../utils/functions/helpers";
import { Category, Command } from "../../utils/typings/discord";

export default <Command>{
  name: "role",
  category: Category.Moderation,
  permissions: [PermissionFlagsBits.ManageRoles],
  cooldown: 3,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const subcommand = interaction.options.getSubcommand(true);
    let message: string = "Oops...";

    switch (subcommand) {
      case "give":
        message = await give();
        break;
      case "remove":
        message = await remove();
        break;
      case "create":
        message = await create();
        break;
      case "delete":
        message = await destroy();
        break;
      case "edit":
        message = await edit();
        break;
      default:
        await view();
        return;
    }

    await interaction.editReply(`${message}`);

    async function give(): Promise<string> {
      const resolved = interaction.options.resolved;
      const role = resolved.roles?.first();
      if (!role) return "I cannot find the role.";

      if (!(role as any).editable) {
        return "I cannot give this role to anyone because it's above me. :(";
      }

      const fail: string[] = [];

      resolved.members?.forEach((member) => {
        (member?.roles as GuildMemberRoleManager).add(`${role.id}`).catch((err) => {
          fail.push(`I was unable to add the role to ${(member as any)?.nickname}. Reason: \*\*${err.message}\*\*`);
        });
      });

      return fail.length === resolved.members?.size
        ? "I was unable to add the role to everyone."
        : `Added roles.${
            fail.length > 0
              ? `\n❗I couldn't add the role to the following members:\n
    										${fail.join("\n")}`
              : ""
          }`;
    }

    async function remove(): Promise<string> {
      const resolved = interaction.options.resolved;
      const role = resolved.roles?.first();
      if (!role) return "I cannot find the role.";

      if (!(role as any).editable) {
        return "I cannot remove this role from anyone because it's above me. :(";
      }

      const fail: string[] = [];

      resolved.members?.forEach((member) => {
        (member?.roles as GuildMemberRoleManager).remove(`${role.id}`).catch((err) => {
          fail.push(`I was unable to remove the role from ${(member as any)?.nickname}. Reason: \*\*${err.message}\*\*`);
        });
      });

      return fail.length === resolved.members?.size
        ? "I was unable to remove the role from everyone."
        : `Removed roles.${
            fail.length > 0
              ? `\n❗I couldn't remove the role to the following members:\n
    										${fail.join("\n")}`
              : ""
          }`;
    }

    async function create(): Promise<string> {
      const name = interaction.options.getString("name", true);
      const color = interaction.options.getString("color");
      const hoist = interaction.options.getBoolean("hoist");
      const mentionable = interaction.options.getBoolean("mentionable");
      const reason = interaction.options.getString("reason");
      const user = interaction.options.get("user");
      const options: any = { name };
      const rejects: string[] = [];

      options.hoist = hoist ? hoist : false;
      options.mentionable = mentionable ? mentionable : false;
      options.reason = reason ? reason : false;

      if (color) {
        if (color?.match(/(#?([A-Fa-f0-9]{6}))/g)) {
          options.color = color;
        } else {
          rejects.push(`${color} is not a valid hex color.`);
        }
      }

      const created = await interaction.guild?.roles.create(options).catch((err) => err);

      if (!created) {
        error.send(`Role Create: ${created.message}`);
        return `Failed to create role. Reason: \*\*${created.message}\*\*`;
      }

      let msg = `Successfully created ${created}`;

      if (user) {
        const added = await (user.member as GuildMember)?.roles.add(created).catch((err) => err);

        if (!added) {
          error.send(`Role Create Give: ${created.message}`);
          return `Failed to create role. Reason: \*\*${created.message}\*\*`;
        }

        msg += ` and added to ${user.member}`;
      }

      msg += rejects.length > 0 ? `${rejects.join("")}.` : ".";
      return msg;
    }

    async function destroy(): Promise<string> {
      const roles = interaction.options.resolved?.roles;
      const reason = interaction.options.getString("reason");
      const rejects: string[] = [];

      roles?.forEach(async (role) => {
        await (role as Role).delete(`${reason ?? ""}`).catch((err) => rejects.push(`Failed to delete ${role}. \*\*${err.message}\*\*`));
      });

      return rejects.length === roles?.size ? "I was unable to delete any role." : `Succesfully deleted roles. ${rejects?.join("")}`;
    }

    async function view() {
      const { SelectMenuBuilder, SelectMenuOptionBuilder } = await import("@discordjs/builders");

      let roles: Collection<string, Role> | any = interaction.guild?.roles.cache.filter((r) => r.name != "@everyone").sort((a, b) => a.position - b.position);
      const size = roles.size;

      if (size === 0) {
        return await interaction.editReply("This server doesn't have any roles.");
      }

      roles = splitArray(roles, 9, mutateData);

      const buttons = createButtons(interaction, ["first", "back", "next", "last"])?.buttons; // createPaginationButtons(interaction);
      const ids = [`mroles.${interaction.id}`, ...buttons.map((btn) => btn.custom_id)];
      const menu = new SelectMenuBuilder().setCustomId(`mroles.${interaction.id}`).setMaxValues(1).setMinValues(1).setOptions(displayOptions(0));
      let embed: any = displayRoles(0);
      let index = 0;

      await basicCollector({
        interaction,
        ephemeral: true,
        ids,
        options: {
          embeds: [embed],
          components: [
            { type: 1, components: [menu] },
            { type: 1, components: buttons },
          ],
        },
        collect: async (i) => {
          if (i.isButton()) {
            switch (i.customId) {
              case `first.${interaction.id}`:
                buttons[0].disabled = true;
                buttons[1].disabled = true;
                buttons[2].disabled = false;
                buttons[3].disabled = false;
                index = 0;
                break;
              case `back.${interaction.id}`:
                // Enable menu and buttons.
                index = menu.data.disabled ? index : index - 1 < 0 ? roles.length - 1 : index - 1;
                menu.setDisabled(false);
                buttons[0].disabled = index == 0;
                buttons[1].disabled = index == 0;
                buttons[2].disabled = false;
                buttons[3].disabled = false;
                break;
              case `next.${interaction.id}`:
                index = index + 1 >= roles.length ? 0 : index + 1;
                buttons[0].disabled = false;
                buttons[1].disabled = false;
                buttons[2].disabled = index + 1 >= roles?.length;
                buttons[3].disabled = index + 1 >= roles?.length;
                break;
              case `last.${interaction.id}`:
                buttons[0].disabled = false;
                buttons[1].disabled = false;
                buttons[2].disabled = true;
                buttons[3].disabled = true;
                index = roles.length - 1;
                break;
            }

            menu.setOptions(displayOptions(index));
            embed = displayRoles(index);
          }

          if (i.isSelectMenu()) {
            menu.options.forEach((option, idx) => option.setDefault(idx == +(i as SelectMenuInteraction).values[0]));

            menu.setDisabled(true);
            buttons.forEach((button, i) => (button.disabled = i != 1));
            embed = displayRoleInfo(roles[index][+(i as SelectMenuInteraction).values[0]]);
          }

          return {
            embeds: [embed],
            components: [
              { type: 1, components: [menu] },
              { type: 1, components: buttons },
            ],
          };
        },
      });

      function displayRoleInfo(role: any) {
        return {
          color: role.base10,
          author: {
            name: `${role.position}. ${role.name}`,
            url: `${role.iconURL ?? ""}`,
            iconURL: interaction.guild?.members?.me?.displayAvatarURL() ?? "",
          },
          thumbnail: {
            url: role.iconURL ?? `${interaction.guild?.iconURL() ?? ""}`,
          },
          fields: [
            {
              name: `Active Users`,
              value: `${role.activeUsers}`,
              inline: true,
            },
            {
              name: "Created",
              value: role.created,
              inline: true,
            },
            {
              name: `Role Unicode Emoji`,
              value: `${role.unicodeEmoji ?? "None"}`,
              inline: true,
            },
            {
              name: "Base 10 Color",
              value: `${role.base10}`,
              inline: true,
            },
            {
              name: "Hex Color",
              value: `${role.hexColor}`,
              inline: true,
            },
            {
              name: "Hoisted",
              value: `${role.hoist}`,
              inline: true,
            },
            {
              name: `Editable`,
              value: `${role.editable}`,
              inline: true,
            },
            {
              name: `Mentionable`,
              value: `${role.mentionable}`,
              inline: true,
            },
            {
              name: `External`,
              value: `${role.managed}`,
              inline: true,
            },
          ],
          footer: {
            text: `Id: ${role.id}`,
          },
        };
      }

      function displayRoles(index: number) {
        return {
          author: {
            name: `${interaction.guild?.name ?? "This server's"} Roles (${size})`,
            iconUrl: interaction.guild?.iconURL(),
          },
          color: getColor(interaction.guild?.members?.me),
          fields: roles[index].map((r: any) => r.fields),
        };
      }

      function displayOptions(index: number) {
        return roles[index].map((role: Role, i: number) => {
          const option = new SelectMenuOptionBuilder().setLabel(`${role.name.substring(0, 99)}`).setValue(`${i}`);

          if (role.unicodeEmoji) {
            option.setEmoji({ name: `${role.unicodeEmoji}` });
          }

          return option;
        });
      }

      function mutateData(role: Role) {
        return {
          base10: role.color,
          created: Formatters.time(role.createdAt, "F"),
          editable: role.editable,
          hexColor: role.hexColor,
          hoist: role.hoist,
          iconURL: role.iconURL({ size: 4096 }),
          activeUsers: role.members.size,
          managed: role.managed,
          mentionable: role.mentionable,
          name: role.name,
          id: role.id,
          position: role.position,
          unicodeEmoji: role.unicodeEmoji,
          fields: {
            name: `${role.position}. ${role.name}`,
            value: `${role}`,
            inline: true,
          },
        };
      }
    }

    async function edit(): Promise<string> {
      const role = interaction.options.getRole("role", true);
      const name = interaction.options.getString("name");
      const color = interaction.options.getString("color");
      const hoist = interaction.options.getBoolean("hoist");
      const mentionable = interaction.options.getBoolean("mentionable");
      const reason = interaction.options.getString("reason");
      const options: any = {};
      const rejects: string[] = [];

      if (!name && !color && null == hoist && null == mentionable) {
        return "I'm missing a value to edit.";
      }

      if (name) {
        options.name = name;
      }

      console.log(hoist);
      if (hoist !== null) {
        options.hoist = hoist;
      }

      if (mentionable !== null) {
        options.mentionable = hoist;
      }

      if (color) {
        if (color?.match(/(#?([A-Fa-f0-9]{6}))/g)) {
          options.color = color;
        } else {
          rejects.push(`${color} is not a valid hex color.`);
        }
      }

      const edit = await (role as Role)?.edit(options, `${reason ?? ""}`).catch((err) => err);

      if (!edit) {
        error.send(`Role Create: ${edit.message}`);
        return `Failed to create role. Reason: \*\*${edit.message}\*\*`;
      }

      let msg = `Successfully updated ${edit}`;

      msg += rejects.length > 0 ? `${rejects.join("")}.` : ".";
      return msg;
    }
  },
};
