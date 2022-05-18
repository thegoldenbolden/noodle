import { ChatInputCommandInteraction } from "discord.js";
import { Category, Command } from "../../utils/typings/discord";

export default <Command>{
  name: "comic",
  category: Category.Miscellaneous,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      ephemeral: true,
      content: `Games haven't been made yet.`,
    });
  },
};
