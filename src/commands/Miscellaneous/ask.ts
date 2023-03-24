import type { Command } from "../../types";

import { generateMessage } from "../../lib/OpenAI";
import BotError from "../../lib/classes/Error";
import { Bot } from "../..";
import {
 type ChatInputCommandInteraction,
 TextInputBuilder,
 ActionRowBuilder,
 ButtonBuilder,
 ModalBuilder,
 TextInputStyle,
 ButtonStyle,
} from "discord.js";


const REGENERATE_ID = "ask-new";
const EDIT_ID = "ask-edit";
const TEXT_ID = "ask-modalEditInput";

// const editButton = new ButtonBuilder({
//  customId: EDIT_ID,
//  style: ButtonStyle.Secondary,
//  label: "Edit",
// });

const row = new ActionRowBuilder<ButtonBuilder>().setComponents([
 new ButtonBuilder({
  customId: REGENERATE_ID,
  style: ButtonStyle.Primary,
  label: "Regenerate Response",
 }),
]);

const command: Command = {
 name: "ask",
 categories: ["Miscellaneous"],
 async buttons(interaction) {
  switch (interaction.customId) {
   case EDIT_ID:
    const modal = new ModalBuilder().setTitle("Edit Response").setCustomId("ask-modal");
    modal.setComponents(
     new ActionRowBuilder<TextInputBuilder>().setComponents(
      new TextInputBuilder({
       customId: TEXT_ID,
       label: "Edit Instructions",
       placeholder: "Fix the typos",
       maxLength: 1000,
       minLength: 1,
       required: true,
       style: TextInputStyle.Paragraph,
      })
     )
    );
    return await interaction.showModal(modal);
   case REGENERATE_ID:
    await interaction.deferReply();
    const prompt = Bot.openai.get(interaction.message.id);
    if (!prompt) throw new BotError({ message: "Unable to find prompt" });
    const response = await generateMessage(prompt.prompt);
    const msg = await interaction.editReply({
     content: response[0],
     components: [row],
    });

    Bot.openai.set(msg.id, {
     prompt: prompt.prompt,
     id: msg.id,
     expiresAt: Date.now() + 3_600_000,
    });

    Bot.openai
     .filter((prompt) => prompt.expiresAt < Date.now())
     .forEach((prompt) => {
      Bot.openai.delete(prompt.id);
     });
  }
 },
 async modals(interaction) {
  // TODO: fix response
  const message = interaction.message?.content;
  if (!message) throw new BotError({ message: "Unable to read message" });

  const prompt = Bot.openai.get(`${interaction.message?.id}`);
  if (!prompt) throw new BotError({ message: "Unable to find prompt" });
  await interaction.deferReply();
  const instructions = interaction.fields.getTextInputValue(TEXT_ID);

  const generate = `Edit this prompt ${prompt.prompt} by ${instructions}`;
  const response = await generateMessage(generate);

  const msg = await interaction.editReply({
   content: response[0],
   components: [row],
  });

  Bot.openai.set(msg.id, { id: msg.id, prompt: generate, expiresAt: Date.now() + 3_600_000 });
  Bot.openai
   .filter((prompt) => prompt.expiresAt < Date.now())
   .forEach((prompt) => {
    Bot.openai.delete(prompt.id);
   });
 },
 async execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const prompt = interaction.options.getString("prompt", true);
  const response = await generateMessage(prompt);
  const msg = await interaction.editReply({ content: response[0], components: [row] });
  Bot.openai.set(msg.id, { id: msg.id, prompt, expiresAt: Date.now() + 3_600_000 });
 },
};

export default command;
