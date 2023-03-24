import type { Command } from "../../types";
import type { KitsuAnime } from "../../types/apis";

import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { convertMinutes, truncate, getColor } from "../../lib/Helpers";
import BotError from "../../lib/classes/Error";
import { KitsuApi as api } from "../..";

let API_Timeout: number | null = null;

const command: Command = {
 name: "anime",
 categories: ["Miscellaneous"],
 cooldown: 10,
 execute: async (interaction: ChatInputCommandInteraction) => {
  if (!api) throw new BotError({ message: `Oopsies`, log: true, command: "anime", info: "Failed to create instance" });

  if (API_Timeout !== null) {
   await interaction.reply("Please try using this command again in a few minutes.");
   if (new Date().getTime() < API_Timeout + 60000 * 5) {
    API_Timeout = null;
   }
   return;
  }

  await interaction.deferReply();
  const name = interaction.options.getString("name", true);

  const response = await api.get("anime", {
   params: {
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
  });

  if (response.code === "ETIMEDOUT") {
   API_Timeout = new Date().getTime();
   throw new BotError({ message: "Couldn't get data in time." });
  }

  if (!response.data) throw new BotError({ message: "No data was found." });
  await interaction.editReply({ embeds: [createEmbed(response.data[0])] });

  function createEmbed(data: KitsuAnime) {
   if (!data) return { description: "We couldn't find any more data." };
   const { days, hours, minutes } = convertMinutes(data.totalLength);

   const formatRuntime = (minutes: number, hours: number, days: number) => {
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

   let categories: string[] | string = data.categories?.data?.map((c) => `\`\`${c.title}\`\``) ?? ["N/A"];
   categories = categories.join(", ");

   return new EmbedBuilder({
    description: truncate(data.synopsis, 3990),
    author: { name: truncate(data.canonicalTitle, 228), url: `https://kitsu.io/anime/${data.slug}` },
    footer: { text: Object.values(data.titles).join(" • ") },
    thumbnail: { url: data.posterImage.medium ?? "" },
    color: getColor(interaction.guild?.members.me),
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
      value: `${formatRuntime(minutes, hours, days) ?? "??"}`,
      inline: true,
     },
     {
      name: "Categories",
      value: categories,
     },
    ],
   });
  }
 },
};

export default command;
