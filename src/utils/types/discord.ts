import { APIEmbed, APIMessage, APISelectMenuComponent } from "discord-api-types/v10";
import {
	ApplicationCommandOptionChoiceData,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	Collection,
	Interaction,
	InteractionCollector,
	InteractionCollectorOptions,
	Message,
	PermissionsString, SelectMenuInteraction
} from "discord.js";
import { GuildProfile, SessionProfile, UserProfile } from "./database";
import { Card } from "./index";

export enum Load {
  User = 0,
  Guild = 1,
  UserAndGuild = 2,
}

export enum Category {
  Miscellaneous = 0,
  Games = 1,
}

export type Command = {
  name: string;
  description?: string;
  database?: Load;
  category?: Category;
  cooldown?: number | 3000;
  permissions?: PermissionsString[];
  choices?: any;
  autocomplete?: (x: AutocompleteInteraction) => ApplicationCommandOptionChoiceData[];
  execute: (request: ChatInputCommandInteraction) => {};
};

export type PastaKing = {
  commands: Collection<string, Command>;
  guilds: Collection<string, SessionProfile<GuildProfile>>;
  users: Collection<string, SessionProfile<UserProfile>>;
  cooldowns: Collection<string, Map<string, number>>;
  deck: Card[];
};

export type PaginationData = {
  next_page: boolean;
  max: number;
  current_item: number;
  preview?: APIEmbed[];
  fullview: APIEmbed[];
  menus: APISelectMenuComponent[];
  content?: string;
};

export type Pagination = {
  message?: APIMessage | Message<boolean>;
  interaction: ChatInputCommandInteraction | SelectMenuInteraction;
  options: InteractionCollectorOptions<Interaction<CacheType>, CacheType>;
  getData: (page: number, collector: InteractionCollector<Interaction<CacheType>>) => Promise<PaginationData>;
  pagination: PaginationData[];
  ephemeral: boolean;
  query?: string;
		initial: "preview" | "fullview"
};


// export namespace Paginate {
// 	export type Create = (data: Data) => void;
// 	export type Buttons = (i?: string[], k?: any, h?: ButtonArgs) => { buttons: ButtonBuilder[], emojis?: Emojis};
// 	type ButtonArgs = {
// 		disabled?: boolean;
// 		defaults?: boolean;
// 		style?: ButtonStyle.Primary | ButtonStyle.Secondary
// 	} 

// export type ButtonResponse = (i: ButtonInteraction) => Collection<string, GuildEmoji>;
// export type MenuResponse = (i: SelectMenuInteraction) => SelectMenuComponentData;

// 	type Emojis = {
// 		first?: GuildEmoji,
// 		back?: GuildEmoji,
// 		next?: GuildEmoji,
// 		last?: GuildEmoji,
// 	[e: string]: GuildEmoji | undefined;
// 	}

// 	export type Page = {
//   next_page?: boolean;
//   max: number;
//   index: number;
//   preview?: EmbedBuilder[];
//   fullview: EmbedBuilder[];
//   menus?: SelectMenuBuilder[];
//   content?: string;
// 	}

// 	export type Data = {
// 		interaction: ChatInputCommandInteraction;
// 		buttonIds?: string[];
// 		default: boolean;
// 		initial: "preview" | "fullview",
// 		emojis?: string[],
// 		custom?: (i: MessageComponentInteraction) => void;
// 		message?: APIMessage | Message<boolean>;
//   options: InteractionCollectorOptions<Interaction<CacheType>, CacheType>;
//   getData: (page: number, collector?: InteractionCollector<Interaction<CacheType>>) => Promise<Page>;
//   page: Page[];
//   ephemeral: boolean;
//   query?: string;
// 	}
// }

// export type GetEmoji = (name: string) => GuildEmoji | undefined;
