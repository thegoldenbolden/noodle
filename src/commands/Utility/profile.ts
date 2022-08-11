import { User } from "@prisma/client";
import {
 APIEmbed,
 ChatInputCommandInteraction,
 ComponentType,
 GuildMember,
 SelectMenuComponentData,
 time,
 UserContextMenuCommandInteraction,
} from "discord.js";
import BotError from "../../lib/classes/Error";
import getColor from "../../lib/color";
import prisma from "../../lib/prisma";
import { BotUser, Command } from "../../types";

export default {
 name: "profile",
 categories: ["Utility"],
 cooldown: 5,
 database: "User",
 execute: async (interaction, user) => {
  await interaction.deferReply({ ephemeral: true });
  if (interaction.isUserContextMenuCommand()) {
   let member = interaction.targetMember as GuildMember | null;
   if (!member) throw new BotError({ message: "We were unable to find the user." });
   await view(member);
   return;
  }

  const subcommand = interaction.options.getSubcommand(true);
  switch (subcommand) {
   default:
   case "view":
    await view(interaction.options.getMember("user") as GuildMember);
    return;
   case "privacy":
    await toggle(interaction, user);
    return;
  }

  async function view(member: GuildMember) {
   if (!member) throw new BotError({ message: "We were unable to find that user." });
   if (member.user.bot) throw new BotError({ message: "Bots are banned in Noodle Land." });

   const embeds = {
    color: getColor(member),
    title: member.displayName ?? member.user.username ?? "Mystery User",
    thumbnail: { url: member.displayAvatarURL({ size: 4096 }) ?? "" },
   };

   const menu: SelectMenuComponentData = {
    customId: `profile-${interaction.id}`,
    type: ComponentType.SelectMenu,
    maxValues: 1,
    minValues: 1,
    options: [
     {
      default: true,
      label: "Discord",
      value: "discord",
     },
     {
      default: false,
      label: "Noodian",
      value: "noodian",
     },
    ],
   };

   const message = await interaction.editReply({
    embeds: [{ ...embeds, ...discordProfile(member) }],
    components: [
     {
      type: ComponentType.ActionRow,
      components: [menu],
     },
    ],
   });

   const collector = message.createMessageComponentCollector({
    componentType: ComponentType.SelectMenu,
    filter: (i) => i.user.id === interaction.user.id && i.customId === `profile-${interaction.id}`,
    idle: 30000,
    time: 120000,
   });

   collector.on("collect", async (i) => {
    await i.deferUpdate();
    menu.options?.forEach((o) => (o.default = o.value == i.values[0]));
    let embed: APIEmbed = { ...embeds };
    switch (i.values[0]) {
     default:
     case "discord":
      embed = { ...embed, ...discordProfile(member as GuildMember) };
      break;
     case "noodian":
      embed = { ...embed, ...(await noodleProfile(member as GuildMember)) };
    }

    await i.editReply({ embeds: [embed], components: [{ type: ComponentType.ActionRow, components: [menu] }] });
   });

   collector.on("end", (i, reason) => {
    if (reason !== "time" && reason !== "idle") return;
    interaction.editReply({
     components: [
      {
       type: ComponentType.ActionRow,
       components: [{ ...menu, disabled: true }],
      },
     ],
    });
   });
  }

  async function toggle(interaction: ChatInputCommandInteraction, user: BotUser) {
   const setting = interaction.options.getString("privacy");
   let msg = "";
   switch (setting) {
    default:
    case "private":
     user.private = !user.private;
     await prisma.user.update({ where: { discordId: user.discordId }, data: { private: user.private } });
     msg = `Your profile is now ${user.private ? "hidden" : "visible"}.`;
     break;
   }
   await interaction.editReply(msg);
  }

  function discordProfile(member: GuildMember): APIEmbed {
   const flagName: string[] = [];
   member.user.flags?.toArray().forEach((e) => {
    switch (e) {
     default:
      return;
     case "PremiumEarlySupporter":
      flagName.push("Early Nitro Supporter");
      return;
     case "BugHunterLevel1":
      flagName.push("Bug Hunter Lv 1");
      return;
     case "BugHunterLevel2":
      flagName.push("Bug Hunter Lv 2");
      return;
     case "Partner":
      flagName.push("Partnered Server Owner");
      return;
     case "Staff":
      flagName.push("Staff");
      return;
     case "HypeSquadOnlineHouse1":
      flagName.push("House Brilliance");
      return;
     case "HypeSquadOnlineHouse2":
      flagName.push("House Bravery");
      return;
     case "HypeSquadOnlineHouse3":
      flagName.push("House Balance");
      return;
     case "VerifiedDeveloper":
      flagName.push("Verified Bot Developer");
      return;
     case "CertifiedModerator":
      flagName.push("Certified Moderator");
      return;
     case "Spammer":
      flagName.push("Spammer");
      return;
    }
   });

   let status: string | undefined = member.presence?.status;
   status = status == "dnd" ? "⛔" : status == "idle" ? "🌙" : status == "online" ? "🟢" : "🔵";
   return {
    fields: [
     { name: `\`Username\``, value: `${member.user.tag ?? member.user.username ?? "Some name"}`, inline: true },
     {
      name: `\`${status} ${member.presence?.status.toUpperCase() ?? "??"}\``,
      value: `${member.presence?.activities[0]?.name ?? "Existing Somewhere"}`,
      inline: true,
     },
     { name: `\`Flags\``, value: `${flagName.length == 0 ? "None" : flagName.join(", ")}`, inline: true },
     { name: `\`Role Color\``, value: `${member.displayHexColor ?? "N/A"}`, inline: true },
     {
      name: `\`Roles (${member.roles.cache.size})\``,
      value: `${member.roles.cache.find((r) => r.color === member.displayColor && r.color != 0) ?? member.roles.highest}`,
      inline: true,
     },
     { name: `\`Joined\``, value: member.joinedAt ? `${time(member.joinedAt, "F")}` : "Sometime", inline: false },
     { name: `\`Boosting Since\``, value: member.premiumSince ? `${time(member.premiumSince, "F")}` : "Never", inline: false },
    ],
   };
  }

  async function getProfile(member: GuildMember): Promise<User | null> {
   const search = await prisma.user.findFirstOrThrow({ where: { discordId: member.user.id, private: false } }).catch((e) => e);
   if (search.name == "NotFoundError") return null;
   return search;
  }

  async function noodleProfile(member: GuildMember): Promise<APIEmbed> {
   let profile: User | null = null;

   // If checking own profile, use cache else find public profile from database.
   profile = member.user.id === interaction.user.id ? user : await getProfile(member);
   if (!profile) return { title: member.displayName, color: getColor(member), description: `This user flies private.` };

   let { downvotesReceived, upvotesReceived, downvotesGiven, upvotesGiven } = profile;
   const chaos = downvotesReceived + downvotesGiven > upvotesReceived + upvotesGiven ? "Chaotic" : "Lawful";
   const getPercentage = (x: number) => x / (downvotesGiven + upvotesGiven);
   const downvotes = getPercentage(downvotesGiven);
   const upvotes = getPercentage(upvotesGiven);
   const difference = Math.abs(downvotes - upvotes);
   const rep = downvotes > upvotes && difference > 0.25 ? "Evil" : upvotes > downvotes && difference > 0.25 ? "Good" : "Neutral";

   return {
    fields: [
     { name: "Noodles", value: `${profile.noodles}`, inline: true },
     { name: "Reputation", value: `${chaos} ${rep}`, inline: true },
     { name: "Noodianship", value: `${time(profile.createdAt, "F")}, ${time(profile.createdAt, "R")}` },
    ],
   };
  }
 },
} as Command & { execute: (interaction: UserContextMenuCommandInteraction, user: BotUser) => void };
