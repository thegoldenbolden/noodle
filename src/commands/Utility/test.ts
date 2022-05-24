import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../utils/typings/discord";

export default <Command>{
 name: "test",
 async execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const args = interaction.options.getString("arg");
 },
};
