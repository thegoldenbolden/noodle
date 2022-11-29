import { ModalSubmitInteraction } from "discord.js";

export default async (interaction: ModalSubmitInteraction) => {
 if (!interaction.guild) return;

 switch (interaction.customId) {
  default:
   return;
  case "AUTOROLE":
   console.log("Autorole Modal");
   return;
 }
};
