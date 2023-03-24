import { APIEmbedField, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getColor, getInt } from "../../lib/Helpers";
import type { Command } from "../../types";

const command: Command = {
 name: "rick",
 categories: ["Miscellaneous"],
 async buttons(interaction) {
  const [x, user, subcommand, minOrDice, maxOrSides] = interaction.customId.split("-");
  if (user !== interaction.user.id) {
   await interaction.reply({ ephemeral: true, content: `This isn't your interaction! >:(` });
   return;
  }

  const embed = new EmbedBuilder({
   color: getColor(interaction.member),
   thumbnail: { url: "https://cdn.discordapp.com/attachments/1006291653243453500/1006361354812260392/rickroll.gif" },
  });

  let fn = subcommand === "dice" ? die : num;
  fn(embed, getInt(minOrDice), getInt(maxOrSides));
  await interaction.update({ embeds: [embed], components: interaction.message.components });
 },
 async execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const subcommand = interaction.options.getSubcommand(true);
  const max = interaction.options.getInteger("maximum") ?? 100;
  const min = interaction.options.getInteger("mininum") ?? 1;
  const dice = interaction.options.getInteger("dice") ?? 1;
  const sides = interaction.options.getInteger("sides") ?? 6;

  const args = subcommand === "dice" ? `${dice}-${sides}` : `${min}-${max}`;
  const customId = `rick-${interaction.user.id}-${subcommand}-${args}`;

  const button = new ButtonBuilder({
   customId,
   label: "Rick Again",
   style: ButtonStyle.Secondary,
   emoji: { name: subcommand === "dice" ? "🎲" : "🔢" },
  });

  const embed = new EmbedBuilder({
   color: getColor(interaction.member),
  });

  switch (subcommand) {
   case "dice":
    die(embed, dice, sides);
    break;
   case "number":
    num(embed, min, max);
    break;
  }

  await interaction.editReply({ embeds: [embed], components: [{ type: 1, components: [button] }] });
 },
};

function die(embed: EmbedBuilder, dice: number, sides: number) {
 embed.setAuthor({ name: `${dice} ${sides}-Sided ${sides == 1 ? "Die" : "Dice"}` });
 embed.setFields(roll());
 return embed;

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

function num(embed: EmbedBuilder, min: number, max: number) {
 if (max <= min) {
  embed.setDescription(`Maximum: \*\*${max}\*\* must be greater than Minimum: \*\*${min}\*\*`);
  return embed;
 }

 const random = () => ~~(Math.random() * (max - min + 1)) + min;
 const numbers: number[] = [];
 numbers.push(random());
 embed.setAuthor({ name: "Rick Numbers" });
 embed.setDescription(`${numbers.map((num, i) => (i === numbers.length - 1 ? `\*\*${num}\*\*` : num)).join(" ")}`);
 return embed;
}

export default command;
