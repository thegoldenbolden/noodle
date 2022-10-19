import { Guild, Message } from "discord.js";
import { loadGuild } from "../../lib/database";
import { useError } from "../../lib/log";
import prisma from "../../lib/prisma";

export default {
 name: "messageDelete",
 async execute(message: Message) {
  if (!message.guild || !message.guild.available || !message.guildId) return;

  try {
   const { autoroles } = await loadGuild({ id: message.guildId } as Guild);
   if (!autoroles || autoroles.length === 0) return;
   const toDelete = autoroles.find((a) => a.messageId === message.id && a.channelId === message.channelId);
   if (!toDelete) return;

   await prisma.autorole.delete({
    where: {
     guildId_messageId_channelId: {
      messageId: toDelete.messageId,
      channelId: toDelete.channelId,
      guildId: toDelete.guildId,
     },
    },
   });

   const roles: string[] = [];
   toDelete.roleIds.forEach((role) => {
    const r = message.guild?.roles.cache.get(role);
    if (r) {
     roles.push(`\`\`${r.name}\`\``);
    } else {
     roles.push(`\`\`Role Id: ${role}\`\``);
    }
   });

   await prisma.notification.create({
    data: {
     guildId: message.guildId,
     title: "Autorole Message Deleted",
     message: `The autorole message ${toDelete.messageTitle} was deleted and included the roles: ${roles.join(", ")}`,
    },
   });
  } catch (err) {
   useError(err as any, null);
  }
 },
};
