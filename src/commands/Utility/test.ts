import { ChatInputCommandInteraction } from "discord.js";
import { get, query } from "../../utils/functions/database";
import { Command } from "../../utils/typings/discord";

export default <Command>{
  name: "test",
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const args = interaction.options.getString("arg");

      // const modal = new ModalBuilder().setCustomId("modal").setTitle("Modal Buddy");

      // const text = new TextInputBuilder()
      //   .setCustomId("text")
      //   .setStyle(TextInputStyle.Paragraph)
      //   .setRequired(true)
      //   .setLabel("Text Buddy");

      // const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().setComponents([text]);

      // modal.setComponents([row]);

      // await interaction.showModal(modal);

      if (args) {
        if (args === "reset") {
          await query(`update guilds set autoroles = [] where discord_id='${process.env.BUDS}'`);
          return;
        }

        if (args === "view") {
          const a = await get({ table: "guilds", discord_id: process.env.BUDS });
          console.log({
            ...a.channels,
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  },
};
