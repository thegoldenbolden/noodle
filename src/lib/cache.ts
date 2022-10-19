import { Collection } from "discord.js";

// Cached api calls.
type Data = { data: any; expiresAt: number; url: string };
export const API = new Collection<string, Data>();
export const Colors = new Collection();
