import { ChatInputCommandInteraction, Message, TextChannel, Util } from "discord.js";
import PastaError from "../../../utils/classes/Error";
import { getColor } from "../../../utils/functions/helpers";
import { Autorole } from "../../../utils/typings/database";
import { CollectMessage } from "./create";

type Params = (i: ChatInputCommandInteraction, A: Autorole, C: TextChannel, M: Message<boolean>) => void;
export const run: Params = async (interaction, autorole, channel, message) => {
 let embed = interaction.options.getBoolean("embed");
 embed = embed == null ? false : embed;
 let content: string = "";

 if (message.content) {
  content = Util.escapeMarkdown(message.content);
 }

 if (message.embeds[0]) {
  content = Util.escapeMarkdown(message.embeds[0].description as string);
 }

 await interaction.editReply(`${content}`);

 const response = await CollectMessage(interaction, {
  message:
   "Please enter a message for the autorole. After 5 minutes, we will no longer wait for a message.\nType **cancel** to quit.",
  type: "msg",
 });

 if (response.error) throw new PastaError({ message: response.error });
 if (response.message?.trim().length == 0) throw new PastaError({ message: "Message cannot be empty." });

 if (embed) {
  await message.edit({
   content: undefined,
   embeds: [
    {
     color: getColor(interaction.guild?.members?.me),
     description: response.message,
     author: {
      name: autorole.message_title ?? "Autorole",
      icon_url: interaction.guild?.iconURL() ?? undefined,
     },
    },
   ],
  });
 } else {
  await message.edit({
   content: `${response.message}`,
   embeds: [],
  });
 }
};
