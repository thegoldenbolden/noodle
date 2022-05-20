type Medal = {
  name: MedalName;
  description: MedalDescription;
  earned: number;
};

type Fame = {
  xp: number;
  rep: number;
  rank: number;
  medal: MedalName;
  medals: Medal[];
};

export enum MedalDescription {
  "Pasta Extraordinaire" = "",
  "Impastable" = "",
  "Pasta Master" = "",
  "Pasta Intolerant" = "",
  "Pasta Praiser" = "",
  "Pasta Rookie" = "For embarking on your culinary journey.",
  "Gambling Fanatic" = "",
  "Blackjack Pro" = "",
}

type MedalName =
  | "Pasta Extraordinare"
  | "Pasta Master"
  | "Pasta Rookie"
  | "Pasta Intolerant"
  | "Impastable"
  | "Pasta Praiser";

type Noodles = {
  pocket: number;
  bank: number;
  bless_streak: number;
  daily_claimed: boolean;
  last_daily: number | null;
};

type Stats = {
  blackjack: Blackjack;
};

type Slots = {
  earned: number;
  noodles: number;
  diamonds: number;
  yens: number;
  slots: number;
  tacos: number;
  fries: number;
  sushi: number;
  losses: number;
};

export type Highlow = {
  earned: number;
  streak: number;
  streak_earnings: number;
};

type Baccarat = {
  earned: number;
  wins: number;
  losses: number;
  ties: number;
};

type Blackjack = {
  wins: number;
  losses: number;
  busts: number;
  ties: number;
};

type Comments = {
  author: string;
  avatar: string;
  text: string;
  date: number;
};

type Chapters = {
  chapter: number;
  title: string;
  text: string;
  comments: Comments[];
};

type Story = {
  title: string;
  author: string;
  avatar: string;
  id: string;
  comments: Comments[];
  chapters: Chapters[];
};

export type Notifications = {
  id: string;
		message_title: string;
  message: string;
  read: boolean;
};

type Privacy = {
  share_stats: boolean;
};

export type Autorole = {
  message_title: string;
		created: number,
  channel_id: string;
		message_id: string;
		created_by: string;
		role_ids: string[];
		type: "reaction" | "button" | "menu",
		emoji_ids?: string[];
}

export type Channels = {
  starboard: string | null;
  logger: string | null;
};

type Settings = {
  autoroles_limit: 25;
};

type Warning = "Spam" | "Harassment" | string;

type Warnings = {
  times: number;
  issuer: string;
  issuer_id: string;
  reasons: Warning[];
};

type BlacklistCommand = {
  name: string;
  issuer: string;
  issuer_id: string;
  reason: string;
  issue_date: number;
};

type BlacklistCommands = {
  username: string;
  id: string;
  commands: BlacklistCommand[];
};

type AutoResponse = {
  type: "reaction" | "message";
  keyword: string;
  issuer: string;
  issuer_id: string;
  reason?: string;
  added: number;
};

type BlacklistLinks = {
  domain: string | null;
  exact: string | null;
  whitelisted: boolean;
};

type BlacklistWords = {
  word: string;
  exact: boolean;
  part: boolean;
};

export type APIs = {
  limited: boolean;
  name: string;
  reset: Date;
};

interface Params {
  type?: "add" | "remove" | "edit" | "get";
  table: "guilds" | "users";
  column: string;
  discord_id: string;
}

export interface ArrayParams extends Params {
  key?: string;
		updateValue?: any;
  lookupValue?: any;
  lookup?: string;
  nested?: string;
}

export interface JSONParams extends Params {
  path: string;
}

export interface QueryArgs {
  table: "guilds" | "users";
  column?: string;
  discord_id?: string | null;
  query?: string;
  username?: string;
}

export interface SharedProfile {
  discord_id: string;
  notifications: Notifications[];
		[key: string]: any
}

export interface UserProfile extends SharedProfile {
  username: string | null;
  birthday: Date | null;
  noodles: Noodles;
		notifications: Notifications[]
}


type AnalyticsData = {
	amount: number, 
	date: Date
}

export type Analytics = {
		messages: AnalyticsData[],
		joins: AnalyticsData[],
		leaves: AnalyticsData[],
}

export interface GuildProfile extends SharedProfile {
  channels: Channels;
  autoroles: Autorole[] | null;
  settings: Settings;
}

export type GuildOrUser<T extends GuildProfile | UserProfile> =
  T extends UserProfile ? UserProfile : GuildProfile;

export type SessionProfile<T extends GuildProfile | UserProfile> =
  T extends GuildProfile
    ? GuildProfile
    : UserProfile