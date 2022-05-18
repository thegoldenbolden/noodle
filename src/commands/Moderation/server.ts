import { PermissionFlagsBits } from "discord-api-types/v10";
import { ChatInputCommandInteraction } from "discord.js";
import { error } from "../../index";
import { GuildProfile } from "../../utils/typings/database";
import { Category, Command, Load } from "../../utils/typings/discord";

export default <Command>{
  name: "server",
  category: Category.Moderation,
  database: Load.Guild,
  permissions: [PermissionFlagsBits.Administrator],
  async execute(interaction: ChatInputCommandInteraction, guild: GuildProfile) {
    await interaction.deferReply({ ephemeral: false });
    const subcommand = interaction.options.getSubcommandGroup(false) ?? interaction.options.getSubcommand(false);

    const { run } = await import(`./server/${subcommand}`);
    if (run) {
      await run(interaction, guild);
    } else {
      await interaction.editReply(`This subcommand doesn't work yet.`);
      error.send(`${subcommand} not found`);
    }
  },
};
