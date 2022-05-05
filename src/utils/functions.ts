import { EmbedBuilder } from "@discordjs/builders";
import { AxiosRequestConfig } from "axios";
import { error, logger, Pasta } from "../index";

export const randomColor = () => ~~(Math.random() * 16777215) + 1;

export const ordinal = (number: number): string => {
  let [x, y] = [number % 10, number % 100];

  return x == 1 && y !== 11 ? `st` : x == 2 && y != 12 ? `nd` : x == 3 && y != 13 ? `rd` : `th`;
};

export const useAxios = async (url: string, options?: AxiosRequestConfig) => {
  const axios = (await import("axios")).default;
  const response = await axios.get(url, options);
  logger.send(`API: ${url}`);

  if (response.status !== 200) {
    throw new Error("There was an error getting your request.");
  }

  return response.data;
};

export const handleError = async (err: unknown, request?: any) => {
  if (err instanceof Error) {
    const embed = new EmbedBuilder()
      .setColor([255, 0, 0])
      .setAuthor({
        name: `${request?.user.username}`,
        iconURL: `${request?.user.displayAvatarURL()}`,
      })
      .setTitle(`Cause: ${err.cause}`)
      .setDescription(`${err.message}`)
      .setFields([
        {
          name: `Cause Name: ${err.cause?.name}`,
          value: `Stack: ${err.stack}`,
        },
        {
          name: `Name`,
          value: `${err.name}`,
        },
      ]);

    error.send({ embeds: [embed] });

    if (request) {
      !request.deferred && (await request.deferReply({ ephemeral: true }));
      console.log(err.cause);
      request.editReply(err.message ?? "Oops, I burnt my pasta...");
    }
  }
};

export const execution = async (name: string, cb: Function, ...params: any[]) => {
  const start = Date.now();

  await cb(...params);

  const end = Date.now();
  logger.send({
    embeds: [
      {
        title: `${name} Execution`,
        color: randomColor(),
        fields: [
          {
            name: `Time Taken`,
            value: `${((end - start) / 1000).toFixed(2)} seconds..`,
          },
          {
            name: `Current Memory`,
            value: `${process.memoryUsage().heapUsed / 1024 / 1024}`,
          },
        ],
      },
    ],
  });
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

  if (process.env.NODE_ENV === "production") {
    [anime, manga] = await Promise.all([
      await useAxios("https://api.jikan.moe/v4/genres/anime"),
      await useAxios("https://api.jikan.moe/v4/genres/manga"),
    ]);
  } else {
    anime = (await import("./constants/anime.json")).default;
    manga = (await import("./constants/manga.json")).default;
  }

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
