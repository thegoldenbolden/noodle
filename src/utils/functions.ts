import { AxiosRequestConfig } from "axios";
import { APIEmbed } from "discord-api-types/v10";
import { Collection, Interaction } from "discord.js";
import { error, logger, Pasta } from "../index";
import { BotError } from "./classes/BotError";

export const randomColor = () => ~~(Math.random() * 16777215) + 1;

export const ordinal = (number: number): string => {
  let [x, y] = [number % 10, number % 100];
  return x == 1 && y !== 11 ? `st` : x == 2 && y != 12 ? `nd` : x == 3 && y != 13 ? `rd` : `th`;
};

const API = new Collection();
export const useAxios = async (url: string, i?: Interaction, options?: AxiosRequestConfig) => {
  return await useLog(
    "AXIOS",
    async () => {
      let data = API.get(url);
      if (data) return data;
      const axios = (await import("axios")).default;

      console.log(url);
      if (!options?.timeout) {
        options = {
          ...options,
          timeout: 20000,
        };
      }

      const response = await axios.get(url, options).catch((e) => {
        if (e.code === "ECONNABORTED") {
          throw new BotError("I failed to get info in time.");
        }
      });

      if (!response || response.status !== 200) {
        throw new BotError("There was an error getting your request.");
      }

      if (url.includes("/random")) {
        return response.data;
      } else {
        const timeout = setTimeout(() => {
          API.delete(url);
          clearTimeout(timeout);
        }, 60000 * 60 * 3);

        API.set(url, response.data);
        return API.get(url);
      }
    },
    i
  );
};

export const handleError = async (err: unknown, request?: any) => {
  if (err instanceof Error) {
    console.log(err);

    const embed: APIEmbed = {
      color: 0xff0000,
      author: {
        name: `${request?.user.username}`,
        icon_url: `${request?.user.displayAvatarURL()}`,
      },
      title: `Cause: ${err.cause}`,
      description: `${err.message}`,
      fields: [
        {
          name: `Cause Name: ${err.cause?.name}`,
          value: `Stack: ${err.stack?.substring(0, 1000)}`,
        },
        {
          name: `Name`,
          value: `${err.name}`,
        },
      ],
    };

    try {
      error.send({ embeds: [embed] });

      if (request) {
        !request.deferred && (await request.deferReply({ ephemeral: true }));
        let msg = err instanceof BotError ? err.message ?? "Oops, I burnt my pasta..." : "An error occurred..";
        request.editReply(msg);
      }
    } catch (err) {
      console.log(err);
    }

    return;
  }
  console.log(err);
};

export const useLog = async (name: string, cb: Function, ...params: any[]) => {
  // try {
  const start = Date.now();
  const data = await cb(...params);
  const end = Date.now();
  const duration = (end - start) / 1000;
  const usage = process.memoryUsage().heapUsed / 1024 / 1024;

  if (duration > 2 || usage >= 20) {
    logger.send({
      embeds: [
        {
          title: `${name}`,
          color: randomColor(),
          fields: [
            {
              name: `Duration`,
              value: `${((end - start) / 1000).toFixed(2)} seconds..`,
            },
            {
              name: `Memory`,
              value: `${usage}`,
            },
          ],
        },
      ],
    });
  }

  if (data) {
    return data;
  }
};

export const isPropValuesEqual = (subject: any, target: any, propNames: any[]) =>
  propNames.every((propName) => subject[propName] === target[propName]);

export const getUniqueItemsByProperties = (items: any[], propNames: any[]) => {
  const propNamesArray = Array.from(propNames);

  return items.filter(
    (item, index, array) => index === array.findIndex((foundItem) => isPropValuesEqual(foundItem, item, propNamesArray))
  );
};

export const getInitialProps = async () => {
  let anime, manga: any;

  // TO DO LATER: Write data weekly to json file.
  // if (process.env.NODE_ENV === "production") {
  //   [anime, manga] = await Promise.all([
  //     await useAxios("https://api.jikan.moe/v4/genres/anime"),
  //     await useAxios("https://api.jikan.moe/v4/genres/manga"),
  //   ]);
  // } else {
  // }

  anime = (await import("./constants/anime.json")).default;
  manga = (await import("./constants/manga.json")).default;
  const animanga = Pasta.commands.get("animanga");

  anime = anime.data.map((data: any) => ({
    name: data.name,
    value: data.mal_id,
  }));

  manga = manga.data.map((data: any) => ({
    name: data.name,
    value: data.mal_id,
  }));

  anime = getUniqueItemsByProperties(anime, ["name", "value"]);
  manga = getUniqueItemsByProperties(manga, ["name", "value"]);

  if (animanga) {
    animanga.choices.anime.genres = anime;
    animanga.choices.manga.genres = manga;
  }
};
