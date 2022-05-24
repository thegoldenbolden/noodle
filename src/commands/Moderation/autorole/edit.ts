import { ChatInputCommandInteraction, Message, TextChannel, Util } from "discord.js";
import PastaError from "../../../utils/classes/Error";
import { getColor } from "../../../utils/functions/helpers";
import { Autorole } from "../../../utils/typings/database";
import { CollectMessage } from "./create";

type Params = (i: ChatInputCommandInteraction, A: Autorole, C: TextChannel, M: Message<boolean>) => void;
export const run: Params = async (interaction, autorole, channel, message) => {
 let embed = interaction.options.getBoolean("embed");
 let msg = interaction.options.getBoolean("message");

 if (embed === null && msg === null) {
  throw new PastaError({ message: "We need something to change." });
 }

 embed = embed == null ? false : embed;
 let content: string = "";

 if (message.content) {
  content = Util.escapeMarkdown(message.content);
 }

 if (message.embeds[0]) {
  content = Util.escapeMarkdown(message.embeds[0].description as string);
 }

 await interaction.editReply(`${content}`);

 let response: any = message.content ?? message.embeds[0].description;
 if (msg) {
  response = await CollectMessage(interaction, {
   message:
    "Please enter a message for the autorole. The message above should show the previous autorole message if you need to copy and make changes. After 5 minutes, we will no longer wait for a message.\nType **cancel** to quit.",
   type: "msg",
  });

  if (response.error) throw new PastaError({ message: response.error });
  if (response.message?.trim().length == 0) throw new PastaError({ message: "Message cannot be empty." });
  response = response.message;
 }

 if (!response || response.length === 0) throw new PastaError({ message: "Somehow, the message is empty." });
 if (embed) {
  await message.edit({
   content: null,
   embeds: [
    {
     color: getColor(interaction.guild?.members?.me),
     description: `${response}`,
     author: {
      name: autorole.message_title ?? "Autorole",
      icon_url: interaction.guild?.iconURL() ?? undefined,
     },
    },
   ],
  });
 } else {
  await message.edit({
   content: `${response}`,
   embeds: [],
  });
 }
};
