import { Autorole, Channel, Guild, Notification, User, Versus } from "@prisma/client";
import { BitFieldResolvable, ChatInputCommandInteraction, Collection, GuildEmoji, PermissionsString } from "discord.js";

export type Bot = {
 commands: Collection<string, Command>;
 guilds: Collection<string, BotGuild>;
 users: Collection<string, BotUser>;
 cooldowns: Collection<string, Map<string, number>>;
 deck: any[];
 games: Games;
};

export type BotGuild = Guild & {
 autoroles: Autorole[];
 notifications: Notification[];
 channels: Channel[];
};

export type BotUser = User;

type Games = {
 versus: Collection<string, Versus & { user?: { name: string; private: boolean } }>;
};

export type Command = {
 name: string;
 categories: ("Games" | "Utility" | "Miscellaneous" | "Moderation")[];
 permissions?: BitFieldResolvable<PermissionsString, bigint>[];
 database?: "Guild" | "User" | "UserAndGuild";
 cooldown?: number;
 log?: boolean;
 autocomplete?: any;
 execute: (interaction: ChatInputCommandInteraction, ...args: any) => Promise<void>;
};

export type Subcommand = (interaction: ChatInputCommandInteraction, ...args: any) => Promise<void>;
export type SubcommandExports = { [key: string]: Subcommand };

type Card = {
 short: string;
 name: string;
 value: number;
 emoji: GuildEmoji | null;
}[];

export type SubmissionType = "versus";
export enum InteractionIds {
 Autorole = "937bsjk4jfnjosh2891si",
 Review = "u3hjwdejwu84829393u29",
 Submissions = "v7wghfjiriwfjhfujqjoh",
}
