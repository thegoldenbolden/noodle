import { PermissionFlagsBits } from "discord-api-types/v10";
import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../utils/typings/discord";

export default <Command>{
  permissions: [PermissionFlagsBits.Administrator],
  async execute(interaction: ChatInputCommandInteraction) {},
  name: "unpin",
};
