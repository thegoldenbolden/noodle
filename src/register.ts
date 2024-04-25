import { Logs, client } from ".";
import { BotError } from "./lib/error";
import { ordinal } from "./lib/utils";
import type { TODO } from "./types";
import {
  type ApplicationCommandData,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";

export const commands = {
  // Context Menus
  Starboard: {
    name: "Starboard",
    type: ApplicationCommandType.Message,
    dmPermission: false,
    defaultMemberPermissions: ["ManageGuild"],
  },
  // Commands With Perms,
  starboard: {
    name: "starboard",
    defaultMemberPermissions: ["ManageGuild"],
    description: "Create a starboard",
  },
  // Commands Without Perms
  rick: {
    name: "rick",
    description: "Rick dice or random number",
    dmPermission: true,
    options: [
      {
        name: "number",
        description: "Rick a random number",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "mininum",
            description: "The smallest number",
            type: ApplicationCommandOptionType.Integer,
            min_value: 0,
            max_value: 999999,
          },
          {
            name: "maximum",
            description: "The largest number — Max: 1000000",
            type: ApplicationCommandOptionType.Integer,
            max_value: 1000000,
            min_value: 1,
          },
        ],
      },
      {
        name: "dice",
        description: "rick dice",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "dice",
            description: "The amount of die — Max: 30, defaults to 1",
            max_value: 30,
            min_value: 1,
            type: ApplicationCommandOptionType.Integer,
          },
          {
            name: "sides",
            description: "The amount of sides — Max: 100, defaults to 6",
            max_value: 100,
            min_value: 1,
            type: ApplicationCommandOptionType.Integer,
          },
        ],
      },
    ],
  },
  list: {
    name: "list",
    description: "Get a random item from the list",
    dmPermission: true,
    options: createGenericOptions({
      data: {
        type: ApplicationCommandOptionType.String,
        name: "item",
        description: "new item",
      },
      required: 2,
      length: 25,
    }),
  },
  comic: {
    name: "comic",
    description: "Better than comic sans",
    dmPermission: true,
    options: [
      {
        description: "The comic number",
        name: "number",
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
    ],
  },
  anime: {
    name: "anime",
    description: "Search for an anime",
    dmPermission: true,
    options: [
      {
        name: "name",
        description: "anime title",
        required: true,
        type: ApplicationCommandOptionType.String,
      },
    ],
  },
  manga: {
    name: "manga",
    description: "Search for a manga",
    dmPermission: true,
    options: [
      {
        name: "name",
        required: true,
        description: "manga title",
        type: ApplicationCommandOptionType.String,
      },
    ],
  },
} satisfies { [key: string]: ApplicationCommandData };

export type CommandName = keyof typeof commands;

const values = Object.values(commands);
export async function setCommands() {
  try {
    await client.application?.commands.set(values);
  } catch (error) {
    console.error(error);
    Logs.send("There was an error setting application commands.");
  }
}

export async function resetCommands() {
  try {
    await client.application?.commands.set(values);
  } catch (error) {
    console.log(error);
  }
}

// Global Commands
export async function createGlobalCommand(name: CommandName) {
  if (!client.isReady()) {
    console.error("Client is not ready");
    return;
  }

  if (!client.application) {
    throw new BotError({
      message: "Missing ClientApplication",
    });
  }

  const command = commands[name];

  if (!command) {
    throw new BotError({ message: "Unable to find command" });
  }

  const cmd = await client.application.commands.create(command);
  console.log(`${cmd.id} - ${cmd.name}`);
}

export async function editGlobalCommand(id: string, name: CommandName) {
  if (!client.isReady()) {
    console.error("Client is not ready");
    return;
  }

  if (!client.application) {
    throw new BotError({
      message: "Missing ClientApplication",
    });
  }

  const command = commands[name];
  if (!command) {
    throw new BotError({ message: "Unable to find command" });
  }

  const cmd = await client.application.commands.edit(id, command);
  console.log(`${cmd.id} - ${cmd.name}`);
}

export async function deleteGlobalCommand(commandId: string) {
  await client.application?.commands.delete(commandId);
}

type Props = { data: TODO; required: number; length: number };
export function createGenericOptions({
  data,
  required,
  length,
}: Props): TODO[] {
  const array: TODO[] = [];
  for (let i = 0; i < length; i++) {
    array.push({
      ...data,
      name: `${i + 1}${ordinal(i + 1)}`,
      required: i < required,
    });
  }
  return array;
}
