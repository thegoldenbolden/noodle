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
  inHand: number;
  inBank: number;
  blessStreak: number;
  dailyClaimed: boolean;
  lastDaily: number | null;
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

type Alerts = {
  id: string;
  message: string;
  read: boolean;
};

type Privacy = {
  shareStats: boolean;
};

type Autoroles = {
  type: "selection" | "reaction" | "button";
  messageTitle: string;
  channelId: string;
  messageId: string;
};

type Channels = {
  starboard: string | null;
  logger: string | null;
  alerts: string | null;
};

type Settings = {
  autorolesLimit: 10;
};

type Warning = "Spam" | "Harassment" | string;

type Warnings = {
  times: number;
  issuer: string;
  issuerId: string;
  reasons: Warning[];
};

type BlacklistCommand = {
  name: string;
  issuer: string;
  issuerId: string;
  reason: string;
  issueDate: number;
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
  issuerId: string;
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
  type: "add" | "remove" | "edit" | "get";
  table: "guilds" | "users";
  column: string;
  z: any;
  id: string;
}

export interface ArrayParams extends Params {
  key?: string;
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
  id?: string | null;
  query?: string;
  username?: string;
}

export interface SharedProfile {
  id: string;
  alerts: Alerts[];
}

export interface UserProfile extends SharedProfile {
  username: string | null;
  birthday: Date | null;
  fame: Fame;
  noodles: Noodles;
  privacy: Privacy;
  stories: Story[];
  stats: Stats;
}

export interface GuildProfile extends SharedProfile {
  channels: Channels;
  autoroles: Autoroles[];
  settings: Settings;
  warnings: Warnings[];
  blacklist: {
    links: BlacklistLinks[];
    commands: BlacklistCommands[];
    words: BlacklistWords[];
  };
  autoresponse: AutoResponse[];
}

export type GuildOrUser<T extends GuildProfile | UserProfile> =
  T extends UserProfile ? UserProfile : GuildProfile;

export type SessionProfile<T extends GuildProfile | UserProfile> =
  T extends GuildProfile
    ? GuildProfile & { session: true }
    : UserProfile & { session: true };
