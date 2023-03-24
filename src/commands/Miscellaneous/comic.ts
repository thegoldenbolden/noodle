import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type { Command } from "../../types";

import useAxios from "../../lib/Axios";
import BotError from "../../lib/classes/Error";
import { getColor } from "../../lib/Helpers";

export default {
 name: "comic",
 categories: ["Miscellaneous"],
 async execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const comicNum = interaction.options.getInteger("number", false) ?? 0;

  const { data }: any = await useAxios({ interaction, name: "Comic", url: `https://xkcd.com/info.0.json` });
  let err = { message: "Trix are indeed for kids because I encountered a problem.", log: true };
  const number = comicNum ? comicNum : data.num ?? 1;
  if (comicNum > data.num) throw new BotError({ message: `There are currently only ${data.num} comics available.` });
  const random = ~~(Math.random() * (number - 1)) + 1;
  let { data: comic }: any = await useAxios({ interaction, name: "Comic", url: `https://xkcd.com/${random}/info.0.json` });
  if (!comic) throw new BotError(err);

  await interaction.editReply({
   embeds: [
    new EmbedBuilder()
     .setTimestamp(new Date(`${comic.year}-${comic.month}-${comic.day}`))
     .setAuthor({ name: `${comic.safe_title}` })
     .setImage(`${comic.img}`)
     .setFooter({ text: `${comic.alt}` })
     .setColor(getColor(interaction.member)),
   ],
  });
 },
} as Command;
