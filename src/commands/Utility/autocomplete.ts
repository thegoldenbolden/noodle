import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../utils/typings/discord";

export default <Command>{
  name: "test",
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.reply("yo");

      const args: any = {
        interaction,
        ephemeral: false,
        pages: {
          embeds: [
            [
              {
                title: "p1",
                description: "1",
              },
              {
                title: "p1",
                description: "2",
              },
              {
                title: "p1",
                description: "3",
              },
            ],
            [
              {
                title: "p2",
                description: "1",
              },
              {
                title: "p2",
                description: "2",
              },
              {
                title: "p2",
                description: "3",
              },
            ],
          ],
        },
      };
    } catch (err) {
      console.error(err);
    }
  },
};
