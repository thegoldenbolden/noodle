import { PermissionFlagsBits } from "discord-api-types/v10";
import { ChatInputCommandInteraction } from "discord.js";
import { GuildProfile } from "../../utils/typings/database";
import { Category, Command, Load } from "../../utils/typings/discord";

export default <Command>{
  name: "server",
  category: Category.Moderation,
  database: Load.Guild,
  permissions: [PermissionFlagsBits.Administrator],
  async execute(interaction: ChatInputCommandInteraction, guild: GuildProfile) {
    const subcommand = interaction.options.getSubcommandGroup(false) ?? interaction.options.getSubcommand(false);

    const { run } = await import(`./server/${subcommand}`);
    if (run) {
      await interaction.deferReply({ ephemeral: false });
      await run(interaction, guild);
    }
  },
};
