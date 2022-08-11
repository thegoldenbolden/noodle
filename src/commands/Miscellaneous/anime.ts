import { APIEmbed } from "discord.js";
import Kitsu from "kitsu";
import BotError from "../../lib/classes/Error";
import getColor from "../../lib/color";
import { convertMinutes } from "../../lib/ordinal";
import { Command } from "../../types";

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

    return str;
   };

   return {
    description,
    color: getColor(interaction.guild?.members.me ?? null),
    author: {
     name: `${data.canonicalTitle.substring(0, 228)}`,
     url: `https://kitsu.io/anime/${data.slug}`,
    },
    thumbnail: { url: data.posterImage.medium ?? "" },
    footer: { text: `${Object.values(data.titles).join(" • ")}` },
    fields: [
     {
      name: "Type",
      value: `${data.subtype ?? "??"} • ${data.ageRating ?? "N/A"}`,
      inline: true,
     },
     {
      name: `Aired`,
      value: `${data.startDate ?? "???"} to ${data.endDate ?? "???"}`,
      inline: true,
     },
     {
      name: "Status",
      value: `${data.status}`,
      inline: true,
     },
     {
      name: "Rating",
      value: `${data.averageRating}`,
      inline: true,
     },
     {
      name: `${data.episodeCount ?? "??"} Episodes`,
      value: `${data.episodeLength ?? "N/A"} minute episodes`,
      inline: true,
     },
     {
      name: "Time to Complete",
      value: `${runtime(minutes, hours, days)}`,
      inline: true,
     },
     {
      name: "Categories",
      value: data.categories?.data?.map((c) => `\`\`${c.title}\`\``).join(", "),
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
