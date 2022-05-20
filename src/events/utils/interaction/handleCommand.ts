import { CommandInteraction } from "discord.js";
import { Pasta } from "../../../index";
import { get } from "../../../utils/functions/database";
import { useLog } from "../../../utils/functions/helpers";
import { GuildProfile, UserProfile } from "../../../utils/typings/database";
import { Load } from "../../../utils/typings/discord";
export default async (interaction: CommandInteraction) => {
  const command = Pasta.commands.get(interaction.commandName.toLowerCase());
  if (!command) return await interaction.reply("This command does not exist.");

  const params: any[] = [];

  switch (command.database) {
    case Load.User:
      params.push(await get<UserProfile>({ discord_id: interaction.user.id, table: "users" }));
      break;
    case Load.Guild:
      params.push(await get<GuildProfile>({ discord_id: interaction.guildId, table: "guilds" }));
      break;
    case Load.UserAndGuild:
      params.push(await get<UserProfile>({ discord_id: interaction.user.id, table: "users" }));
      params.push(await get<GuildProfile>({ discord_id: interaction.guildId, table: "guilds" }));
      break;
  }

  interaction.isContextMenuCommand() && params.push(true);

  // Check Cooldown
  let userCooldown = Pasta.cooldowns.get(interaction.user.id);
  if (!userCooldown) {
    Pasta.cooldowns.set(interaction.user.id, new Map());
    userCooldown = Pasta.cooldowns.get(interaction.user.id);
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
    if (!interaction.memberPermissions?.has(command.permissions, true)) {
      return await interaction.reply({
        ephemeral: true,
        content: `We require the following permission(s): ${command.permissions.map((p: string) => `\`${p}\``).join(" ")}`,
      });
    }
  }

  // Check Games

  await useLog(`${command.name}`, command.execute, interaction, ...params);
};
