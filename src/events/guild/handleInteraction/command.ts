import { ChannelType, CommandInteraction } from "discord.js";
import { Bot } from "../../..";
import { useLog } from "../../../lib/log";

export default async (interaction: CommandInteraction) => {
 const command = Bot.commands.get(interaction.commandName.toLowerCase());
 if (!command) return await interaction.reply("This command does not exist.");

 const params: any[] = [interaction];

 // Check Cooldown
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
   return await interaction.reply({
    ephemeral: true,
    content: "Please wait " + ((cooldownExpired - now) / 1000).toString(10) + " more seconds before reusing this command.",
   });
  }
 }

 userCooldown?.set(command.name, now);
 const timeout = setTimeout(() => {
  userCooldown?.delete(command.name);
  clearTimeout(timeout);
 }, commandCooldown);

 // Check Permissions
 if (command.permissions) {
  if (!interaction.memberPermissions) {
   return await interaction.reply("We were unable to check your permissions, cancelling command.");
  }

  if (!interaction.memberPermissions.has(command.permissions, true)) {
   return await interaction.reply({
    ephemeral: true,
    content: `We require the following permission(s): ${command.permissions.join(", ")}`,
   });
  }
 }

 if (command.log) {
  await useLog({ name: command.name, callback: command.execute, params: params });
 } else {
  await (command.execute as any)(...params);
 }
};
