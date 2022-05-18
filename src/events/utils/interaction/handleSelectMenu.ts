import { GuildMemberRoleManager, Role, SelectMenuComponent, SelectMenuInteraction } from "discord.js";
import { get } from "../../../utils/functions/database";
import { Autorole } from "../../../utils/typings/database";

export default async (interaction: SelectMenuInteraction) => {
  if (interaction.customId !== "AUTOROLE") return;
  await interaction.deferReply({ ephemeral: true });

  const guild = await get({ discord_id: interaction.guildId, table: "guilds", column: "autoroles" });
  if (!guild) return await interaction.editReply("We couldn't find this server's information.");

  const autorole = guild.autoroles.find(
    (ar: Autorole) => ar.channel_id === interaction.channelId && ar.message_id === interaction.message.id
  );

  if (!autorole) return await interaction.editReply("We couldn't find this server's autoroles.");

  const server = interaction.guild;
  if (!server) return await interaction.editReply("We couldn't find this server.");

  const guildRoles = server?.roles;
  if (!guildRoles) return await interaction.editReply("We couldn't find this server's roles.");

  const memberRoles = interaction.member?.roles;
  if (!memberRoles) return await interaction.editReply("We couldn't find your current roles.");

  const rolesOnMenu = interaction.values,
    availableRoles = (interaction.message.components?.[0].components[0] as SelectMenuComponent).options.map((o) => o.value),
    rolesToRemove = availableRoles.filter((r) => !rolesOnMenu.includes(r));

  let roles: Role[] = [];
  availableRoles.forEach((r, i) => {
    const role = guildRoles.resolve(r);
    if (!role) return;

    const highest = server.members?.me?.roles.highest;

    if (highest && role.comparePositionTo(highest) > 0) {
      roles.push(role);
    }
  });

  const higherRole = roles.map((r) => r.name);
  if (higherRole.length > 0) {
    return interaction.editReply({
      content: `The following roles are higher than mine, so I cannot add them.\n\`${higherRole.join(", ")}\``,
    });
  }

  let doesNotHaveRole: any[] = [],
    removedRolesName: any[] = [],
    removeRolesIds: any[] = [],
    alreadyHasRole: any[] = [],
    addedRolesName: any[] = [],
    addedRolesIds: any[] = [];
  if (rolesToRemove.length > 0) {
    rolesToRemove.forEach((r) => {
      if (!(memberRoles as GuildMemberRoleManager).cache.has(r)) {
        doesNotHaveRole = [...doesNotHaveRole, guildRoles.cache.get(r)?.name];
      } else {
        removedRolesName = [...removedRolesName, guildRoles.cache.get(r)?.name];
        removeRolesIds = [...removeRolesIds, r];
      }
    });

    if (removeRolesIds.length > 0) {
      await (memberRoles as GuildMemberRoleManager)?.remove(removeRolesIds);
    }
  }

  if (rolesOnMenu.length > 0) {
    rolesOnMenu.forEach((r) => {
      if ((memberRoles as GuildMemberRoleManager)?.cache.has(r)) {
        alreadyHasRole = [...alreadyHasRole, guildRoles.cache.get(r)?.name];
      } else {
        addedRolesName = [...addedRolesName, guildRoles.cache.get(r)?.name];
        addedRolesIds = [...addedRolesIds, r];
      }
    });

    if (addedRolesIds.length > 0) {
      await (memberRoles as GuildMemberRoleManager).add(addedRolesIds);
    }
  }

  return await interaction.editReply({
    content:
      `${addedRolesName.length > 0 ? `✅ You now have ${addedRolesName.join(", ")}.\n` : ""}` +
      `${removedRolesName.length > 0 ? `❌ You no longer have ${removedRolesName.join(", ")}.\n` : ""}` +
      `${doesNotHaveRole.length > 0 ? `❗ You never had ${doesNotHaveRole.join(", ")}, so I cannot remove it.\n` : ""}` +
      `${alreadyHasRole.length > 0 ? `❕ You already have ${alreadyHasRole.join(", ")}, so I cannot add it.\n` : ""}`,
  });
};
