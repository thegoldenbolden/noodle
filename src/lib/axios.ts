import { AxiosRequestConfig } from "axios";
import { ChatInputCommandInteraction } from "discord.js";
import BotError from "./classes/Error";
import { API } from "./cache";
import { useLog } from "./log";

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
   // Check if api call has already been made.
   let data = API.get(url.toLowerCase());
   if (data) return data;

   const axios = (await import("axios")).default;
   // Default timeout for fetch 20 seconds.
   config = { timeout: 20000, ...config };
   // Default cache time 3 hours.
   cache = { time: 60000 * 60 * 3, ...cache };

   const response = await axios.get(url, config).catch((e) => {
    if (e.code === "ECONNABORTED") {
     throw new BotError({ message: `We failed to get your request in time.`, log: true, command: name, info: e.code });
    }
    return e;
   });

   if (!response || response.status !== 200) {
    throw new BotError({ message: "We failed to get your request.", command: name, log: true, info: response.error });
   }

   // If url gives random response don't cache it.
   if (url.includes("/random") || cache.nocache) return response.data;

   // const timeout = setTimeout(() => {
   //  API.delete(url.toLowerCase());
   //  clearTimeout(timeout);
   // }, cache.time);

   // Alternative to setTimeouts
   // Delete all api calls that have an expired cache time.
   API.filter((url) => url.expiresAt <= Date.now()).forEach((data) => API.delete(data.url));

   API.set(url.toLowerCase(), { url, data: response.data, expiresAt: Date.now() + cache.time });
   return API.get(url.toLowerCase());
  },
 });
};
