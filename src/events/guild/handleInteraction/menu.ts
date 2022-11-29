import { AnySelectMenuInteraction, RoleSelectMenuInteraction } from "discord.js";

export default async (interaction: AnySelectMenuInteraction) => {
 await interaction.deferReply({ ephemeral: true });

 if (interaction.customId === "AUTOROLE") {
  const autorole = interaction as RoleSelectMenuInteraction;
  console.log(autorole);
 }
};
