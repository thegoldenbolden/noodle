import { CommandInteraction } from "discord.js";
import { get } from "../../utils/functions/database";
import { handleError } from "../../utils/functions/helpers";
import Interaction from "../utils/interaction";

export default {
 name: "interactionCreate",
 async execute(interaction: CommandInteraction) {
  if (!interaction.guild?.available) return;
  try {
   await get({ discord_id: interaction.guildId, table: "guilds" });
   if (interaction.isAutocomplete()) return await Interaction.handleAutocomplete(interaction);
   if (interaction.isSelectMenu()) return await Interaction.handleSelectMenu(interaction);
   if (interaction.isButton()) return await Interaction.handleButton(interaction);
   if (interaction.isCommand()) return await Interaction.handleCommand(interaction);
  } catch (err) {
   await handleError(err as any, interaction);
  }
 },
};
