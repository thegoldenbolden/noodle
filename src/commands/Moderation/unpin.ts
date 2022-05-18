import { PermissionFlagsBits } from "discord-api-types/v10";
import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../utils/typings/discord";

export default <Command>{
  name: "unpin",
  permissions: [PermissionFlagsBits.Administrator],
  async execute(interaction: ChatInputCommandInteraction) {
    return await interaction.reply({
      ephemeral: true,
      content: "This command doesn't work at the moment.",
    });
  },
};
