import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { shuffle } from "lodash";
import { Command } from "../../utils/types/discord";

export default <Command>{
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    let list: string[] = interaction.options.data.map(
      (option) => option.value as string
    );

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setDescription(`\`\`\`${shuffle(list)[0]?.substring(0, 1000)}\`\`\``)
      .setAuthor({
        name: "List Buddy",
        iconURL:
          interaction.user.displayAvatarURL() ??
          interaction.user.defaultAvatarURL,
      });

    await interaction.editReply({
      embeds: [embed],
    });
  },
  name: "1",
};
