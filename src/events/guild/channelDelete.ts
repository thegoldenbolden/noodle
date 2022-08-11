import { ChannelType, DMChannel, GuildChannel } from "discord.js";
import { loadGuild } from "../../lib/database";
import error from "../../lib/error";
import prisma from "../../lib/prisma";

export default {
 name: "channelDelete",
 async execute(channel: DMChannel | GuildChannel) {
  if (!channel || !channel.id || channel.type == ChannelType.DM) return;
  if (!channel.guild || !channel.guild.available || !channel.guildId) return;
  try {
   const guild = await loadGuild(channel.guild);
   if (!guild) return;

   const remainingAutoroles = guild.autoroles.filter((a) => a.channelId !== channel.id && a.guildId !== channel.guildId);
   const remainingChannels = guild.channels.filter((c) => c.channelId !== channel.id && c.guildId !== channel.guildId);

   if (remainingAutoroles.length !== guild.autoroles.length) {
    guild.autoroles = remainingAutoroles;
    await prisma.autorole.deleteMany({ where: { channelId: channel.id, guildId: channel.guildId } });
   }

   if (remainingChannels.length !== guild.channels.length) {
    guild.channels = remainingChannels;
    await prisma.channel.deleteMany({ where: { channelId: channel.id, guildId: channel.guildId } });
   }
  } catch (err) {
   error(err as any, null);
  }
 },
};
