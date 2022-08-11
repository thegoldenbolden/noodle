import { Guild } from "discord.js";
import error from "../../lib/error";
import prisma from "../../lib/prisma";

export default {
 name: "guildDelete",
 async execute(guild: Guild) {
  try {
   await prisma.guild.delete({ where: { guildId: guild.id } });
  } catch (err) {
   error(err as any, null);
  }
 },
};
