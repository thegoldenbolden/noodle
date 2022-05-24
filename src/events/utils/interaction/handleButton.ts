import { ButtonInteraction } from "discord.js";
import { handleAutoroleButton } from "./handleAutoroleButton";
import { handleSubmissions } from "./handleSubmissions";

export default async (interaction: ButtonInteraction) => {
 if (!interaction.customId.startsWith("AUTOROLE") || !interaction.customId.startsWith("SUBMISSION")) return;

 if (interaction.customId.startsWith("AUTOROLE")) {
  return await handleAutoroleButton(interaction);
 }

 if (interaction.customId.startsWith("SUBMISSIONS")) {
  return await handleSubmissions(interaction);
 }
};
