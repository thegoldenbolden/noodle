import { Guild, User } from "discord.js";
import { Bot } from "../..";
import BotError from "../classes/Error";
import prisma from "../prisma";

export const loadUser = async (data: User) => {
 if (!data.id) {
  throw new BotError({
   log: true,
   message: "Whoops, someone forgot the water again.",
   command: "Loading from user",
  });
 }

 const user = Bot.users.get(data.id);
 if (user) return user;

 const loaded = await prisma.user.findUnique({ where: { discordId: data.id } });
 if (loaded) {
  Bot.users.set(data.id, loaded);
  return loaded;
 }

 const created = await createUser(data);
 Bot.users.set(data.id, created);
 return created;
};

export const loadGuild = async (data: Guild) => {
 if (!data.id) {
  throw new BotError({
   message: "An error occurred when fetching this guild.",
   log: true,
   info: JSON.stringify(data),
  });
 }

 const guild = Bot.guilds.get(data.id);
 if (guild) return guild;
 const loaded = await prisma.guild.findUnique({
  where: { guildId: data.id },
  include: { channels: true, notifications: true, autoroles: true },
 });
 if (loaded) {
  Bot.guilds.set(data.id, loaded);
  return loaded;
 }

 const created = await createGuild(data.id);
 Bot.guilds.set(data.id, created);
 return created;
};

export const createGuild = async (id: string) => {
 return await prisma.guild.create({
  data: {
   guildId: id,
  },
  include: {
   autoroles: true,
   notifications: true,
   channels: true,
  },
 });
};

export const createUser = async (data: User) => {
 const user = await prisma.user.create({
  data: {
   discordId: data.id,
   image: data.displayAvatarURL(),
   name: data.username,
  },
 });
 return user;
};

type Data = {
 prisma: any;
 data: {
  type: "users" | "guilds";
  id?: string;
 };
};

export const updateCache = async ({ prisma, data }: Data) => {
 if (prisma && data.id) {
  Bot[data.type].set(data.id, prisma);
 }
};
