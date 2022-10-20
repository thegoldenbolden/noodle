import useAxios from "../../lib/axios";
import BotError from "../../lib/classes/Error";
import getColor from "../../lib/color";
import { Command } from "../../types";

export default {
 name: "comic",
 categories: ["Miscellaneous"],
 async execute(interaction) {
  await interaction.deferReply();
  const axios = { interaction, name: "Comic" };
  const { data }: any = await useAxios({ ...axios, url: `https://xkcd.com/info.0.json` });
  let err = { message: "Trix are indeed for kids because I encountered a problem.", log: true };
  if (!data) throw new BotError(err);

  const number = data?.num ?? 1;
  const random = ~~(Math.random() * (number - 1)) + 1;
  let { data: comic }: any = await useAxios({ ...axios, url: `https://xkcd.com/${random}/info.0.json` });
  if (!comic) throw new BotError(err);

  await interaction.editReply({
   embeds: [
    {
     color: getColor(interaction.member),
     image: { url: `${comic.img}` },
     footer: { text: `${comic.alt}` },
     author: { name: `${comic.safe_title} • ${comic.year}-${comic.month}-${comic.day}` },
    },
   ],
  });
 },
} as Command;
