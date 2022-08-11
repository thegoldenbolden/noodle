import { Autorole } from "@prisma/client";
import {
 APIRole,
 APISelectMenuComponent,
 ChatInputCommandInteraction,
 Collection,
 ComponentType,
 Message,
 Role,
 SelectMenuComponentOptionData,
 TextChannel,
} from "discord.js";
import { checkSend } from ".";
import BotError from "../../../lib/classes/Error";
import prisma from "../../../lib/prisma";
import { InteractionIds } from "../../../types";

export type I = ChatInputCommandInteraction;
export type R = Collection<string, Role | APIRole | null>;
type Params = (i: I, A: Autorole, C: TextChannel, R: R, M: Message<boolean>) => void;
export const run: Params = async (interaction, autorole, channel, roles, message) => {
 if (!roles) {
  throw new BotError({
   message: "We couldn't find the roles provided",
   log: true,
   info: "No discord roles from a required argument.",
  });
 }

 if (roles.map((r) => r?.id).some((r: any) => autorole.roleIds.includes(r))) {
  throw new BotError({ message: `A role provided is already being used.` });
 }

 let options: any = {};
 const component = message.resolveComponent(InteractionIds.Autorole)?.data;
 if (!component) {
  throw new BotError({
   message: "We were unable to find the menu.",
   log: true,
   command: "Autorole Add",
   info: "Unable to find menu",
  });
 }

 let opts: SelectMenuComponentOptionData[] = [
  ...(component as APISelectMenuComponent).options,
  ...roles.map((role) => {
   return {
    label: role?.name ?? "Unknown Role Name",
    value: role?.id ?? "Unknown Role Id",
    emoji: (role as Role)?.unicodeEmoji ?? undefined,
   };
  }),
 ];

 if (opts.length > 25) throw new BotError({ message: "There can only 25 roles on a menu." });
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

 const roleIds: any = [...new Set([...autorole.roleIds, ...roles.map((r) => r?.id)])];
 await prisma.autorole.update({
  data: { roleIds },
  where: {
   guildId_messageId_channelId: {
    messageId: autorole.messageId,
    guildId: autorole.guildId,
    channelId: autorole.channelId,
   },
  },
 });

 autorole.roleIds = roleIds;
 checkSend(interaction, channel);
 await message.edit(options);
 await interaction.editReply(`Successfully added roles to \*\*\*${autorole.messageTitle}\*\*\*.`);
};
