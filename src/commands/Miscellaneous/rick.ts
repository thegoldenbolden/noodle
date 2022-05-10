import { APIEmbed, ButtonStyle } from "discord-api-types/v10";
import { ButtonComponentData, ChatInputCommandInteraction, ComponentType, EmbedFieldData } from "discord.js";
import { basicCollector } from "../../utils/discord";
import { randomColor } from "../../utils/functions";
import { Category, Command } from "../../utils/typings/discord";

export default <Command>{
  name: "rick",
  cooldown: 5,
  category: Category.Miscellaneous,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const subcommand = interaction.options.getSubcommand(true);

    const button: ButtonComponentData = {
      type: ComponentType.Button,
      customId: `rick.${interaction.id}`,
      label: `Rick Again`,
      style: ButtonStyle.Success,
    };

    const embed: APIEmbed = {
      color: randomColor(),
    };

    let d: any = null;
    switch (subcommand) {
      case "dice":
        d = await die();
        break;
      case "number":
        d = await num();
        break;
    }

    await basicCollector({
      interaction,
      ephemeral: false,
      ids: [`rick.${interaction.id}`],
      options: {
        embeds: [d.embed],
        components: [
          {
            type: ComponentType.ActionRow,
            components: [button],
          },
        ],
      },
      ...d.c,
    });

    async function die() {
      button.emoji = { name: "🎲" };
      const dice = interaction.options.getInteger("amount", true);
      const sides = interaction.options.getInteger("sides", true);

      embed.fields = roll();
      embed.author = {
        name: `${dice} ${sides}-Sided ${sides == 1 ? "Die" : "Dice"}`,
        icon_url:
          "https://media.discordapp.net/attachments/819078813991436358/966134691365285897/unknown.png?width=512&height=512",
      };

      return {
        embed,
        c: {
          collector: { idle: 5000 },
          collect: async (i: any) => {
            embed.fields = roll();
            return { embeds: [embed] };
          },
        },
      };

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
      button.emoji = "🔢";
      const max = interaction.options.getInteger("maximum", true);
      const min = interaction.options.getInteger("mininum", true);

      if (max <= min) {
        return await interaction.editReply(`Maximum: \*\*${max}\*\* must be greater than Minimum: \*\*${min}\*\*`);
      }

      const random = () => ~~(Math.random() * (max - min + 1)) + min;
      const numbers: number[] = [];

      numbers.push(random());

      embed.author = {
        name: `Rick Numbers`,
        icon_url:
          "https://media.discordapp.net/attachments/819078813991436358/966134691365285897/unknown.png?width=512&height=512",
      };

      embed.description = `${numbers.map((num, i) => (i === numbers.length - 1 ? `\*\*${num}\*\*` : num)).join(" ")}`;

      return {
        embed,
        c: {
          collector: { max: 50, idle: 5000 },
          collect: async (int: any) => {
            numbers.push(random());
            embed.description = `${numbers.map((num, i) => (i === numbers.length - 1 ? `\*\*${num}\*\*` : num)).join(" ")}`;
            return { embeds: [embed] };
          },
        },
      };
    }
  },
};
