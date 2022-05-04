import { ButtonStyle } from "discord-api-types/v10";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ChatInputCommandInteraction,
  EmbedBuilder,
  EmbedFieldData,
  InteractionCollector,
} from "discord.js";
import { Command } from "../../utils/types/discord";

export default <Command>{
  name: "rick",
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const subcommand = interaction.options.getSubcommand(true);

    const button = new ButtonBuilder()
      .setCustomId(`rick.${interaction.id}`)
      .setLabel(`Rick Again`)
      .setStyle(ButtonStyle.Success);

    const embed = new EmbedBuilder().setColor("Random").setTimestamp();

    switch (subcommand) {
      case "dice":
        await die();
        break;
      case "number":
        await num();
        break;
    }

    async function die() {
      button.setEmoji({ name: "🎲" });
      const dice = interaction.options.getInteger("amount", true);
      const sides = interaction.options.getInteger("sides", true);

      embed.setFields(roll());
      embed.setAuthor({
        name: `${dice} ${sides}-Sided ${sides == 1 ? "Die" : "Dice"}`,
        iconURL:
          "https://media.discordapp.net/attachments/819078813991436358/966134691365285897/unknown.png?width=512&height=512",
      });

      const row = new ActionRowBuilder().setComponents([button]);

      const message = await interaction.editReply({
        embeds: [embed],
        components: [row] as any,
      });

      const collector = new InteractionCollector(interaction.client, {
        message: message,
        idle: 30000,
        dispose: true,
        filter: (i: ButtonInteraction) =>
          i.customId === `rick.${interaction.id}` &&
          i.user.id === interaction.user.id,
      });

      collector.on("collect", async (i) => {
        embed.setFields(roll());
        await i.update({ embeds: [embed] });
      });

      collector.on("end", async (i) => {
        if (!interaction.channel?.messages.cache.get(message.id)) return;

        button.setDisabled(true);
        row.setComponents([button]);

        await interaction.editReply({ components: [row] as any });
      });

      function roll(): EmbedFieldData[] {
        const rolls = [];
        for (let i = 0; i < dice; i++) {
          rolls.push(~~(Math.random() * sides) + 1);
        }

        const total = rolls.reduce((a, b) => a + b, 0);
        const modes: number[] = [];
        const count: number[] = [];
        let max: number = 0;

        for (let i = 0; i < rolls.length; i += 1) {
          let number = rolls[i];
          count[number] = (count[number] || 0) + 1;
          if (count[number] > max) {
            max = count[number];
          }
        }

        for (const i in count) {
          if (count.hasOwnProperty(i)) {
            if (count[i] === max) {
              modes.push(Number(i));
            }
          }
        }

        const fields: EmbedFieldData[] = [
          { name: "Total", value: `${total}`, inline: true },
          {
            name: "Average",
            value: `${~~(total / rolls.length)}`,
            inline: true,
          },
        ];

        if (max > 1) {
          fields.push({
            name: `Mode (${max})`,
            value: `${modes.join(" • ")}`,
            inline: true,
          });
        }

        fields.push({
          name: `Rolls`,
          value: `${rolls.join(" • ")}`,
          inline: false,
        });

        return fields;
      }
    }

    async function num() {
      const max = interaction.options.getInteger("maximum", true);
      const min = interaction.options.getInteger("mininum", true);

      if (max <= min) {
        return await interaction.editReply(
          `Maximum: \*\*${max}\*\* must be greater than Minimum: \*\*${min}\*\*`
        );
      }

      const random = () => ~~(Math.random() * (max - min)) + min;
      const numbers: number[] = [];

      numbers.push(random());

      const row = new ActionRowBuilder().setComponents([button]);
      embed.setAuthor({
        name: `Rick Numbers`,
        iconURL:
          "https://media.discordapp.net/attachments/819078813991436358/966134691365285897/unknown.png?width=512&height=512",
      });

      embed.setDescription(
        `${numbers
          .map((num, i) => (i === numbers.length - 1 ? `\*\*${num}\*\*` : num))
          .join(" ")}`
      );

      const message = await interaction.editReply({
        embeds: [embed],
        components: [row] as any,
      });

      const collector = new InteractionCollector(interaction.client, {
        message: message,
        idle: 30000,
        max: 50,
        dispose: true,
        filter: (i: ButtonInteraction) =>
          i.customId === `rick.${interaction.id}` &&
          i.user.id === interaction.user.id,
      });

      collector.on("collect", async (i) => {
        numbers.push(random());

        embed.setDescription(
          `${numbers
            .map((num, i) =>
              i === numbers.length - 1 ? `\*\*${num}\*\*` : num
            )
            .join(" ")}`
        );

        await i.update({ embeds: [embed] });
      });

      collector.on("end", async (i) => {
        if (!interaction.channel?.messages.cache.get(message.id)) return;

        button.setDisabled(true);
        row.setComponents([button]);

        await interaction.editReply({ components: [row] as any });
      });
    }
  },
};
