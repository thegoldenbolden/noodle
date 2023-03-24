import type { Command } from "../../types";

import { type ChatInputCommandInteraction, codeBlock } from "discord.js";
import { createGuildCommand, createGlobalCommand, editGuildCommand, editGlobalCommand } from "../../lib/discord/ManageCommands";
import BotError from "../../lib/classes/Error";
import { client } from "../..";

const command: Command = {
 private: true,
 name: "managecmds",
 async execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const subcommand = interaction.options.getSubcommand(true);
  const guildOnly = interaction.options.getBoolean("guild_only");

  switch (subcommand) {
   case "register":
    const registerName = interaction.options.getString("command", true);
    guildOnly ? createGuildCommand(registerName) : createGlobalCommand(registerName);
    await interaction.editReply(`Successfully created command`);
    return;
   case "edit":
    const id = interaction.options.getString("id");
    const editName = interaction.options.getString("command", true);
    if (!id) throw new BotError({ message: "An id is required when editing a command" });
    guildOnly ? editGuildCommand(id, editName) : editGlobalCommand(id, editName);
    return;
   case "list":
    let cmds = guildOnly ? interaction.guild?.commands.cache : client.application?.commands.cache;
    if (cmds && cmds.size > 0) {
     await interaction.editReply({
      content: codeBlock(
       "javascript",
       JSON.stringify(
        cmds.map((cmd) => ({ name: cmd.name, id: cmd.id })),
        null,
        2
       )
      ),
     });
     return;
    }

    if (!cmds || cmds.size === 0) {
     const fetched = guildOnly ? await interaction.guild?.commands.fetch() : await client.application?.commands.fetch();
     if (!fetched) throw new BotError({ message: "Failed to fetch commands" });
     await interaction.editReply({
      content: codeBlock(
       "javascript",
       JSON.stringify(
        fetched.map((cmd) => ({ name: cmd.name, id: cmd.id })),
        null,
        2
       )
      ),
     });
     return;
    }
  }
 },
};

export default command;
