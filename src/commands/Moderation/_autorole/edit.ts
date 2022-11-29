import { ChatInputCommandInteraction, escapeMarkdown, Message, TextChannel } from "discord.js";
import BotError from "../../../lib/classes/Error";
import getColor from "../../../lib/color";
import { CollectMessage } from "./create";

export const run = async (interaction, autorole, channel, message) => {
 let embedded = interaction.options.getBoolean("embedded") ?? false;
 let edit = interaction.options.get("content") ?? false;

 let response: any = message.content && message.content.length > 0 ? message.content : message.embeds[0].description;

 if (!response || response.length === 0) throw new BotError({ message: "Somehow, the message is empty." });
 await message.edit({ content: `${response}`, embeds: [] });

 if (edit) {
  await interaction.followUp("Edited autorole.");
 } else {
  await interaction.editReply("Edited autorole.");
 }
};
