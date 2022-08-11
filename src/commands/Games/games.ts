import { Command } from "../../types";

export default {
 name: "games",
 categories: ["Games"],
 execute: async (interaction, ...args) => {
  await interaction.deferReply();
  const game = interaction.options.getString("game", true);
  const execute = (await import(`./games/${game}.js`)).default;
  if (execute) {
   await execute(interaction, ...args);
  } else {
   await interaction.editReply("We were unable to start the game.");
  }
 },
} as Command;
