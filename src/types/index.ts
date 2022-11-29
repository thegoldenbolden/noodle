import {
 BitFieldResolvable,
 ChatInputCommandInteraction,
 Collection,
 Guild,
 GuildEmoji,
 PermissionsString,
 User,
} from "discord.js";

export type Bot = {
 commands: Collection<string, Command>;
 guilds: Collection<string, Guild>;
 users: Collection<string, User>;
 cooldowns: Collection<string, Map<string, number>>;
 deck?: Deck;
};

export type BotUser = User;

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

type Deck = {
 short: string;
 name: string;
 value: number;
 emoji: GuildEmoji | null;
}[];
