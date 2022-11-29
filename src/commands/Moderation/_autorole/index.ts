import { APIRole, ChannelType, PermissionFlagsBits } from "discord-api-types/v10";
import { ChatInputCommandInteraction, Collection, Message, Role, TextChannel } from "discord.js";
import BotError from "../../../lib/classes/Error";
import { BotGuild } from "../../../types";

export default async function (interaction: ChatInputCommandInteraction, guild: BotGuild) {
 const subcommand = interaction.options.getSubcommand(true);

 let id = interaction.options.getString("id", true);
 id = extractId(id);

 // For subcommnands - create, add, remove, edit. Check if bot has permission to send a message.
 const { run } = await import(`./${subcommand}`);
 await run(...[], guild);
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

const extractId = (id: string) => {
 return id.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/g)
  ? id.substring(id.lastIndexOf("/") + 1, id.length)
  : id;
};

const messageLimit = (roles: Roles, existing?: number) => {
 let amount = (existing ?? 0) + (roles?.size ?? 0);
 if (amount > 20) throw new BotError({ message: "There can only be 20 reactions per message." });
 if (amount < 1) throw new BotError({ message: "Menus need at least one role." });
 if (amount > 25) throw new BotError({ message: "Menus can only have 25 roles per message." });
};

const getMessage = async (channelId: string, messageId: string, interaction: Interaction): X => {
 const channel = interaction.guild?.channels.cache.get(channelId) as TextChannel | undefined;
 if (!channel)
  throw new BotError({
   message: `We couldn't find the channel the autorole message.`,
   command: "Autorole",
   log: true,
   info: "Unable to fetch channel from discord",
  });

 const message = await channel.messages.fetch({ cache: true, message: `${messageId}` });
 if (!message)
  throw new BotError({
   message: `We couldn't find this autorole message.`,
   command: "Autorole",
   log: true,
   info: "Unable to fetch message from discord",
  });
 return message;
};
