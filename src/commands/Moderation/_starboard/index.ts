import { ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import BotError from "../../../lib/classes/Error";
import prisma from "../../../lib/prisma";
import { BotGuild } from "../../../types";

export default async function (interaction: ChatInputCommandInteraction, guild: BotGuild) {
 if (!interaction.guildId) throw new BotError({ message: `We couldn't find this guild.` });
 const subcommand = interaction.options.getSubcommand(true);

 // Delete starboard.
 if (subcommand === "remove") {
  if (!interaction.guildId) throw new BotError({ message: `We couldn't find this guild.` });
  guild.channels = guild.channels.filter((channel) => channel.type !== "STARBOARD");
  await prisma.channel.deleteMany({ where: { guildId: interaction.guildId, type: "STARBOARD" } });
  await interaction.editReply(`Removed starboard.`);
  return;
 }

 // Set starboard
 const channel = interaction.options.getChannel("channel", true);
 const starRole = interaction.options.getRole("can_star");
 let idx = null;
 const starboard = guild.channels.find((channel, i) => {
  if (channel.type === "STARBOARD") {
   idx = i;
   return true;
  }
  return false;
 });
 if (channel.id === starboard?.channelId)
  throw new BotError({ message: `${channel.name} is already being used as the starboard.` });

 const permissions = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages];
 if (!interaction.guild?.members?.me?.permissionsIn(channel.id).has(permissions)) {
  throw new BotError({ message: `I do not have the View Channel or Send Messages permissions for ${channel}` });
 }

 const sb = await prisma.channel.upsert({
  where: { id: starboard?.id },
  update: { role: starRole?.id ?? null, channelId: channel.id },
  create: {
   guildId: interaction.guildId,
   role: starRole?.id ?? null,
   channelId: channel.id,
   type: "STARBOARD",
  },
 });

 if (!starboard) {
  guild.channels.push(sb);
 } else {
  if (typeof idx == "number") {
   guild.channels[idx] = sb;
  } else {
   throw new BotError({ message: "There was an error updating the starboard." });
  }
 }
 await interaction.editReply(`${channel.name} will now be used as a starboard.`);
}
