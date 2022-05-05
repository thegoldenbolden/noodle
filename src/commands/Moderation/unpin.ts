import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../utils/types/discord";

export default <Command>{
  async execute(interaction: ChatInputCommandInteraction) {},
  name: "unpin",
};
