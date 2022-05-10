import { APIEmbed } from "discord-api-types/v10";
import { ChatInputCommandInteraction } from "discord.js";
import { shuffle } from "lodash";
import { randomColor } from "../../utils/functions";
import { Category, Command } from "../../utils/typings/discord";

export default <Command>{
  name: "list",
  category: Category.Miscellaneous,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    let list: string[] = interaction.options.data.map((option: any) => option.value as string);

    const embed: APIEmbed = {
      color: randomColor(),
      description: `\`\`\`${shuffle(list)[0]?.substring(0, 1000)}\`\`\``,
      author: {
        name: `List Buddy`,
        icon_url: interaction.user.displayAvatarURL() ?? interaction.user.defaultAvatarURL,
      },
    };
    await interaction.editReply({
      embeds: [embed],
    });
  },
};
