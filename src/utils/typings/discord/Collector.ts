// // import { CacheType, Collection, CommandInteraction, Interaction, InteractionCollectorOptions, MessageButton, MessageComponentInteraction, MessageEmbedOptions, MessageSelectMenu } from "discord.js"

// import { CacheType, Collection, CommandInteraction, Interaction, InteractionCollectorOptions, MessageComponentInteraction, MessageEmbed, MessageSelectMenu } from "discord.js";

// // export namespace Collector {
// // 	export interface Args {
// // 		readonly COLLECTOR_OPTIONS?: InteractionCollectorOptions<Interaction<CacheType>, CacheType>,
// // 		readonly CUSTOM_END?: (interaction: Collection<string, Interaction<CacheType>>, reason: string) => any
// // 		readonly CUSTOM_COLLECT?: (interaction: MessageComponentInteraction) => any
// // 		readonly GET_DATA?: (args: Jikan | any, page: number) => Promise<any>,
// // 		readonly INTERACTION: CommandInteraction,
// // 		readonly FULLVIEW: MessageEmbedOptions[][],
// // 		readonly CONTENT?: string,
// // 		readonly EPHEMERAL?: boolean
// // 		readonly QUERY?: string,
// // 		readonly USE_DATA?: Jikan | any,
// // 		page: PaginateData,
// // 		index: number,
// // 		buttons?: MessageButton[]
// // 		menus?: MessageSelectMenu[],
// // 	}

// // 	export interface PaginateData {
// // 		readonly CURRENT_PAGE: number,
// // 		readonly LAST_PAGE?: number,
// // 		readonly NEXT_PAGE?: boolean,
// // 		readonly MAX_ITEMS_ON_PAGE: number
// // 		readonly ITEMS_PER_PAGE: number,
// // 	}

// // 	export type Paginate = (args: Args) => Promise<void>;
// // };

// export namespace Paginate {
// 	export type Types = "Buttons" | "Menus" | "Both"
// 	export type Options = {
// 		readonly customEnd?: (interactions: Collection<string, Interaction<CacheType>>, reason: string) => any
// 		readonly customCollect?: (interaction: MessageComponentInteraction) => any
// 		type: Types;
// 		interaction: CommandInteraction,
// 		ephemeral: boolean
// 		collector: InteractionCollectorOptions<Interaction<CacheType>, CacheType>,
// 		pages: {
// 			embeds: MessageEmbed[],
// 			menu?: MessageSelectMenu
// 	},
// 	buttonIds?: string[] | boolean,
// 	}
// }
