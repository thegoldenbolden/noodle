import {
 APIEmbed,
 ButtonStyle,
 ChannelType,
 ComponentType,
 Role,
 SelectMenuComponentData,
 SelectMenuComponentOptionData,
 SelectMenuInteraction,
 time,
} from "discord.js";
import BotError from "../../lib/classes/Error";
import getColor from "../../lib/color";
import { basicCollector, createButtons } from "../../lib/discord/collectors";
import split from "../../lib/split";
import { Command } from "../../types";

export default {
 name: "server",
 categories: ["Utility"],
 execute: async (interaction) => {
  await interaction.deferReply();
  const guild = interaction.guild;
  if (!guild) throw new BotError({ message: `We were unable to find guild.` });

  const view = interaction.options.getString("view");
  switch (view) {
   default:
    await getGeneral();
    return;
   case "roles":
    await getRoles();
    return;
  }

  async function getGeneral() {
   if (!guild) return { description: `We were unable to find this server's information.` };
   const title = `${guild.verified ? "✅ " : ""}${guild.partnered ? "🤝 " : ""}${guild.name}`;
   const members = `${guild.memberCount} members.`;

   function addChannels(types: ChannelType[]) {
    let i = "";
    types.forEach((type, idx) => {
     const channel = guild!.channels.cache.filter((channel) => channel.type === type);
     if (channel.size === 0) return "";

     const keys: { [key: number]: string } = {
      0: "Text",
      2: "Voice",
      4: "Category",
      5: "Announcement",
      10: "Announcement Thread",
      11: "Public Thread",
      12: "Private Thread",
      13: "Stage",
      14: "Directory",
      15: "Forum",
     };

     i += `\*\*${channel.size}\*\* ${keys[type]}${idx == types.length - 1 ? "." : ", "} `;
    });

    return i;
   }

   const channels = addChannels([0, 2, 4, 5, 10, 11, 12, 13, 14, 15]);
   const animated = guild.emojis.cache.filter((emoji) => emoji.animated ?? false).size;
   const png = guild.emojis.cache.size - animated;

   const roles = guild.roles.cache.size;
   const colored = guild.roles.cache.filter((role) => role.color != 0).size;

   const emojis =
    `${animated} animated emojis, ${png} static emojis, ` +
    `${colored} color roles, ${roles - colored} other roles ` +
    `and ${guild.stickers.cache.size} stickers`;

   const boosts = `Level ${guild.premiumTier} • ${guild.premiumSubscriptionCount} member(s) boosted.`;

   const embed: APIEmbed = {
    title,
    color: getColor(interaction.guild?.members.me),
    description: guild.description ?? undefined,
    thumbnail: { url: guild.iconURL() ?? "" },
    fields: [
     { name: "Members", value: members, inline: false },
     { name: `Emojis (${guild.emojis.cache.size}), Roles (${roles}) & Stickers`, value: emojis, inline: false },
     { name: `Channels (${guild.channels.cache.size})`, value: channels, inline: false },
     { name: `Features (${guild?.features?.length ?? 0})`, value: `${capitalize(guild?.features)}`, inline: false },
     { name: "Boosts", value: boosts },
     { name: "Created", value: time(guild.createdAt, "F"), inline: false },
    ],
   };

   if (guild.bannerURL()) {
    embed.image = {
     url: guild.bannerURL() ?? "",
     height: 4096,
     width: 4096,
    };
   }

   await interaction.editReply({ embeds: [embed] });

   function capitalize(array: string[]) {
    if (!array || array.length === 0) return "None";

    array.forEach((word, i) => {
     let x = word.split(/_+|\s+/g);
     x.forEach((w, idx) => {
      x[idx] = w[0].toUpperCase() + w.substring(1).toLowerCase();
     });

     array[i] = x.join(" ");
    });

    return array.join(", ");
   }
  }

  async function getRoles() {
   let roles: any =
    interaction.guild?.roles.cache.filter((r) => r.name != "@everyone").sort((a, b) => b.position - a.position) ?? null;
   if (!roles || roles.size == 0) throw new BotError({ message: "We were unable to get this server's roles." });
   const size = roles.size;
   roles = split(roles, 9, mutateData);

   let ids = ["first", "back", "next", "last"];
   const { buttons, customIds } = createButtons(interaction, ids, ids, ButtonStyle.Secondary);
   ids = [`mroles.${interaction.id}`, ...customIds];

   const menu: SelectMenuComponentData = {
    type: ComponentType.SelectMenu,
    customId: `mroles.${interaction.id}`,
    maxValues: 1,
    minValues: 1,
    options: displayOptions(0),
   };

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
       case ids[1]:
        buttons[0].disabled = true;
        buttons[1].disabled = true;
        buttons[2].disabled = false;
        buttons[3].disabled = false;
        index = 0;
        break;
       case ids[2]:
        // Enable menu and buttons.
        index = menu.disabled ? index : index - 1 < 0 ? roles.length - 1 : index - 1;
        menu.disabled = false;
        buttons[0].disabled = index == 0;
        buttons[1].disabled = index == 0;
        buttons[2].disabled = false;
        buttons[3].disabled = false;
        break;
       case ids[3]:
        index = index + 1 >= roles.length ? 0 : index + 1;
        buttons[0].disabled = false;
        buttons[1].disabled = false;
        buttons[2].disabled = index + 1 >= roles?.length;
        buttons[3].disabled = index + 1 >= roles?.length;
        break;
       case ids[4]:
        buttons[0].disabled = false;
        buttons[1].disabled = false;
        buttons[2].disabled = true;
        buttons[3].disabled = true;
        index = roles.length - 1;
        break;
      }

      menu.options = displayOptions(index);
      embed = displayRoles(index);
     }

     if (i.isSelectMenu()) {
      menu.options?.forEach((option, idx) => (option.default = idx == +(i as SelectMenuInteraction).values[0]));
      menu.disabled = true;
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
     const option: SelectMenuComponentOptionData = {
      label: `${role.name.substring(0, 99)}`,
      value: `${i}`,
     };

     if (role.unicodeEmoji) {
      option.emoji = { name: `${role.unicodeEmoji}` };
     }

     return option;
    });
   }

   function mutateData(role: Role) {
    return {
     base10: role.color,
     created: time(role.createdAt, "F"),
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
 },
} as Command;
