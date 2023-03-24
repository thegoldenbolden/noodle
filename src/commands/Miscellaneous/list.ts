import type { Command } from "../../types";
import { ChatInputCommandInteraction } from "discord.js";
import { shuffle } from "lodash";

const command: Command = {
 name: "list",
 categories: ["Miscellaneous"],
 async execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const list: string[] = interaction.options.data.map((option: any) => option.value as string);
  await interaction.editReply(`${shuffle(list)[0]?.substring(0, 3000)}`);
 },
};

export default command;
