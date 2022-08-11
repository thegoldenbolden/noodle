import { ApplicationCommandData, ApplicationCommandOptionType, ApplicationCommandType, ChannelType } from "discord.js";
import { createGenericOptions } from "./commands";
export let commands: ApplicationCommandData[] = [];

//#region Context Menus
commands.push({
 name: "Starboard",
 type: ApplicationCommandType.Message,
 dmPermission: false,
});
commands.push({
 name: "Profile",
 type: ApplicationCommandType.User,
});
//#endregion

//#region Commands With Perms
// Manage Guild
commands.push({
 name: "setup",
 description: "Setup starboard, autoroles, etc..",
 dmPermission: false,
 defaultMemberPermissions: ["ManageGuild"],
 options: [
  {
   type: ApplicationCommandOptionType.SubcommandGroup,
   name: "autorole",
   description: "Setup an autorole menu",
   options: [
    {
     name: "create",
     description: "Create an autorole",
     type: ApplicationCommandOptionType.Subcommand,
     options: [
      {
       type: ApplicationCommandOptionType.String,
       name: "title",
       description: "Enter a title for the message",
       required: true,
      },
      {
       type: ApplicationCommandOptionType.Channel,
       name: "channel",
       description: "What channel will the message be in",
       required: true,
       channelTypes: [ChannelType.GuildText],
      },
      ...createGenericOptions({
       required: 1,
       length: 20,
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
       name: "id",
       description: "The autorole message link, id, or title",
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
       name: "id",
       description: "The autorole message link, id, or title",
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
     name: "delete",
     description: "Delete an autorole message",
     options: [
      {
       type: ApplicationCommandOptionType.String,
       name: "id",
       description: "The autorole message link, id, or title",
       required: true,
      },
     ],
    },
    {
     type: ApplicationCommandOptionType.Subcommand,
     name: "edit",
     description: "Edit an autorole's message",
     options: [
      {
       type: ApplicationCommandOptionType.String,
       name: "id",
       description: "The autorole message link, id, or title",
       required: true,
      },
      {
       type: ApplicationCommandOptionType.Boolean,
       name: "embedded",
       description: "Whether to embed the message",
      },
      {
       type: ApplicationCommandOptionType.Boolean,
       name: "content",
       description: "Whether to edit the message content",
      },
     ],
    },
   ],
  },
  {
   type: ApplicationCommandOptionType.SubcommandGroup,
   name: "starboard",
   description: "Setup a starboard",
   options: [
    {
     name: "set",
     description: "Set a starboard",
     type: ApplicationCommandOptionType.Subcommand,
     options: [
      {
       type: ApplicationCommandOptionType.Channel,
       name: "channel",
       description: "The channel to use",
       required: true,
       channelTypes: [ChannelType.GuildText],
      },
      {
       type: ApplicationCommandOptionType.Role,
       name: "can_star",
       description: "Role that can send messages to the starboard, defaults to admins",
      },
     ],
    },
    {
     name: "remove",
     description: "Remove the starboard",
     type: ApplicationCommandOptionType.Subcommand,
    },
   ],
  },
 ],
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
 name: "profile",
 dmPermission: false,
 description: "View profile and stuff",
 options: [
  {
   name: "view",
   description: "View a user's profile",
   type: ApplicationCommandOptionType.Subcommand,
   options: [
    {
     name: "user",
     description: "The user to view",
     type: ApplicationCommandOptionType.User,
     required: true,
    },
   ],
  },
  {
   name: "privacy",
   description: "Toggle user privacy",
   type: ApplicationCommandOptionType.Subcommand,
  },
 ],
});

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
 name: "games",
 description: "Play games such as Versus and more.",
 dmPermission: true,
 options: [
  {
   name: "game",
   description: "Choose a game to play",
   type: ApplicationCommandOptionType.String,
   required: true,
   choices: [
    {
     name: "Versus",
     value: "versus",
    },
   ],
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
 name: "color",
 description: "View a color",
 dmPermission: true,
 options: [
  {
   name: "hex",
   type: ApplicationCommandOptionType.String,
   description: "ex. fe3 or fea7ea",
  },
  {
   name: "rgb",
   type: ApplicationCommandOptionType.String,
   description: "ex. 102 38 45 or '102, 32, 49'",
  },
  {
   name: "name",
   description: "Find a color by name",
   type: ApplicationCommandOptionType.String,
  },
 ],
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

// commands.push({
//  name: "shop",
//  description: "Visit Noodles",
//  dmPermission: true,
//  options: [
//   {
//    name: "buy",
//    description: "Buy an item",
//    type: ApplicationCommandOptionType.Subcommand,
//    options: [
//     {
//      name: "item",
//      description: "The item's name",
//      type: ApplicationCommandOptionType.Integer,
//      autocomplete: true,
//      required: true,
//     },
//     {
//      name: "amount",
//      description: "Amount to buy",
//      type: ApplicationCommandOptionType.Integer,
//      minValue: 1,
//     },
//    ],
//   },
//   {
//    name: "sell",
//    description: "Sell an item at 75% market price",
//    type: ApplicationCommandOptionType.Subcommand,
//    options: [
//     {
//      name: "item",
//      description: "The item's name",
//      type: ApplicationCommandOptionType.Integer,
//      autocomplete: true,
//      required: true,
//     },
//     {
//      name: "amount",
//      description: "Amount to sell",
//      type: ApplicationCommandOptionType.Integer,
//      minValue: 1,
//     },
//    ],
//   },
//  ],
// });

commands.push({
 name: "server",
 description: "View server info",
 dmPermission: false,
 options: [
  {
   name: "view",
   description: "View roles",
   type: ApplicationCommandOptionType.String,
   choices: [
    { name: "General", value: "general" },
    { name: "Roles", value: "roles" },
   ],
  },
 ],
});

commands.push({
 name: "submissions",
 description: "Submit data for versus, etc..",
 dmPermission: true,
 options: [
  {
   name: "category",
   description: "The submission category",
   required: true,
   type: ApplicationCommandOptionType.String,
   choices: [
    {
     name: "Versus",
     value: "versus",
    },
   ],
  },
 ],
});
