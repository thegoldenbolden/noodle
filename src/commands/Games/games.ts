import { ChatInputCommandInteraction } from "discord.js";
import { Category, Command } from "../../utils/typings/discord";

export default <Command>{
 name: "games",
 category: Category.Games,
 async execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const game = interaction.options.getString("game", true);
  const { run } = await import(`./${game}`);
  run && (await run(interaction));
 },
};
