import { Autorole } from "@prisma/client";
import { APISelectMenuComponent, ComponentType } from "discord-api-types/v10";
import { Message, TextChannel } from "discord.js";
import { checkSend } from ".";
import BotError from "../../../lib/classes/Error";
import prisma from "../../../lib/prisma";
import { InteractionIds } from "../../../types";
import { I, R } from "./add";

type Params = (i: I, A: Autorole, C: TextChannel, R: R, M: Message<boolean>) => void;
export const run: Params = async (interaction, autorole, channel, roles, message) => {
 if (!roles) throw new BotError({ message: "We couldn't find the roles provided" });

 if (roles.map((r) => r?.id).some((r: any) => !autorole.roleIds.includes(r))) {
  throw new BotError({ message: `A role provided isn't being used.` });
 }

 checkSend(interaction, channel);

 const index: number[] = [];
 const rolesRemaining = autorole.roleIds.filter((r, i) => {
  if (roles.has(r)) {
   index.push(i);
   return false;
  }
  return true;
 });

 if (rolesRemaining.length == 0) throw new BotError({ message: "We cannot remove every role on this autorole message." });

 let options: any = {};

 const component = message.resolveComponent(InteractionIds.Autorole)?.data;
 if (!component) throw new BotError({ message: "We were unable to find the menu." });
 let opts = (component as APISelectMenuComponent).options.filter((opt) => rolesRemaining.includes(opt.value));
 if (opts.length <= 0) throw new BotError({ message: "There needs to be at least one role on the menu." });

 options.components = [
  {
   type: ComponentType.ActionRow,
   components: [
    {
     ...component,
     max_values: opts.length,
     options: opts,
    },
   ],
  },
 ];

 checkSend(interaction, channel);
 await prisma.autorole.update({
  data: { roleIds: rolesRemaining },
  where: {
   guildId_messageId_channelId: {
    messageId: autorole.messageId,
    guildId: autorole.guildId,
    channelId: autorole.channelId,
   },
  },
 });

 autorole.roleIds = rolesRemaining;

 await message.edit(options);
 await interaction.editReply(`Successfully removed roles from \*\*\*${autorole.messageTitle}\*\*\*.`);
};
