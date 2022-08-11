import { APIButtonComponentWithCustomId, APIEmbed, APIEmbedField, ButtonStyle, ComponentType } from "discord.js";
import getColor from "../../lib/color";
import { basicCollector } from "../../lib/discord/collectors";
import { Command } from "../../types";

export default {
 name: "rick",
 categories: ["Miscellaneous"],
 async execute(interaction) {
  await interaction.deferReply();
  const subcommand = interaction.options.getSubcommand(true);
  const button: APIButtonComponentWithCustomId = {
   type: ComponentType.Button,
   custom_id: `rick-${interaction.id}`,
   label: `Rick Again`,
   style: ButtonStyle.Secondary,
  };

  const embed: APIEmbed = {
   color: getColor(interaction.member),
   thumbnail: {
    url: "https://cdn.discordapp.com/attachments/1006291653243453500/1006361354812260392/rickroll.gif",
   },
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
   ids: [`rick-${interaction.id}`],
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
   const dice = interaction.options.getInteger("dice") ?? 1;
   const sides = interaction.options.getInteger("sides") ?? 6;
   embed.fields = roll();
   embed.author = { name: `${dice} ${sides}-Sided ${sides == 1 ? "Die" : "Dice"}` };
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

   function roll(): APIEmbedField[] {
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

    const fields: APIEmbedField[] = [
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
   button.emoji = { name: "🔢" };
   const max = interaction.options.getInteger("maximum") ?? 100;
   const min = interaction.options.getInteger("mininum") ?? 1;

   if (max <= min) {
    return await interaction.editReply(`Maximum: \*\*${max}\*\* must be greater than Minimum: \*\*${min}\*\*`);
   }

   const random = () => ~~(Math.random() * (max - min + 1)) + min;
   const numbers: number[] = [];
   numbers.push(random());
   embed.author = { name: "Rick Numbers" };

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
} as Command;
