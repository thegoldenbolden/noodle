import { APIApplicationCommandOptionChoice } from "discord-api-types/v10";
import {
	AutocompleteInteraction, Collection
} from "discord.js";
import { GuildProfile, SessionProfile, UserProfile } from "../database";
import { Card } from "../index";


export enum Load {
  User = 0,
  Guild = 1,
  UserAndGuild = 2,
}

export enum Category {
  Miscellaneous = 0,
  Games = 1,
		Moderation = 2,
}

export type Command = {
  name: string;
  description?: string;
  database?: Load;
  category?: Category;
  cooldown?: number | 3000;
  permissions?: any[];
  choices?: any;
  autocomplete?: (x: AutocompleteInteraction) => APIApplicationCommandOptionChoice[];
  execute: (request: any) => void;
};

export type PastaKing = {
  commands: Collection<string, Command>;
  guilds: Collection<string, SessionProfile<GuildProfile>>;
  users: Collection<string, SessionProfile<UserProfile>>;
  cooldowns: Collection<string, Map<string, number>>;
  deck: Card[];
};
