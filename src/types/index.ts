import {
 AnySelectMenuInteraction,
 AutocompleteInteraction,
 BitFieldResolvable,
 ButtonInteraction,
 Collection,
 ModalSubmitInteraction,
 PermissionsString,
} from "discord.js";

import type { CommandName } from "../lib/register";

type OpenAI = {
 id: string;
 prompt: string;
 expiresAt: number;
};

export type Bot = {
 commands: Collection<string, Command>;
 cooldowns: Collection<string, Map<string, number>>;
 modals: Collection<string, any>;
 openai: Collection<string, OpenAI>;
};

export interface Command {
 name: CommandName;
 contexts?: string[];
 private?: boolean;
 categories?: ("Games" | "Utility" | "Miscellaneous" | "Moderation")[];
 permissions?: BitFieldResolvable<PermissionsString, bigint>[];
 cooldown?: number;

 buttons?: (interaction: ButtonInteraction, arg?: string) => Promise<void>;
 autocomplete?: (interaction: AutocompleteInteraction, arg?: string) => Promise<void>;
 menu?: (interaction: AnySelectMenuInteraction, arg?: string) => Promise<void>;
 modals?: (interaction: ModalSubmitInteraction, arg?: string) => Promise<void>;

 // FIXME: type
 execute(interaction: any): Promise<void>;
}
