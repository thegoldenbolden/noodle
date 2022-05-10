import { PermissionFlagsBits } from "discord-api-types/v10";
import { ChatInputCommandInteraction } from "discord.js";
import { Category, Command } from "../../utils/typings/discord";

export default <Command>{
  name: "config",
  category: Category.Moderation,
  permissions: [PermissionFlagsBits.Administrator],
  async execute(interaction: ChatInputCommandInteraction) {},
};
