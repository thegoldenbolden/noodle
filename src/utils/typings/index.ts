import { GuildEmoji } from "discord.js";

export type Card = {
  number: number;
  value: number;
  name?: string;
  emoji?: GuildEmoji;
};

