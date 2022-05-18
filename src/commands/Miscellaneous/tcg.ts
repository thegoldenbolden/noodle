import { ChatInputCommandInteraction } from "discord.js";
import { Category, Command } from "../../utils/typings/discord";

type Info = "set" | "type" | "supertype" | "subtype" | "rarity" | "serie";

export default <Command>{
  name: "tcg",
  category: Category.Miscellaneous,
  async execute(interaction: ChatInputCommandInteraction) {
    return await interaction.editReply("This command is being updated.");

    const subcommand = interaction.options.getSubcommand(true);
    const key = `${process.env.TCG_API}`;
    const api = "https://api.pokemontcg.io/v2/";

    if (subcommand === "info") {
      return await getInfo(interaction.options.getString("type", true) as Info);
    }

    async function getInfo(type: Info) {}

    async function findCards() {}
  },
};
