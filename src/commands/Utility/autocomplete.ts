import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../utils/types/discord";

export default <Command>{
  name: "autocomplete",
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply({ ephemeral: true });
      await interaction.editReply({
        embeds: [
          {
            description: "hello",
            video: {
              width: 600,
              height: 200,
              url: "https://www.youtube.com/watch?v=qig4KOK2R2g",
            },
          },
        ],
      });
    } catch (err) {
      console.error(err);
    }
  },
};
