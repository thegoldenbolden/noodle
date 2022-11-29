import { Collection, GuildEmoji } from "discord.js";
import { client } from "../..";

export const getEmoji = (emoji: string[]): Collection<string, GuildEmoji> | undefined => {
 const guilds = [`${process.env.DEV_SERVER}`];
 let emojis: Collection<string, GuildEmoji> | undefined = undefined;

 emojis = client.emojis.cache.filter((e: any) => {
  return guilds.includes(e.guild.id) && emoji.includes(e.name);
 });

 return emojis;
};
