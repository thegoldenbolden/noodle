import type { Command } from "../../types";
import type { APIEmbed } from "discord.js";
import Kitsu from "kitsu";
import BotError from "../../lib/classes/Error";
import getColor from "../../lib/color";
import { convertMinutes } from "../../lib/ordinal";

const api = new Kitsu();
let API_Timeout: number | null = null;

export default {
 name: "anime",
 categories: ["Miscellaneous"],
 cooldown: 10,
 execute: async (interaction) => {
  if (API_Timeout !== null) {
   await interaction.reply("Please try using this command again in a few minutes.");
   if (new Date().getTime() < API_Timeout + 60000 * 5) {
    API_Timeout = null;
   }
   return;
  }

  await interaction.deferReply();
  const name = interaction.options.getString("name", true);
  const data = await getData();
  await interaction.editReply({ embeds: [createEmbed(data?.[0])] });

  function createEmbed(data: Anime): APIEmbed {
   if (!data) return { description: "We couldn't find any more data." };

   let description = data.synopsis.substring(0, 4000) ?? "";
   description += data.synopsis.length > 4000 ? "..." : "";

   const { days, hours, minutes } = convertMinutes(data.totalLength);

   const runtime = (minutes: number, hours: number, days: number) => {
    const plural = (x: number) => (x == 1 ? "" : "s");
    let str = "";
    if (days > 0) {
     str += `${days} day${plural(days)}${minutes > 0 ? " " : " and"}`;
    }

    if (hours > 0) {
     str += `${hours} hour${plural(hours)}${minutes > 0 ? " and " : " "}`;
    }
    if (minutes > 0) {
     str += `${minutes} minute${plural(minutes)}`;
    }

    return str.length == 0 ? null : str;
   };

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
     url: `https://kitsu.io/anime/${data.slug}`,
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
      name: `${data.episodeCount ?? "??"} Episodes`,
      value: `${data.episodeLength ?? "??"} minute episodes`,
      inline: true,
     },
     {
      name: "Time to Complete",
      value: `${runtime(minutes, hours, days) ?? "??"}`,
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
   const response = await api
    .get("anime", {
     params: {
      page: {
       limit: limit,
       offset: page,
      },
      fields: {
       categories: "title",
       anime:
        "categories,canonicalTitle,episodeCount,slug,synopsis,titles,averageRating,startDate,endDate,status,posterImage,episodeLength,totalLength,youtubeVideoId,ageRating,subtype",
      },
      filter: {
       text: name,
      },
      include: "categories",
     },
    })
    .catch((e: any) => e);

   if (response.code === "ETIMEDOUT") {
    API_Timeout = new Date().getTime();
    throw new BotError({ message: "Couldn't get data in time." });
   }

   if (!response.data || response.data.length === 0) throw new BotError({ message: "No data was found." });
   return response.data as Anime[];
  }
 },
} as Command;

type Anime = {
 episodeCount: number;
 slug: string;
 canonicalTitle: string;
 synopsis: string;
 averageRating: string;
 startDate: string;
 endDate: string;
 status: string;
 episodeLength: number;
 totalLength: number;
 ageRating: string;
 subtype: string;
 posterImage: { medium: string };
 titles: { [key: string]: string };
 categories: { data: { title: string }[] };
};
