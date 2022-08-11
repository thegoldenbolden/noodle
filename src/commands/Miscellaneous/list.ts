import { shuffle } from "lodash";
import { Command } from "../../types";

export default {
 name: "list",
 categories: ["Miscellaneous"],
 execute: async (interaction) => {
  await interaction.deferReply();
  const list: string[] = interaction.options.data.map((option: any) => option.value as string);
  await interaction.editReply(`${shuffle(list)[0]?.substring(0, 3000)}`);
 },
} as Command;
