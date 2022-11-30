import { AutocompleteInteraction } from "discord.js";
import { Bot } from "..";

export default async (interaction: AutocompleteInteraction) => {
 const command = Bot.commands.get(interaction.commandName);
 if (!command) return;
};
