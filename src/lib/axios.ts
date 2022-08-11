import { AxiosRequestConfig } from "axios";
import { ChatInputCommandInteraction } from "discord.js";
import BotError from "./classes/Error";
import { API } from "./collections";
import useLog from "./log";

type AxiosParams = {
 name: string;
 url: string;
 interaction?: ChatInputCommandInteraction;
 config?: AxiosRequestConfig<any>;
 cache?: { time: number; nocache?: boolean };
};

export default async ({ name, url, config, cache }: AxiosParams) => {
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
     throw new BotError({ message: `We failed to get your request in time.`, log: true, command: name });
    }
    return e;
   });

   if (!response || response.status !== 200) {
    throw new BotError({ message: "We failed to get your request.", command: name, log: true, info: response.error });
   }

   if (url.includes("/random") || cache.nocache) return response.data;

   const timeout = setTimeout(() => {
    API.delete(url.toLowerCase());
    clearTimeout(timeout);
   }, cache.time);

   API.set(url.toLowerCase(), response.data);
   return API.get(url.toLowerCase());
  },
 });
};
