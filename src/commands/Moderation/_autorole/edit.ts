import { Autorole } from "@prisma/client";
import { ChatInputCommandInteraction, escapeMarkdown, Message, TextChannel } from "discord.js";
import BotError from "../../../lib/classes/Error";
import getColor from "../../../lib/color";
import { CollectMessage } from "./create";

type Params = (i: ChatInputCommandInteraction, A: Autorole, C: TextChannel, M: Message<boolean>) => void;
export const run: Params = async (interaction, autorole, channel, message) => {
 let embedded = interaction.options.getBoolean("embedded") ?? false;
 let edit = interaction.options.get("content") ?? false;

 let response: any = message.content && message.content.length > 0 ? message.content : message.embeds[0].description;

 if (edit) {
  let content: string | null = null;
  if (message.content) content = escapeMarkdown(message.content);
  if (message.embeds[0]) content = escapeMarkdown(message.embeds[0].description as string);
  if (!content) throw new BotError({ message: "We were unable to get the content of the message." });
  await interaction.editReply(`${content}`);

  response = await CollectMessage(interaction, {
   message:
    "Please enter a message for the autorole. The message above should show the previous autorole message if you need to copy and make changes. After 5 minutes, we will no longer wait for a message.\nType **cancel** to quit.",
  });

  if (response.error) throw new BotError({ message: response.error });
  if (response.message?.trim().length == 0) throw new BotError({ message: "Message cannot be empty." });
  response = response.message;
 }

 if (!response || response.length === 0) throw new BotError({ message: "Somehow, the message is empty." });
 if (embedded) {
  await message.edit({
   content: null,
   embeds: [
    {
     color: getColor(interaction.guild?.members?.me),
     description: `${response}`,
     author: {
      name: autorole.messageTitle ?? "Autorole",
      icon_url: interaction.guild?.iconURL() ?? undefined,
     },
    },
   ],
  });
 } else {
  await message.edit({ content: `${response}`, embeds: [] });
 }

 if (edit) {
  await interaction.followUp("Edited autorole.");
 } else {
  await interaction.editReply("Edited autorole.");
 }
};
