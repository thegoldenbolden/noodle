import { GuildEmoji } from "discord.js";
import { client } from "../..";
import { ordinal } from "../Helpers";

export const createButton = (emojiNameOrId?: string[] | string) => {
 const buttons = [];
};

export const getEmoji = (emojiNamesOrIds: string[] | string) => {
 emojiNamesOrIds = Array.isArray(emojiNamesOrIds) ? emojiNamesOrIds : [emojiNamesOrIds];

 const guilds = [process.env.PRIVATE_SERVER];
 return client.emojis.cache.find((e: any) => {
  return guilds.includes(e.guild.id) && emojiNamesOrIds.includes(e.name);
 });
};

type Props = { data: any; required: number; length: number };
export function createGenericOptions({ data, required, length }: Props): any[] {
 const array = [];
 for (let i = 0; i < length; i++) {
  array.push({ ...data, name: `${i + 1}${ordinal(i + 1)}`, required: i < required });
 }
 return array;
}
