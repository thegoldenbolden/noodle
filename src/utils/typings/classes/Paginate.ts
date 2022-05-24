import { APISelectMenuComponent } from "discord-api-types/v10";
import { ChatInputCommandInteraction, Interaction, InteractionCollectorOptions, WebhookEditMessageOptions } from "discord.js";

export type ButtonIds = "FIRST" | "BACK" | "NEXT" | "LAST" | "PREVIOUS" | "LOAD";

export enum Keys {
 FIRST = 0,
 LOAD = 0,
 BACK = 1,
 NEXT = 2,
 LAST = 3,
 PREVIOUS = 3,
}

export type PaginateConstructor = {
 interaction: ChatInputCommandInteraction;
 options: InteractionCollectorOptions<Interaction>;
 pages?: any[];
 page?: number;
 page_index?: number;
 items_per_page?: number;
 is_last_page?: boolean;
	message: WebhookEditMessageOptions;
 menus?: APISelectMenuComponent[] | [];
 fetch: (page: number, items: number) => Promise<any>;
 format: (pages: any[], page: number, item: number) => WebhookEditMessageOptions;
};