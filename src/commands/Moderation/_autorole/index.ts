import { Autorole } from "@prisma/client";
import { APIRole, ChannelType, PermissionFlagsBits } from "discord-api-types/v10";
import { ChatInputCommandInteraction, Collection, Message, Role, TextChannel } from "discord.js";
import BotError from "../../../lib/classes/Error";
import { BotGuild } from "../../../types";

export default async function (interaction: ChatInputCommandInteraction, guild: BotGuild) {
 const subcommand = interaction.options.getSubcommand(true);
 const autoroles = guild.autoroles ?? [];
 const params: any[] = [interaction];

 // Checks finding title - add, create, delete, edit, remove
 const title = interaction.options.getString("id") ?? interaction.options.getString("title");
 if (!title) throw new BotError({ message: "A title wasn't provided D:" });

 const autorole = getAutorole(title, autoroles);
 if (subcommand === "create") {
  if (!/^[A-Z0-9_\s]{1,100}$/i.test(title))
   throw new BotError({ message: "Autorole titles can only contain letters, numbers, and spaces and be up to 100 characters." });
  if (/^\s*$/.test(title)) throw new BotError({ message: "Autorole titles must contain a letter, number, or underscore." });

  if (autorole)
   throw new BotError({ message: `There is already an autorole with the title \*\*\*${autorole.messageTitle}\*\*\*.` });
  // Each guild can only have 10 autoroles.
  if (autoroles.length >= 10) throw new BotError({ message: "This server can not have anymore autoroles." });
  params.push(title);
 } else {
  if (!autorole) throw new BotError({ message: `We couldn't find an autorole with the title \*\*\*${title}\*\*\*.` });
 }

 // For subcommnands - create, add, remove, edit. Check if bot has permission to send a message.
 let channel = interaction.options.getChannel("channel");
 channel = channel ? channel : autorole ? interaction.guild?.channels.cache.get(autorole.channelId) ?? null : null;
 channel && checkSend(interaction, channel as TextChannel);

 // For subcommands - create, add, remove. Get roles to upsert.
 let roles = interaction.options.resolved?.roles;
 roles = roles && filterRoles(interaction, roles);

 // For subcommands - add, remove. Check if select menu has reached its limit.
 const existing: number = autorole?.roleIds.length ?? 0;
 roles && messageLimit(roles, existing);

 let message: Message<boolean> | null = null;
 if (subcommand !== "create" && subcommand !== "delete") {
  message = await getMessage(autorole!, interaction);

  // For subcommands - remove
  if (subcommand == "remove" && existing === 0)
   throw new BotError({ message: "We cannot remove anymore roles from this autorole." });
 }

 autorole && params.push(autorole);
 channel && params.push(channel);
 roles && params.push(roles);
 message && params.push(message);

 const { run } = await import(`./${subcommand}`);
 await run(...params, guild);
}

type Roles = Collection<string, Role | APIRole | null> | undefined;
type Interaction = ChatInputCommandInteraction;
type X = Promise<Message<boolean>>;

const filterRoles = (interaction: Interaction, roles: Roles) => {
 if (!roles || roles.size == 0) throw new BotError({ message: "We couldn't find any roles provided." });
 if (!interaction.guild?.members?.me?.permissions.has(PermissionFlagsBits.ManageRoles))
  throw new BotError({ message: "We need the Manage Roles permission to use this command." });

 let failed: string[] = [];
 const valid = roles?.filter((role) => {
  if (!role || !(role as Role).editable || (role as Role).managed) {
   failed.push(`${role?.name}`);
   return false;
  }

  if (role.name == "@everyone") {
   failed.push(`${role.name}`);
   return false;
  }

  if (interaction.guild?.members?.me?.roles.highest.comparePositionTo(role.id)! < 0) {
   failed.push(`${role.name}`);
   return false;
  }
  return true;
 });

 if (failed.length > 0) throw new BotError({ message: `The following roles can not be used for autorole: ${failed.join(", ")}` });
 if (!valid || valid.size == 0) throw new BotError({ message: "We didn't receive any valid roles." });
 return valid;
};

export const checkSend = (interaction: Interaction, channel: TextChannel) => {
 if (channel.type !== ChannelType.GuildText || !interaction.channel)
  throw new BotError({ message: "We need to be in a text channel for this command to work." });
 const me = interaction.guild?.members?.me;
 if (!me) throw new BotError({ message: "We couldn't find ourselves. :(" });
 const permissions = [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ViewChannel];
 let msg = `we do not have one or more of the following permissions: Send Messages, Manage Messages, View Channel.`;
 if (!me.permissionsIn(interaction.channelId).has(permissions))
  throw new BotError({ message: `In ${interaction.channel}, ${msg}` });
 const permsInAutoroleChannel = me.permissionsIn(channel);
 if (!permsInAutoroleChannel.has(permissions)) throw new BotError({ message: `In ${channel}, ${msg}` });
};

const getAutorole = (id: string, autoroles: Autorole[]) => {
 id = id.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/g)
  ? id.substring(id.lastIndexOf("/") + 1, id.length)
  : id;
 return autoroles.find((a) => a.messageTitle.toLowerCase() == id.toLowerCase() || a.messageId == id);
};

const messageLimit = (roles: Roles, existing?: number) => {
 let amount = (existing ?? 0) + (roles?.size ?? 0);
 if (amount > 20) throw new BotError({ message: "There can only be 20 reactions per message." });
 if (amount < 1) throw new BotError({ message: "Menus need at least one role." });
 if (amount > 25) throw new BotError({ message: "Menus can only have 25 roles per message." });
};

const getMessage = async (x: Autorole, interaction: Interaction): X => {
 const channel = interaction.guild?.channels.cache.get(x.channelId) as TextChannel | undefined;
 if (!channel)
  throw new BotError({
   message: `We couldn't find the channel the autorole message.`,
   command: "Autorole",
   log: true,
   info: "Unable to fetch channel from discord",
  });
 const message = await channel.messages.fetch({ cache: true, message: `${x.messageId}` });
 if (!message)
  throw new BotError({
   message: `We couldn't find this autorole message.`,
   command: "Autorole",
   log: true,
   info: "Unable to fetch message from discord",
  });
 return message;
};
