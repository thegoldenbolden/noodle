import { ApplicationCommandData, ApplicationCommandOptionType, ApplicationCommandType, ChannelType } from "discord.js";
import ordinal from "../ordinal";
export let commands: ApplicationCommandData[] = [];

//#region Context Menus
commands.push({
 name: "Starboard",
 type: ApplicationCommandType.Message,
 dmPermission: false,
 defaultMemberPermissions: ["ManageGuild"],
});
//#endregion

//#region Commands With Perms
// Manage Guild
commands.push({
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
     data: { type: ApplicationCommandOptionType.Role, name: "role", description: "Remove a role" },
    }),
   ],
  },
  {
   type: ApplicationCommandOptionType.Subcommand,
   name: "edit",
   description: "Edit an autorole's message",
   options: [
    {
     type: ApplicationCommandOptionType.String,
     name: "message_link",
     description: "The autorole message link",
     required: true,
    },
   ],
  },
 ],
});

commands.push({
 name: "starboard",
 defaultMemberPermissions: ["ManageGuild"],
 description: "Create a starboard",
});

// Manage Roles
commands.push({
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
     data: { type: ApplicationCommandOptionType.User, name: "user", description: "Add to user" },
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
     data: { type: ApplicationCommandOptionType.User, name: "user", description: "Remove user" },
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
     data: { type: ApplicationCommandOptionType.Role, name: "role", description: "Delete role" },
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
});
//#endregion

//#region Commands without Perms
commands.push({
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
});

commands.push({
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
});

commands.push({
 name: "list",
 description: "Get a random item from the list",
 dmPermission: true,
 options: createGenericOptions({
  data: { type: ApplicationCommandOptionType.String, name: "item", description: "new item" },
  required: 2,
  length: 25,
 }),
});

commands.push({
 name: "comic",
 description: "Better than comic sans (May contain NSFW images)",
 dmPermission: true,
});

commands.push({
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
});

commands.push({
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
});

type Props = { data: any; required: number; length: number };
export function createGenericOptions({ data, required, length }: Props): any[] {
 const array = [];
 for (let i = 0; i < length; i++) {
  array.push({ ...data, name: `${i + 1}${ordinal(i + 1)}`, required: i < required });
 }
 return array;
}
