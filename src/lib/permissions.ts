import {
 type CommandInteraction,
 ChannelType,
 PermissionFlagsBits,
 TextBasedChannel,
} from "discord.js";

import { Bot } from "..";
import { Command } from "../types";
import { BotError } from "./error";

export function checkSend(channel: TextBasedChannel | null) {
 if (!channel) {
  throw new BotError({ message: "We couldn't find this channel." });
 }

 if (channel.type !== ChannelType.GuildText) {
  throw new BotError({
   message: "We need to be in a text channel for this command to work.",
  });
 }

 const me = channel?.guild.members?.me;

 if (!me) {
  throw new BotError({ message: "Unable to find my permissions" });
 }

 const permissions = [
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.ViewChannel,
 ];
 let msg = `We do not have one or more of the following permissions: Send Messages,  View Channel.`;

 if (!me.permissionsIn(channel.id).has(permissions)) {
  throw new BotError({ message: `In ${channel}, ${msg}` });
 }

 const channelToSendToPerms = me.permissionsIn(channel);
 if (!channelToSendToPerms.has(permissions)) {
  throw new BotError({ message: `In ${channel}, ${msg}` });
 }
}

export function checkCooldown(
 interaction: CommandInteraction,
 command: Command
) {
 let userCooldown = Bot.cooldowns.get(interaction.user.id);

 if (!userCooldown) {
  Bot.cooldowns.set(interaction.user.id, new Map());
  userCooldown = Bot.cooldowns.get(interaction.user.id);
 }

 const remainingTime = userCooldown?.get(command.name);
 const now = Date.now();
 const commandCooldown = 1000 * (command.cooldown || 3);
 if (remainingTime) {
  const cooldownExpired = remainingTime + commandCooldown;

  if (cooldownExpired > now) {
   throw new BotError({
    message:
     "Please wait " +
     ((cooldownExpired - now) / 1000).toString(10) +
     " more seconds before reusing this command.",
   });
  }
 }

 userCooldown?.set(command.name, now);
 const timeout = setTimeout(() => {
  userCooldown?.delete(command.name);
  clearTimeout(timeout);
 }, commandCooldown);
}

export function checkPermissions(
 member: CommandInteraction["memberPermissions"],
 command: Command["permissions"]
) {
 if (!command) return;

 if (!member) {
  throw new BotError({
   message: "We were unable to check your permissions, cancelling command.",
  });
 }

 if (!member.has(command, true)) {
  throw new BotError({
   message: `We require the following permission(s): ${command.join(", ")}`,
  });
 }
}
