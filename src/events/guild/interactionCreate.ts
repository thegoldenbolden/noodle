import { CommandInteraction } from "discord.js";
import { get } from "../../utils/functions/database";
import { handleError } from "../../utils/functions/helpers";
import Interaction from "../utils/interaction";

export default {
  name: "interactionCreate",
  async execute(interaction: CommandInteraction) {
    if (!interaction.guild?.available) return;
    await get({ discord_id: interaction.guildId, table: "guilds" }).catch(async (err) => await handleError(err, interaction));

    if (interaction.isAutocomplete()) {
      return await Interaction.handleAutocomplete(interaction).catch(async (err) => await handleError(err, interaction));
    }

    if (interaction.isSelectMenu()) {
      return await Interaction.handleSelectMenu(interaction).catch(async (err) => await handleError(err, interaction));
    }

    if (interaction.isButton()) {
      return await Interaction.handleButton(interaction).catch(async (err) => await handleError(err, interaction));
    }

    if (interaction.isCommand()) {
      return await Interaction.handleCommand(interaction).catch(async (err) => await handleError(err, interaction));
    }
  },
};
