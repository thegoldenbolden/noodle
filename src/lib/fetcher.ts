import type { ChatInputCommandInteraction } from "discord.js";
import { BotError } from "./error";
import { time } from "./logger";
import { ApiCache } from "./cache";

type Params = {
  name: string;
  url: string;
  interaction?: ChatInputCommandInteraction;
  config?: RequestInit;
  cache?: { time: number; nocache?: boolean };
};

const DEFAULT_CACHE_TIME = 3600; // 3 hrs

export async function fetcher({
  name,
  url,
  interaction,
  config,
  cache,
}: Params) {
  return await time({
    name: name || "Fetcher",
    params: [],
    callback: async () => {
      const data = ApiCache.get(url.toLowerCase());
      if (data) return data;

      cache = { time: DEFAULT_CACHE_TIME * 1000, ...cache };

      const response = await fetch(url, config).catch((e) => {
        throw new BotError({
          message: "We failed to get your request in time.",
          log: true,
          command: name,
          info: e.code,
        });
      });

      if (!response || response.status !== 200) {
        throw new BotError({
          message: "We failed to get your request.",
          command: name,
          log: true,
          info: JSON.stringify(response, null, 2),
        });
      }

      const resolved = await response.json();
      if (cache.nocache) return resolved;

      const expired = ApiCache.filter((url) => url.expiresAt <= Date.now());

      for (const data of expired) {
        ApiCache.delete(data[1].url);
      }

      ApiCache.set(url.toLowerCase(), {
        url,
        id: interaction?.id,
        data: resolved,
        expiresAt: Date.now() + cache.time,
      });

      return ApiCache.get(url.toLowerCase());
    },
  });
}
