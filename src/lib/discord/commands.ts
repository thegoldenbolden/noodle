import { ApplicationCommandData, ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { createGenericOptions } from "./Helpers";

type Commands = { [key: string]: ApplicationCommandData };

const CTX_MESSAGE = ApplicationCommandType.Message;
const CTX_USER = ApplicationCommandType.User;
const CHATINPUT = ApplicationCommandType.ChatInput;

const MENTIONABLE = ApplicationCommandOptionType.Mentionable;
const ROLE = ApplicationCommandOptionType.Role;
const CHANNEL = ApplicationCommandOptionType.Channel;
const USER = ApplicationCommandOptionType.User;
const STRING = ApplicationCommandOptionType.String;
const BOOLEAN = ApplicationCommandOptionType.Boolean;
const INTEGER = ApplicationCommandOptionType.Integer;
const NUMBER = ApplicationCommandOptionType.Number;
const ATTACHMENT = ApplicationCommandOptionType.Attachment;
const SUBCOMMAND = ApplicationCommandOptionType.Subcommand;
const SUBCOMMAND_GROUP = ApplicationCommandOptionType.SubcommandGroup;

const commands: Commands = {
 // Context Menus
 Starboard: {
  name: "Starboard",
  type: CTX_MESSAGE,
  dmPermission: false,
  defaultMemberPermissions: ["ManageGuild"],
 },
 ["Edit Autorole"]: {
  name: "Edit Autorole",
  type: CTX_MESSAGE,
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
    type: SUBCOMMAND,
    options: [
     ...createGenericOptions({
      required: 1,
      length: 25,
      data: {
       type: ROLE,
       name: "role",
       description: "Add a role",
      },
     }),
    ],
   },
   {
    type: SUBCOMMAND,
    name: "add",
    description: "Add a role to the message",
    options: [
     {
      type: STRING,
      name: "message_link",
      description: "The autorole message link",
      required: true,
     },
     ...createGenericOptions({
      required: 1,
      length: 5,
      data: {
       type: ROLE,
       name: "role",
       description: "Add a role",
      },
     }),
    ],
   },
   {
    type: SUBCOMMAND,
    name: "remove",
    description: "Remove a role from the message",
    options: [
     {
      type: STRING,
      name: "message_link",
      description: "The autorole message link",
      required: true,
     },
     ...createGenericOptions({
      required: 1,
      length: 5,
      data: { type: ROLE, name: "role", description: "Remove a role" },
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
    type: SUBCOMMAND,
    options: [
     {
      name: "role",
      description: "Role to add",
      required: true,
      type: ROLE,
     },
     ...createGenericOptions({
      required: 1,
      length: 20,
      data: { type: USER, name: "user", description: "Add to user" },
     }),
     {
      type: STRING,
      name: "reason",
      description: "Reason for giving role",
     },
    ],
   },
   {
    name: "remove",
    description: "Remove role from user(s)",
    type: SUBCOMMAND,
    options: [
     {
      name: "role",
      description: "Role to remove",
      required: true,
      type: ROLE,
     },
     ...createGenericOptions({
      required: 1,
      length: 23,
      data: { type: USER, name: "user", description: "Remove user" },
     }),
     {
      type: STRING,
      name: "reason",
      description: "Reason for removing role",
     },
    ],
   },
   {
    name: "create",
    description: "Creates a role with no permissions",
    type: SUBCOMMAND,
    options: [
     {
      name: "name",
      description: "Role name",
      type: STRING,
      required: true,
     },
     {
      name: "color",
      description: "Role color",
      type: STRING,
     },
     {
      name: "hoist",
      description: "Display role separate from other members",
      type: BOOLEAN,
     },
     {
      name: "mentionable",
      description: "Whether the role is mentionable",
      type: BOOLEAN,
     },
     {
      name: "reason",
      description: "Reason for creation",
      type: STRING,
     },
     {
      name: "position",
      description: "Place the role above which role, defaults to bottom",
      type: ROLE,
     },
     {
      name: "user",
      description: "The user to assign the role to",
      type: USER,
     },
    ],
   },
   {
    name: "delete",
    description: "Delete roles",
    type: SUBCOMMAND,
    options: [
     ...createGenericOptions({
      required: 1,
      length: 24,
      data: { type: ROLE, name: "role", description: "Delete role" },
     }),
     {
      name: "reason",
      description: "Reason for deletion",
      type: STRING,
     },
    ],
   },
   {
    name: "edit",
    description: "Edit a role",
    type: SUBCOMMAND,
    options: [
     {
      name: "role",
      description: "The role to edit",
      type: ROLE,
      required: true,
     },
     {
      name: "name",
      description: "The new name",
      type: STRING,
     },
     {
      name: "color",
      description: "The new color",
      type: USER,
     },
     {
      name: "mentionable",
      description: "Whether to allow members to mention",
      type: BOOLEAN,
     },
     {
      name: "position",
      description: "Place the role below which role, defaults to bottom",
      type: ROLE,
     },
     {
      name: "hoist",
      description: "Display role separate from other members",
      type: BOOLEAN,
     },
     {
      name: "reason",
      description: "Reason for edit",
      type: STRING,
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
    type: STRING,
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
    type: SUBCOMMAND,
    options: [
     {
      name: "mininum",
      description: "The smallest number",
      type: INTEGER,
      min_value: 0,
      max_value: 999999,
     },
     {
      name: "maximum",
      description: "The largest number — Max: 1000000",
      type: INTEGER,
      max_value: 1000000,
      min_value: 1,
     },
    ],
   },
   {
    name: "dice",
    description: "rick dice",
    type: SUBCOMMAND,
    options: [
     {
      name: "dice",
      description: "The amount of die — Max: 30, defaults to 1",
      max_value: 30,
      min_value: 1,
      type: INTEGER,
     },
     {
      name: "sides",
      description: "The amount of sides — Max: 100, defaults to 6",
      max_value: 100,
      min_value: 1,
      type: INTEGER,
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
   data: { type: STRING, name: "item", description: "new item" },
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
    type: NUMBER,
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
    type: STRING,
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
    type: STRING,
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
    type: STRING,
    required: true,
   },
  ],
 },
};

export const botOwnerCommands: Commands = {
 managecmds: {
  name: "managecmds",
  description: "manage app commands",
  defaultMemberPermissions: ["Administrator"],
  dmPermission: false,
  options: [
   {
    name: "action",
    required: true,
    description: "Manage action",
    type: STRING,
    choices: [
     { name: "List", value: "list" },
     { name: "Register", value: "register" },
     { name: "Edit", value: "edit" },
    ],
   },
   {
    name: "guild_only",
    required: true,
    description: "Guild or global command",
    type: BOOLEAN,
   },
   {
    required: false,
    name: "command",
    description: "the command name",
    type: STRING,
   },
  ],
 },
};

export default commands;
