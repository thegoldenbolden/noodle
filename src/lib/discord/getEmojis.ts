import { Collection, GuildEmoji } from "discord.js";
import { client } from "../..";

export const getEmoji = (emoji: string[]): Collection<string, GuildEmoji> | undefined => {
 const guilds = [
  "891401581650661456",
  "891401535605575781",
  "891819421507674112",
  "891722774593290280",
  "909896674401472532",
  `${process.env.NOODLE_SERVER}`,
  `${process.env.BUDS_SERVER}`,
 ];

 let emojis: Collection<string, GuildEmoji> | undefined = undefined;

 emojis = client.emojis.cache.filter((e: any) => {
  return guilds.includes(e.guild.id) && emoji.includes(e.name);
 });

 return emojis;
};
