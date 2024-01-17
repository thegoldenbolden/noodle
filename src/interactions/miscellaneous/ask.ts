import type { Command } from "../../types";
import { BotError } from "../../lib/error";
import { Bot, openai } from "../..";
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

const row = new ActionRowBuilder<ButtonBuilder>().setComponents([
 new ButtonBuilder({
  customId: REGENERATE_ID,
  style: ButtonStyle.Primary,
  label: "Regenerate",
 }),
]);

// const editButton = new ButtonBuilder({
//  customId: EDIT_ID,
//  style: ButtonStyle.Secondary,
//  label: "Edit",
// });

const command: Command = {
 name: "ask",
 categories: ["Miscellaneous"],
 async buttons(interaction) {
  switch (interaction.customId) {
   case EDIT_ID:
    const modal = new ModalBuilder().setTitle("Edit").setCustomId("ask-modal");

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
    await interaction.showModal(modal);
    return;
   case REGENERATE_ID:
    await interaction.deferReply();
    const prompt = Bot.openai.get(interaction.message.id);

    if (!prompt) {
     throw new BotError({ message: "Unable to find prompt" });
    }

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
  if (!message) {
   throw new BotError({ message: "Unable to read message" });
  }

  const prompt = Bot.openai.get(`${interaction.message?.id}`);
  if (!prompt) {
   throw new BotError({ message: "Unable to find prompt" });
  }

  await interaction.deferReply();
  const instructions = interaction.fields.getTextInputValue(TEXT_ID);

  const generate = `Edit this prompt ${prompt.prompt} by ${instructions}`;
  const response = await generateMessage(generate);

  const msg = await interaction.editReply({
   content: response[0],
   components: [row],
  });

  Bot.openai.set(msg.id, {
   id: msg.id,
   prompt: generate,
   expiresAt: Date.now() + 3_600_000,
  });
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

  const msg = await interaction.editReply({
   content: response[0],
   components: [row],
  });

  Bot.openai.set(msg.id, {
   id: msg.id,
   prompt,
   expiresAt: Date.now() + 3_600_000,
  });
 },
};

async function generateMessage(prompt: string) {
 const response = await openai.chat.completions.create({
  model: "gpt-4-1106-preview",
  messages: [{ role: "user", content: prompt }],
  temperature: 0.7,
  max_tokens: 300,
  stream: false,
 });

 const content = response.choices.filter((choice) => choice.message.content);
 const messages = content.map((content) => content.message.content);

 return messages;
}

export default command;
