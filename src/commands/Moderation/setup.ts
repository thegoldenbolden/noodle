import { Guild } from "@prisma/client";
import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../types";

export default <Command>{
 name: "setup",
 permissions: ["ManageGuild"],
 categories: ["Moderation"],
 database: "Guild",
 async execute(interaction: ChatInputCommandInteraction, guild: Guild) {
  await interaction.deferReply({ ephemeral: true });
  const subcommand = interaction.options.getSubcommandGroup(false) ?? interaction.options.getSubcommand(false);
  const execute = await import(`./_${subcommand}`);
  if (execute.default) {
   await execute.default(interaction, guild);
  } else {
   await interaction.editReply("We were unable to run this command.");
  }
 },
};
