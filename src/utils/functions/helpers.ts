import { APIEmbed } from "discord-api-types/v10";
import { Collection } from "discord.js";
import { Errors, Logs, Pasta } from "../../index";
import PastaError from "../classes/Error";
import { API } from "../constants/collections";
import { Helpers } from "../typings/functions";

export const randomColor = () => ~~(Math.random() * 16777215) + 1;
export const getColor: Helpers["GetColor"] = (member) => member?.displayColor ?? randomColor();
export const isPropValuesEqual = (subject: any[], target: any[], propNames: any[]) =>
 propNames.every((propName) => subject[propName] === target[propName]);

export const getUniqueItemsByProperties = (items: any[], propNames: string[]) =>
 items.filter((i, idx, a) => idx === a.findIndex((found) => isPropValuesEqual(found, i, Array.from(propNames))));

export const ordinal: Helpers["Ordinal"] = (number: number): string => {
 const [x, y] = [number % 10, number % 100];
 return x == 1 && y !== 11 ? `st` : x == 2 && y != 12 ? `nd` : x == 3 && y != 13 ? `rd` : `th`;
};

export const useAxios: Helpers["UseAxios"] = async ({ name, url, config, cache }) => {
 return await useLog({
  name: name || "Axios",
  params: [],
  callback: async () => {
   let data = API.get(url.toLowerCase());
   if (data) return data;
   const axios = (await import("axios")).default;

   config = {
    timeout: 20000,
    ...config,
   };

   cache = {
    time: 60000 * 60 * 3,
    ...cache,
   };

   const response = await axios.get(url, config).catch((e) => {
    if (e.code === "ECONNABORTED") {
     throw new PastaError({ message: `We failed to get your request in time.`, me: true, command: name });
    }
    return e;
   });

   if (!response || response.status !== 200) {
    throw new PastaError({ message: "We failed to get your request.", command: name, me: true, info: response.error });
   }

   if (url.includes("/random")) return response.data;

   const timeout = setTimeout(() => {
    API.delete(url.toLowerCase());
    clearTimeout(timeout);
   }, cache.time);

   API.set(url.toLowerCase(), response.data);
   return API.get(url.toLowerCase());
  },
 });
};

export const handleError = async (err: PastaError | Error, interaction?: any) => {
 const message = err instanceof PastaError ? err.message : "D: A noodle was burned...";
 if (interaction) {
  !interaction.deferred && (await interaction.deferReply({ ephemeral: true }));
  await interaction.editReply(message);
 }

 if ((err instanceof PastaError && err.me) || !(err instanceof PastaError)) {
  const embed: APIEmbed = {
   color: 0xff0000,
   title: `${(err as PastaError).command ?? interaction ? interaction.commandName : "No command name"}`,
   author: {
    name: `${interaction?.user.username}`,
    icon_url: `${interaction?.user.displayAvatarURL()}`,
   },
   description: `\`\`\`js\n${err.stack}\`\`\``,
  };

  Errors.send({ embeds: [embed] });
 }
};

export const useLog: Helpers["UseLog"] = async ({ name, callback, params = [] }) => {
 const start = Date.now();
 const data = await callback(...params);
 const end = Date.now();
 const duration = (end - start) / 1000;
 const usage = process.memoryUsage().heapUsed / 1024 / 1024;
 if (duration > 2 || usage >= 20) {
  let embed = {
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
  };

  Logs.send({ embeds: [embed] });
 }

 return data || null;
};

export const split: Helpers["Split"] = (data, elements = 1, transform) => {
 let array = [...data];

 if (data instanceof Collection) {
  array = data.map((e) => e);
 }

 const length = array.length;
 let replace: any[] = [];
 for (let i = 0; i < length; i += elements) {
  let spliced = array.splice(0, elements);

  if (transform) {
   spliced = spliced.map((element, index) => transform(element, index));
  }

  replace = [...replace, spliced];
 }

 return replace;
};

export const getInitialProps = async () => {
 let anime, manga: any;

 anime = (await import("../constants/anime.json")).default;
 manga = (await import("../constants/manga.json")).default;
 const animanga = Pasta.commands.get("animanga");

 anime = anime.data.map((data: any) => ({ name: data.name, value: data.mal_id }));
 manga = manga.data.map((data: any) => ({ name: data.name, value: data.mal_id }));
 anime = getUniqueItemsByProperties(anime, ["name", "value"]);
 manga = getUniqueItemsByProperties(manga, ["name", "value"]);

 if (animanga) {
  animanga.choices.anime.genres = anime;
  animanga.choices.manga.genres = manga;
 }
};
