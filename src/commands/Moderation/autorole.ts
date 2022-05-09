import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../utils/typings/discord";

export default <Command>{
  name: "autorole",
  permissions: ["ManageRoles"],
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const subcommand = interaction.options.getSubcommand(true);

      switch (subcommand) {
        case "create":
          await create();
          break;
        case "add":
          break;
        case "remove":
          break;
        case "delete":
          break;
        case "edit":
          break;
      }

      async function create() {
        const type = interaction.options.getString("type", true);
        const roles = interaction.options.resolved.roles;

        if (type === "menu" && (roles?.size as number) < 2) {
          return await interaction.editReply(`There needs to be at least two roles for an autorole menu.`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  },
};
