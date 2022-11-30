import {
 BitFieldResolvable,
 ChatInputCommandInteraction,
 Collection,
 PermissionsString,
 StringSelectMenuComponentData,
} from "discord.js";

export type Bot = {
 commands: Collection<string, Command>;
 cooldowns: Collection<string, Map<string, number>>;
 modals: Collection<string, any>;
};

export type Command = {
 name: string;
 categories: ("Games" | "Utility" | "Miscellaneous" | "Moderation")[];
 permissions?: BitFieldResolvable<PermissionsString, bigint>[];
 cooldown?: number;
 log?: boolean;
 autocomplete?: any;
 execute: (interaction: ChatInputCommandInteraction, ...args: any) => Promise<void>;
};
