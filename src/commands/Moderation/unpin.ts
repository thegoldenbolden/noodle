import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../utils/typings/discord";

export default <Command>{
  async execute(interaction: ChatInputCommandInteraction) {},
  name: "unpin",
};
