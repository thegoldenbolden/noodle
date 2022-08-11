import { APIEmbed, APISelectMenuComponent } from "discord-api-types/v10";
import { CacheType, CollectedInteraction, CommandInteraction, Interaction, InteractionCollector, InteractionCollectorOptions } from "discord.js";

export namespace Paginate {
 export type Data = {
  itemsPerPage?: number;
  nextPage?: boolean;
  lastPage?: number;
  currentItem: number;
  maxItemsOnPage: number;
  preview?: APIEmbed[];
  fullview: APIEmbed[];
  menus?: APISelectMenuComponent[];
 };

 export type Options = {
  hasButtons: boolean;
  hasMenu: boolean;
  createData: Jikan;
  interaction: CommandInteraction;
  ephemeral: boolean;
  pagination: Paginate.Data[];
  query?: string;
  initial: "preview" | "fullview";
  options: InteractionCollectorOptions<CollectedInteraction<CacheType>, CacheType>;
  getData: (args: Jikan) => Promise<Paginate.Data>;
 };
}

export type Jikan = {
 page?: number;
 type: "character" | "anime" | "manga" | "characters";
 placeholder: string;
 query: (page: number) => any;
 collector?: InteractionCollector<CollectedInteraction<CacheType>>;
 title: {
  get: (data: any, key: "name_kanji" | "name" | "english" | "japanese") => string;
  name: ["name" | "english", "name_kanji" | "japanese"];
 };
};
