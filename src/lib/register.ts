import {
 type ApplicationCommandData,
 ApplicationCommandOptionType,
 ApplicationCommandType,
} from "discord.js";

import { BotError } from "./error";
import { client } from "..";
import { ordinal } from "./utils";

export const commands = {
 // Context Menus
 Starboard: {
  name: "Starboard",
  type: ApplicationCommandType.Message,
  dmPermission: false,
  defaultMemberPermissions: ["ManageGuild"],
 },
 ["Edit Autorole"]: {
  name: "Edit Autorole",
  type: ApplicationCommandType.Message,
  dmPermission: false,
  defaultMemberPermissions: ["ManageGuild"],
 },
 // Commands With Perms,
 autorole: {
  name: "autorole",
  defaultMemberPermissions: ["ManageGuild"],
  dmPermission: false,
  description: "Setup an autorole menu",
  options: [
   {
    name: "create",
    description: "Create an autorole",
    type: ApplicationCommandOptionType.Subcommand,
    options: [
     ...createGenericOptions({
      required: 1,
      length: 25,
      data: {
       type: ApplicationCommandOptionType.Role,
       name: "role",
       description: "Add a role",
      },
     }),
    ],
   },
   {
    type: ApplicationCommandOptionType.Subcommand,
    name: "add",
    description: "Add a role to the message",
    options: [
     {
      type: ApplicationCommandOptionType.String,
      name: "message_link",
      description: "The autorole message link",
      required: true,
     },
     ...createGenericOptions({
      required: 1,
      length: 5,
      data: {
       type: ApplicationCommandOptionType.Role,
       name: "role",
       description: "Add a role",
      },
     }),
    ],
   },
   {
    type: ApplicationCommandOptionType.Subcommand,
    name: "remove",
    description: "Remove a role from the message",
    options: [
     {
      type: ApplicationCommandOptionType.String,
      name: "message_link",
      description: "The autorole message link",
      required: true,
     },
     ...createGenericOptions({
      required: 1,
      length: 5,
      data: {
       type: ApplicationCommandOptionType.Role,
       name: "role",
       description: "Remove a role",
      },
     }),
    ],
   },
  ],
 },
 starboard: {
  name: "starboard",
  defaultMemberPermissions: ["ManageGuild"],
  description: "Create a starboard",
 },
 role: {
  name: "role",
  description: "Add, create, delete, or edit a role",
  dmPermission: false,
  defaultMemberPermissions: ["ManageRoles"],
  options: [
   {
    name: "add",
    description: "Add user(s) a role",
    type: ApplicationCommandOptionType.Subcommand,
    options: [
     {
      name: "role",
      description: "Role to add",
      required: true,
      type: ApplicationCommandOptionType.Role,
     },
     ...createGenericOptions({
      required: 1,
      length: 20,
      data: {
       type: ApplicationCommandOptionType.User,
       name: "user",
       description: "Add to user",
      },
     }),
     {
      type: ApplicationCommandOptionType.String,
      name: "reason",
      description: "Reason for giving role",
     },
    ],
   },
   {
    name: "remove",
    description: "Remove role from user(s)",
    type: ApplicationCommandOptionType.Subcommand,
    options: [
     {
      name: "role",
      description: "Role to remove",
      required: true,
      type: ApplicationCommandOptionType.Role,
     },
     ...createGenericOptions({
      required: 1,
      length: 23,
      data: {
       type: ApplicationCommandOptionType.User,
       name: "user",
       description: "Remove user",
      },
     }),
     {
      type: ApplicationCommandOptionType.String,
      name: "reason",
      description: "Reason for removing role",
     },
    ],
   },
   {
    name: "create",
    description: "Creates a role with no permissions",
    type: ApplicationCommandOptionType.Subcommand,
    options: [
     {
      name: "name",
      description: "Role name",
      type: ApplicationCommandOptionType.String,
      required: true,
     },
     {
      name: "color",
      description: "Role color",
      type: ApplicationCommandOptionType.String,
     },
     {
      name: "hoist",
      description: "Display role separate from other members",
      type: ApplicationCommandOptionType.Boolean,
     },
     {
      name: "mentionable",
      description: "Whether the role is mentionable",
      type: ApplicationCommandOptionType.Boolean,
     },
     {
      name: "reason",
      description: "Reason for creation",
      type: ApplicationCommandOptionType.String,
     },
     {
      name: "position",
      description: "Place the role above which role, defaults to bottom",
      type: ApplicationCommandOptionType.Role,
     },
     {
      name: "user",
      description: "The user to assign the role to",
      type: ApplicationCommandOptionType.User,
     },
    ],
   },
   {
    name: "delete",
    description: "Delete roles",
    type: ApplicationCommandOptionType.Subcommand,
    options: [
     ...createGenericOptions({
      required: 1,
      length: 24,
      data: {
       type: ApplicationCommandOptionType.Role,
       name: "role",
       description: "Delete role",
      },
     }),
     {
      name: "reason",
      description: "Reason for deletion",
      type: ApplicationCommandOptionType.String,
     },
    ],
   },
   {
    name: "edit",
    description: "Edit a role",
    type: ApplicationCommandOptionType.Subcommand,
    options: [
     {
      name: "role",
      description: "The role to edit",
      type: ApplicationCommandOptionType.Role,
      required: true,
     },
     {
      name: "name",
      description: "The new name",
      type: ApplicationCommandOptionType.String,
     },
     {
      name: "color",
      description: "The new color",
      type: ApplicationCommandOptionType.User,
     },
     {
      name: "mentionable",
      description: "Whether to allow members to mention",
      type: ApplicationCommandOptionType.Boolean,
     },
     {
      name: "position",
      description: "Place the role below which role, defaults to bottom",
      type: ApplicationCommandOptionType.Role,
     },
     {
      name: "hoist",
      description: "Display role separate from other members",
      type: ApplicationCommandOptionType.Boolean,
     },
     {
      name: "reason",
      description: "Reason for edit",
      type: ApplicationCommandOptionType.String,
     },
    ],
   },
  ],
 },
 // Commands Without Perms
 youtube: {
  name: "youtube",
  description: "Search for a YouTube video",
  dmPermission: true,
  options: [
   {
    type: ApplicationCommandOptionType.String,
    name: "video",
    required: true,
    description: "The name of the video to search",
   },
  ],
 },
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
 ask: {
  name: "ask",
  dmPermission: false,
  description: "Ask AI a question",
  options: [
   {
    name: "prompt",
    description: "Please enter a prompt",
    type: ApplicationCommandOptionType.String,
    required: true,
   },
  ],
 },
 color: {
  name: "color",
  description: "view a color",
  options: [
   {
    type: ApplicationCommandOptionType.String,
    name: "value",
    description: "enter a hex code or rgb value, e.g. #face32",
   },
  ],
 },
} satisfies { [key: string]: ApplicationCommandData };

export type CommandName = keyof typeof commands;


const values = Object.values(commands);
export async function setCommands() {
 try {
  if (process.env.NODE_ENV.trim() === "production") {
   await client.application?.commands.set(values);
   return;
  }

  if (client.isReady()) {
   const guild = client.guilds.cache.get(process.env.PRIVATE_SERVER);
   const cmds = await guild?.commands.set(values);
   console.log(cmds);
  }
 } catch (error) {
  console.error(error);
 }
}

export async function resetCommands() {
 try {
  if (process.env.NODE_ENV.trim() == "production") {
   await client.application?.commands.set(values);
   return;
  }
  if (client.isReady()) {
   const guild = client.guilds.cache.get(process.env.PRIVATE_SERVER);
   await guild?.commands.set([]);
  }
 } catch (error) {
  console.log(error);
 }
}

// Guild Commands
export async function createGuildCommand(name: CommandName) {
 if (!client.isReady()) {
  console.error("Client is not ready");
  return;
 }

 const guild = client.guilds.cache.get(process.env.PRIVATE_SERVER);
 if (!guild) {
  throw new BotError({
   message: `Unable to find server - id: ${process.env.PRIVATE_SERVER}`,
  });
 }

 const command = commands[name];
 if (!command) {
  throw new BotError({ message: "Unable to find command" });
 }

 const cmd = await guild.commands.create(command);
 console.log(`${cmd.id} - ${cmd.name}`);
}

export async function editGuildCommand(id: string, name: CommandName) {
 if (!client.isReady()) {
  console.error("Client is not ready");
  return;
 }

 const guild = client.guilds.cache.get(process.env.PRIVATE_SERVER);
 if (!guild) {
  throw new BotError({
   message: `Unable to find server - id: ${process.env.PRIVATE_SERVER}`,
  });
 }

 const command = commands[name];
 if (!command) {
  throw new BotError({ message: "Unable to find command" });
 }

 const cmd = await guild.commands.edit(id, command);
 console.log(`${cmd.id} - ${cmd.name}`);
}

export async function deleteGuildCommand(commandId: string) {
 const guild = client.guilds.cache.get(process.env.PRIVATE_SERVER);
 if (!guild) {
  throw new Error(`Unable to find server: ${process.env.PRIVATE_SERVER}`);
 }
 await guild.commands.delete(commandId);
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

type Props = { data: any; required: number; length: number };
export function createGenericOptions({ data, required, length }: Props): any[] {
 const array = [];
 for (let i = 0; i < length; i++) {
  array.push({
   ...data,
   name: `${i + 1}${ordinal(i + 1)}`,
   required: i < required,
  });
 }
 return array;
}
