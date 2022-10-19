import { Guild } from "discord.js";
import { useError } from "../../lib/log";
import prisma from "../../lib/prisma";

export default {
 name: "guildDelete",
 async execute(guild: Guild) {
  try {
   await prisma.guild.delete({ where: { guildId: guild.id } });
  } catch (err) {
   useError(err as any, null);
  }
 },
};
