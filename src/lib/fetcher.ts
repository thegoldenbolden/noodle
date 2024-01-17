import { AxiosRequestConfig } from "axios";
import { ChatInputCommandInteraction } from "discord.js";
import { BotError } from "./error";
import { time } from "./logger";
import { API } from "./cache";

type AxiosParams = {
 name: string;
 url: string;
 interaction?: ChatInputCommandInteraction;
 config?: AxiosRequestConfig<any>;
 cache?: { time: number; nocache?: boolean };
};

const DEFAULT_TIMEOUT = 20; // 20 secs
const DEFAULT_CACHE_TIME = 10800; // 3 hrs

export async function fetcher({
 name,
 url,
 interaction,
 config,
 cache,
}: AxiosParams) {
 return await time({
  name: name || "Axios",
  params: [],
  callback: async () => {
   // Check cache
   let data = API.get(url.toLowerCase());
   if (data) return data;

   const axios = (await import("axios")).default;
   config = { timeout: DEFAULT_TIMEOUT * 1000, ...config };
   cache = { time: DEFAULT_CACHE_TIME * 1000, ...cache };

   const response = await axios.get(url, config).catch((e) => {
    if (e.code === "ECONNABORTED") {
     throw new BotError({
      message: `We failed to get your request in time.`,
      log: true,
      command: name,
      info: e.code,
     });
    }
    return e;
   });

   if (!response || response.status !== 200) {
    throw new BotError({
     message: "We failed to get your request.",
     command: name,
     log: true,
     info: response.error,
    });
   }

   if (cache.nocache) {
    return response.data;
   }

   API.filter((url) => url.expiresAt <= Date.now()).forEach((data) =>
    API.delete(data.url)
   );

   API.set(url.toLowerCase(), {
    url,
    id: interaction?.id,
    data: response.data,
    expiresAt: Date.now() + cache.time,
   });

   return API.get(url.toLowerCase());
  },
 });
}
