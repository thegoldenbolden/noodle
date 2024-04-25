import { type ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type { Command, TODO } from "../../types";
import { fetcher } from "../../lib/fetcher";
import { BotError } from "../../lib/error";
import { getColor } from "../../lib/utils";
import { Logs } from "../..";
import { ApiCache } from "../../lib/cache";

export default {
  name: "comic",
  categories: ["Miscellaneous"],
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const comicNum = interaction.options.getInteger("number", false) ?? 0;

    const { data }: TODO = await fetcher({
      interaction,
      name: "Comic",
      url: "https://xkcd.com/info.0.json",
    });

    const err = {
      message: "Trix are indeed for kids because I encountered a problem.",
      log: true,
    };

    if (comicNum > data.num) {
      throw new BotError({
        message: `There are currently only ${data.num} comics available.`,
      });
    }

    const random = comicNum ? comicNum : ~~(Math.random() * (data.num - 1)) + 1;

    const { data: comic }: TODO = await fetcher({
      interaction,
      name: "Comic",
      url: `https://xkcd.com/${random}/info.0.json`,
    });

    if (!comic) {
      throw new BotError(err);
    }

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
} satisfies Command;
