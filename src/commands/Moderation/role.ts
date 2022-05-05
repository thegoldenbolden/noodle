import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../utils/types/discord";

export default <Command>{
  name: "role",
  async execute(interaction: ChatInputCommandInteraction) {
    return await interaction.reply("Howdy");
    // await interaction.deferReply({ ephemeral: true });
    // const subcommand = interaction.options.getSubcommand(true);
    // let message: string = "Oops...";

    // switch (subcommand) {
    //   case "give":
    //     message = await give();
    //     break;
    //   case "remove":
    //     message = await remove();
    //     break;
    //   case "create":
    //     message = await create();
    //     break;
    //   case "delete":
    //     message = await destroy();
    //     break;
    //   case "edit":
    //     message = await edit();
    //     break;
    //   default:
    //     await view();
    //     return;
    // }

    // await interaction.editReply(`${message}`);

    // async function give(): Promise<string> {
    //   const resolved = interaction.options.resolved;
    //   const role = resolved.roles?.first();
    //   if (!role) return "I cannot find the role.";

    //   if (!(role as any).editable) {
    //     return "I cannot give this role to anyone because it's above me. :(";
    //   }

    //   const fail: string[] = [];

    //   resolved.members?.forEach((member) => {
    //     (member?.roles as GuildMemberRoleManager)
    //       .add(`${role.id}`)
    //       .catch((err) => {
    //         fail.push(
    //           `I was unable to add the role to ${
    //             (member as any)?.nickname
    //           }. Reason: \*\*${err.message}\*\*`
    //         );
    //       });
    //   });

    //   return fail.length === resolved.members?.size
    //     ? "I was unable to add the role to everyone."
    //     : `Added roles.${
    //         fail.length > 0
    //           ? `\n❗I couldn't add the role to the following members:\n
    // 										${fail.join("\n")}`
    //           : ""
    //       }`;
    // }

    // async function remove(): Promise<string> {
    //   const resolved = interaction.options.resolved;
    //   const role = resolved.roles?.first();
    //   if (!role) return "I cannot find the role.";

    //   if (!(role as any).editable) {
    //     return "I cannot remove this role from anyone because it's above me. :(";
    //   }

    //   const fail: string[] = [];

    //   resolved.members?.forEach((member) => {
    //     (member?.roles as GuildMemberRoleManager)
    //       .remove(`${role.id}`)
    //       .catch((err) => {
    //         fail.push(
    //           `I was unable to remove the role from ${
    //             (member as any)?.nickname
    //           }. Reason: \*\*${err.message}\*\*`
    //         );
    //       });
    //   });

    //   return fail.length === resolved.members?.size
    //     ? "I was unable to remove the role from everyone."
    //     : `Remove roles.${
    //         fail.length > 0
    //           ? `\n❗I couldn't remove the role to the following members:\n
    // 										${fail.join("\n")}`
    //           : ""
    //       }`;
    // }

    // async function create(): Promise<string> {
    //   const name = interaction.options.getString("name", true);
    //   const color = interaction.options.getString("color");
    //   const hoist = interaction.options.getBoolean("hoist");
    //   const mentionable = interaction.options.getBoolean("mentionable");
    //   const reason = interaction.options.getString("reason");
    //   const user = interaction.options.get("user");
    //   const options: any = { name };
    //   const rejects: string[] = [];

    //   options.hoist = hoist ? hoist : false;
    //   options.mentionable = mentionable ? mentionable : false;
    //   options.reason = reason ? reason : false;

    //   if (color) {
    //     if (color?.match(/(#?([A-Fa-f0-9]{6}))/g)) {
    //       options.color = color;
    //     } else {
    //       rejects.push(`${color} is not a valid hex color.`);
    //     }
    //   }

    //   const created = await interaction.guild?.roles
    //     .create(options)
    //     .catch((err) => err);

    //   if (!created) {
    //     error.send(`Role Create: ${created.message}`);
    //     return `Failed to create role. Reason: \*\*${created.message}\*\*`;
    //   }

    //   let msg = `Successfully created ${created}`;

    //   if (user) {
    //     const added = await (user.member as GuildMember)?.roles
    //       .add(created)
    //       .catch((err) => err);

    //     if (!added) {
    //       error.send(`Role Create Give: ${created.message}`);
    //       return `Failed to create role. Reason: \*\*${created.message}\*\*`;
    //     }

    //     msg += ` and added to ${user.member}`;
    //   }

    //   msg += rejects.length > 0 ? `${rejects.join("")}.` : ".";
    //   return msg;
    // }

    // async function destroy(): Promise<string> {
    //   const roles = interaction.options.resolved?.roles;
    //   const reason = interaction.options.getString("reason");
    //   const rejects: string[] = [];

    //   roles?.forEach(async (role) => {
    //     await (role as Role)
    //       .delete(`${reason ?? ""}`)
    //       .catch((err) =>
    //         rejects.push(`Failed to delete ${role}. \*\*${err.message}\*\*`)
    //       );
    //   });

    //   return rejects.length === roles?.size
    //     ? "I was unable to delete any role."
    //     : `Succesfully deleted roles. ${rejects?.join("")}`;
    // }

    // async function view() {
    //   const { createPaginationButtons } = await import("../../utils/discord");
    //   const { SelectMenuBuilder, SelectMenuOptionBuilder } = await import(
    //     "@discordjs/builders"
    //   );

    //   let roles: Collection<string, Role> | any = interaction.guild?.roles.cache
    //     .filter((r) => r.name != "@everyone")
    //     .sort((a, b) => a.position - b.position);
    //   const size = roles.size;

    //   if (size === 0) {
    //     return await interaction.editReply(
    //       "This server doesn't have any roles."
    //     );
    //   }

    //   roles = splitArray(roles, 9, mutateData);

    //   const buttons = createPaginationButtons();
    //   const ids = [
    //     "menu.roles",
    //     ...buttons.map((btn: any) => btn.data.custom_id),
    //   ];
    //   const menu = new SelectMenuBuilder()
    //     .setCustomId("menu.roles")
    //     .setMaxValues(1)
    //     .setMinValues(1)
    //     .setOptions(...displayOptions(0));
    //   let embed: any = displayRoles(0);
    //   let index = 0;

    //   const message = await interaction.editReply({
    //     embeds: [embed],
    //     components: [
    //       { type: 1, components: [menu] },
    //       { type: 1, components: buttons },
    //     ],
    //   });

    //   const collector = (message as Message).createMessageComponentCollector({
    //     idle: 20000,
    //     dispose: true,
    //     filter: async (i) =>
    //       i.user.id == interaction.user.id && ids.includes(i.customId),
    //   });

    //   collector.on("collect", async (i) => {
    //     try {
    //       await i.deferUpdate();
    //       if (collector.ended) return;
    //       collector.handleDispose(i);

    //       if (i.componentType === ComponentType.Button) {
    //         switch (i.customId) {
    //           case "first":
    //             index = 0;
    //             break;
    //           case "back":
    //             // Enable menu and buttons.
    //             index = menu.data.disabled
    //               ? index
    //               : index - 1 < 0
    //               ? roles.length - 1
    //               : index - 1;
    //             menu.setDisabled(false);
    //             buttons.forEach((button) => button.setDisabled(false));
    //             break;
    //           case "next":
    //             index = index + 1 >= roles.length ? 0 : index + 1;
    //             break;
    //           case "last":
    //             index = roles.length - 1;
    //             break;
    //         }

    //         menu.setOptions(...displayOptions(index));
    //         embed = displayRoles(index);
    //       }

    //       if (i.componentType === ComponentType.SelectMenu) {
    //         menu.options.forEach((option, idx) =>
    //           option.setDefault(idx == +(i as SelectMenuInteraction).values[0])
    //         );

    //         menu.setDisabled(true);
    //         buttons.forEach((button, i) => button.setDisabled(i != 1));
    //         embed = displayRoleInfo(
    //           roles[index][+(i as SelectMenuInteraction).values[0]]
    //         );
    //       }

    //       await interaction.editReply({
    //         embeds: [embed],
    //         components: [
    //           { type: 1, components: [menu] },
    //           { type: 1, components: buttons },
    //         ],
    //       });
    //     } catch (e) {
    //       handleError(e, i);
    //       collector.stop();
    //     }
    //   });

    //   collector.on("end", async (i) => {
    //     try {
    //       if (
    //         !interaction.channel?.messages.cache.get(`${collector?.messageId}`)
    //       )
    //         return;
    //       menu.setDisabled(true);
    //       buttons.forEach((button) => button.setDisabled(true));

    //       await interaction.editReply({
    //         components: [
    //           { type: 1, components: [menu] },
    //           { type: 1, components: buttons },
    //         ],
    //       });
    //     } catch (e) {
    //       handleError(e, interaction);
    //     }
    //   });

    //   function displayRoleInfo(role: any) {
    //     return {
    //       color: role.base10,
    //       author: {
    //         name: `${role.position}. ${role.name}`,
    //         url: `${role.iconURL ?? ""}`,
    //         iconURL: interaction.guild?.me?.displayAvatarURL() ?? "",
    //       },
    //       thumbnail: {
    //         url: role.iconURL ?? `${interaction.guild?.iconURL() ?? ""}`,
    //       },
    //       fields: [
    //         {
    //           name: `Active Users`,
    //           value: `${role.activeUsers}`,
    //           inline: true,
    //         },
    //         {
    //           name: "Created",
    //           value: role.created,
    //           inline: true,
    //         },
    //         {
    //           name: `Role Unicode Emoji`,
    //           value: `${role.unicodeEmoji ?? "None"}`,
    //           inline: true,
    //         },
    //         {
    //           name: "Base 10 Color",
    //           value: `${role.base10}`,
    //           inline: true,
    //         },
    //         {
    //           name: "Hex Color",
    //           value: `${role.hexColor}`,
    //           inline: true,
    //         },
    //         {
    //           name: "Hoisted",
    //           value: `${role.hoist}`,
    //           inline: true,
    //         },
    //         {
    //           name: `Editable`,
    //           value: `${role.editable}`,
    //           inline: true,
    //         },
    //         {
    //           name: `Mentionable`,
    //           value: `${role.mentionable}`,
    //           inline: true,
    //         },
    //         {
    //           name: `External`,
    //           value: `${role.managed}`,
    //           inline: true,
    //         },
    //       ],
    //       footer: {
    //         text: `Id: ${role.id}`,
    //       },
    //     };
    //   }

    //   function displayRoles(index: number) {
    //     return {
    //       author: {
    //         name: `${
    //           interaction.guild?.name ?? "This server's"
    //         } Roles (${size})`,
    //         iconUrl: interaction.guild?.iconURL(),
    //       },
    //       color: interaction.guild?.me?.displayColor || randomColor(),
    //       fields: roles[index].map((r: any) => r.fields),
    //     };
    //   }

    //   function displayOptions(index: number) {
    //     return roles[index].map((role: Role, i: number) => {
    //       const option = new SelectMenuOptionBuilder()
    //         .setLabel(`${role.name.substring(0, 99)}`)
    //         .setValue(`${i}`);

    //       if (role.unicodeEmoji) {
    //         option.setEmoji({ name: `${role.unicodeEmoji}` });
    //       }

    //       return option;
    //     });
    //   }

    //   function mutateData(role: Role) {
    //     return {
    //       base10: role.color,
    //       created: Formatters.time(role.createdAt, "F"),
    //       editable: role.editable,
    //       hexColor: role.hexColor,
    //       hoist: role.hoist,
    //       iconURL: role.iconURL({ size: 4096 }),
    //       activeUsers: role.members.size,
    //       managed: role.managed,
    //       mentionable: role.mentionable,
    //       name: role.name,
    //       id: role.id,
    //       position: role.position,
    //       unicodeEmoji: role.unicodeEmoji,
    //       fields: {
    //         name: `${role.position}. ${role.name}`,
    //         value: `${role}`,
    //         inline: true,
    //       },
    //     };
    //   }
    // }

    // async function edit(): Promise<string> {
    //   const role = interaction.options.getRole("role", true);
    //   const name = interaction.options.getString("name", true);
    //   const color = interaction.options.getString("color");
    //   const hoist = interaction.options.getBoolean("hoist");
    //   const mentionable = interaction.options.getBoolean("mentionable");
    //   const reason = interaction.options.getString("reason");
    //   const options: any = { name };
    //   const rejects: string[] = [];

    //   if (!name && !color && !hoist && !mentionable) {
    //     return "I'm missing a value to edit.";
    //   }

    //   options.hoist = hoist ? hoist : false;
    //   options.mentionable = mentionable ? mentionable : false;

    //   if (color) {
    //     if (color?.match(/(#?([A-Fa-f0-9]{6}))/g)) {
    //       options.color = color;
    //     } else {
    //       rejects.push(`${color} is not a valid hex color.`);
    //     }
    //   }

    //   const edit = await (role as Role)
    //     ?.edit(options, `${reason ?? ""}`)
    //     .catch((err) => err);

    //   if (!edit) {
    //     error.send(`Role Create: ${edit.message}`);
    //     return `Failed to create role. Reason: \*\*${edit.message}\*\*`;
    //   }

    //   let msg = `Successfully updated ${edit}`;

    //   msg += rejects.length > 0 ? `${rejects.join("")}.` : ".";
    //   return msg;
    // }
  },
};
