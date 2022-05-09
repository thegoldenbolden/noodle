import { CacheType, Interaction, InteractionCollector } from "discord.js";

	export type Jikan = {
			page?: number;
			type: "character" | "anime" | "manga" | "characters";
			placeholder: string;
			query: (page: number) => any;
			collector?: InteractionCollector<Interaction<CacheType>>;
			title: {
					get: (data: any, key: "name_kanji" | "name" | "english" | "japanese") => string;
					name: ["name" | "english", "name_kanji" | "japanese"];
			};
	};