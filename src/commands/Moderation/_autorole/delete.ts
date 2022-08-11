import { Autorole } from "@prisma/client";
import { ChatInputCommandInteraction } from "discord.js";
import BotError from "../../../lib/classes/Error";
import prisma from "../../../lib/prisma";
import { BotGuild } from "../../../types";

type Params = (i: ChatInputCommandInteraction, a: Autorole, G: BotGuild) => void;
export const run: Params = async (interaction, autorole, guild) => {
 if (!interaction.guildId) throw new BotError({ message: "There was an error deleting this autorole." });

 await prisma.autorole.delete({
  where: {
   guildId_messageId_channelId: {
    messageId: autorole.messageId,
    guildId: autorole.guildId,
    channelId: autorole.channelId,
   },
  },
 });

 guild.autoroles = guild.autoroles.filter((a) => {
  return a.messageId !== autorole.messageId && a.guildId !== autorole.guildId && a.channelId !== autorole.channelId;
 });

 await interaction.editReply(`Sucessfully deleted the autorole \*\*\*${autorole.messageTitle}\*\*\*`);
};
