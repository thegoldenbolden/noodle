import { APIEmbed, APISelectMenuComponent } from "discord-api-types/v10";
import { CacheType, CommandInteraction, Interaction, InteractionCollectorOptions } from "discord.js";
import { Jikan } from "./Jikan";

export namespace Paginate {
	export type Data = {
		itemsPerPage?: number,
		nextPage?: boolean;
		lastPage?: number;
		currentItem: number;
		maxItemsOnPage: number,
		preview?: APIEmbed[]
		fullview: APIEmbed[],
		menus?: APISelectMenuComponent[],
	}

	export type Options = {
		hasButtons: boolean,
		hasMenu: boolean,
		createData: Jikan,
		interaction: CommandInteraction,
		ephemeral: boolean,
		pagination: Paginate.Data[],
		query?: string,
		initial: "preview" | "fullview",
  options: InteractionCollectorOptions<Interaction<CacheType>, CacheType>,
  getData: (args: Jikan) => Promise<Paginate.Data>,
	}
};