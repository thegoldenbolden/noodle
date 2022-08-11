import { Role } from "discord.js";
import { loadGuild } from "../../lib/database";
import error from "../../lib/error";
import prisma from "../../lib/prisma";

export default {
 name: "roleDelete",
 async execute(role: Role) {
  if (!role || !role.id || !role.guild.id) return;
  try {
   const guild = await loadGuild(role.guild);
   if (!guild) return;
   const autoroles = guild.autoroles;
   if (!autoroles || autoroles.length === 0) return;
   const roles = autoroles
    .filter((a) => a.roleIds.includes(role.id))
    .map((a) => `[${a.messageTitle}](https://discord.com/channels/${a.guildId}/${a.channelId}/${a.messageId})`);

   if (roles.length > 0) {
    const r = roles.join(", ");
    await prisma.notification.create({
     data: {
      guildId: role.guild.id,
      title: `Role from Autorole Menu Deleted`,
      message: `The role ${role.name} was deleted and is included in the following autoroles: ${r}.`,
     },
    });
   }
  } catch (err: any) {
   error(err, null);
  }
 },
};
