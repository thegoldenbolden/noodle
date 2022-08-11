import { APIEmbed } from "discord.js";
import Kitsu from "kitsu";
import BotError from "../../lib/classes/Error";
import getColor from "../../lib/color";
import { Command } from "../../types";

const api = new Kitsu();

export default {
 name: "manga",
 categories: ["Miscellaneous"],
 cooldown: 10,
 execute: async (interaction) => {
  await interaction.deferReply();
  const name = interaction.options.getString("name", true);

  const data = await getData();

  await interaction.editReply({
   embeds: [createEmbed(data?.[0])],
  });

  function createEmbed(data: Manga): APIEmbed {
   if (!data) return { description: "We couldn't find any more data." };
   let description = data.synopsis.substring(0, 4000) ?? "";
   description += data.synopsis.length > 4000 ? "..." : "";

   let footer: string[] | { text: string } | undefined = Object.values(data.titles);
   footer = footer.length == 0 ? undefined : { text: footer.join(" • ") };

   let categories: string[] | string = data.categories?.data?.map((c) => `\`\`${c.title}\`\``);
   categories = categories.length == 0 ? "N/A" : categories.join(", ");

   return {
    description,
    footer,
    color: getColor(interaction.guild?.members.me),
    author: {
     name: `${data.canonicalTitle.substring(0, 228)}`,
     url: `https://kitsu.io/manga/${data.slug}`,
    },
    thumbnail: { url: data.posterImage.medium ?? "" },
    fields: [
     {
      name: "Type • Age Rating",
      value: `${data.subtype ?? "??"} • ${data.ageRating ?? "??"}`,
      inline: true,
     },
     {
      name: `Aired`,
      value: `${data.startDate ?? "???"} to ${data.endDate ?? "???"}`,
      inline: true,
     },
     {
      name: "Status",
      value: `${data.status ?? "N/A"}`,
      inline: true,
     },
     {
      name: "Rating",
      value: `${data.averageRating ?? "N/A"}`,
      inline: true,
     },
     {
      name: "Categories",
      value: categories,
     },
    ],
   };
  }

  async function getData(page = 0, limit = 1) {
   const response = await api.get("manga", {
    params: {
     page: {
      limit: limit,
      offset: page,
     },
     fields: {
      categories: "title",
      anime:
       "categories,canonicalTitle,slug,synopsis,titles,averageRating,startDate,endDate,status,posterImage,ageRating,subtype",
     },
     filter: {
      text: name,
     },
     include: "categories",
    },
   });

   if (!response.data || response.data.length === 0) {
    throw new BotError({ message: "No data was found." });
   }

   return response.data as Manga[];
  }
 },
} as Command;

type Manga = {
 episodeCount: number;
 slug: string;
 canonicalTitle: string;
 synopsis: string;
 averageRating: string;
 startDate: string;
 endDate: string;
 status: string;
 ageRating: string;
 subtype: string;
 categories: { data: { title: string }[] };
 titles: { [key: string]: string };
 posterImage: { medium: string };
};
