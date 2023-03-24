import { Collection } from "discord.js";

// Cached api calls.
type Data = { data: any; expiresAt: number; url: string; id?: string };
export const API = new Collection<string, Data>();
export const Colors = new Collection();

// Probably use this for all.
// type Cached<T> = {
//  data: T;
//  url?: string;
//  user: {
//   id: string;
//   name?: string;
//  };
// };

// export const Cache = new Collection<string, Cached<any>>();
