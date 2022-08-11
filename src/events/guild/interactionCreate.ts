import { AutocompleteInteraction, BaseInteraction, InteractionType, ModalSubmitInteraction } from "discord.js";
import { loadGuild } from "../../lib/database";
import error from "../../lib/error";
import Handle from "./handleInteraction";

export default {
 name: "interactionCreate",
 async execute(interaction: BaseInteraction) {
  try {
   if (!interaction.guild?.available) return;
   await loadGuild(interaction.guild);
   switch (interaction.type) {
    case InteractionType["ApplicationCommandAutocomplete"]:
     return await Handle.Autocomplete(interaction as AutocompleteInteraction);
    case InteractionType["ApplicationCommand"]:
     return await Handle.Command(interaction as any);
    case InteractionType["ModalSubmit"]:
     return await Handle.Modal(interaction as ModalSubmitInteraction);
    case InteractionType["MessageComponent"]:
     if (interaction.isSelectMenu()) return await Handle.Menu(interaction);
    // if (interaction.isButton()) return await Handle.Button(interaction);
   }
  } catch (err) {
   await error(err as any, interaction);
  }
 },
};
