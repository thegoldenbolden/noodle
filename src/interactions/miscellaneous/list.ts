import type { Command } from "../../types";
import type { ChatInputCommandInteraction } from "discord.js";
import { shuffle } from "../../lib/utils";

const command: Command = {
  name: "list",
  categories: ["Miscellaneous"],
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const list = interaction.options.data.map((option) => option.value);
    await interaction.editReply(
      `${shuffle(list)[0]?.toString().substring(0, 3000)}`
    );
  },
};

export default command;
