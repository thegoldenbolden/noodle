import { LimitedCollection } from "discord.js";
import type { TODO } from "../types";

type Data = { data: TODO; expiresAt: number; url: string; id?: string };
export const ApiCache = new LimitedCollection<string, Data>({
  maxSize: 10,
});
