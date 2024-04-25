import type {
  AnySelectMenuInteraction,
  AutocompleteInteraction,
  BitFieldResolvable,
  ButtonInteraction,
  Collection,
  ModalSubmitInteraction,
  PermissionsString,
} from "discord.js";

import type { CommandName } from "../register";

// biome-ignore lint: will do later
export type TODO = any;

export type Bot = {
  commands: Collection<string, Command>;
  cooldowns: Collection<string, Map<string, number>>;
  modals: Collection<string, TODO>;
};

export interface Command {
  name: CommandName;
  contexts?: string[];
  private?: boolean;
  categories?: ("Games" | "Utility" | "Miscellaneous" | "Moderation")[];
  permissions?: BitFieldResolvable<PermissionsString, bigint>[];
  cooldown?: number;

  buttons?: (interaction: ButtonInteraction, arg?: string) => Promise<void>;
  autocomplete?: (
    interaction: AutocompleteInteraction,
    arg?: string
  ) => Promise<void>;
  menu?: (interaction: AnySelectMenuInteraction, arg?: string) => Promise<void>;
  modals?: (interaction: ModalSubmitInteraction, arg?: string) => Promise<void>;
  execute(interaction: TODO): Promise<void>;
}
