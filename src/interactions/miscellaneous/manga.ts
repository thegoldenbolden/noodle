import type { Command } from "../../types";
import type { KitsuManga } from "../../types/apis";
import { truncate, getColor } from "../../lib/utils";
import { EmbedBuilder } from "discord.js";
import { KitsuApi } from "../..";
import { BotError } from "../../lib/error";

export default {
  name: "manga",
  categories: ["Miscellaneous"],
  cooldown: 10,
  execute: async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    await interaction.deferReply();
    const name = interaction.options.getString("name", true);

    const response = await KitsuApi.get("manga", {
      params: {
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

    if (response.code === "ETIMEDOUT") {
      throw new BotError({ message: "Couldn't get data in time." });
    }

    if (!response.data) {
      throw new BotError({ message: "No data was found." });
    }

    await interaction.editReply({ embeds: [createEmbed(response.data[0])] });

    function createEmbed(data: KitsuManga) {
      if (!data) {
        return { description: "We couldn't find any more data." };
      }

      let categories: string[] | string = data.categories?.data?.map(
        (c) => `\`\`${c.title}\`\``
      ) ?? ["N/A"];
      categories = categories.join(", ");

      return new EmbedBuilder({
        description: truncate(data.synopsis, 3090),
        color: getColor(interaction.guild?.members.me),
        author: {
          name: truncate(data.canonicalTitle, 228),
          url: `https://kitsu.io/manga/${data.slug}`,
        },
        footer: { text: truncate(Object.values(data.titles).join(" • "), 200) },
        thumbnail: { url: data.posterImage.medium ?? "" },
        fields: [
          {
            name: "Type • Age Rating",
            value: `${data.subtype ?? "??"} • ${data.ageRating ?? "??"}`,
            inline: true,
          },
          {
            name: "Aired",
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
      });
    }
  },
} satisfies Command;
