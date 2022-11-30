import {
 AnySelectMenuInteraction,
 GuildMemberRoleManager,
 RoleManager,
 StringSelectMenuComponentData,
 StringSelectMenuInteraction,
} from "discord.js";

export default async (interaction: AnySelectMenuInteraction) => {
 await interaction.deferReply({ ephemeral: true });

 switch (interaction.customId) {
  default:
   return;
  case "AUTOROLE":
   const roles = interaction.guild?.roles as RoleManager | undefined;
   if (!roles) return await interaction.editReply("We couldn't find this server's roles.");

   const memberRoles = interaction.member?.roles as GuildMemberRoleManager | undefined;
   if (!memberRoles) return await interaction.editReply("We couldn't find your current roles.");

   const userSelected = interaction.values;
   const providedRoles = (interaction.message.components?.[0].components[0] as StringSelectMenuComponentData).options?.map(
    (o) => o.value
   );
   if (!providedRoles) return await interaction.editReply("We were unable to find the roles for this message.");

   const userUnselected = providedRoles.filter((r) => !userSelected.includes(r)),
    unableToAddRoles: string[] = [];

   providedRoles.forEach((id) => {
    const role = roles.resolve(id);
    if (!role) return;

    const highest = interaction.guild?.members?.me?.roles.highest;
    if (highest && role.comparePositionTo(highest) > 0) {
     unableToAddRoles.push(role.name);
    }
   });

   if (unableToAddRoles.length > 0) {
    return interaction.editReply({
     content: `The following roles are higher than mine, so I cannot add them.\n\`${unableToAddRoles.join(", ")}\``,
    });
   }

   const { missing, removed } = await removeRoles(userUnselected, memberRoles, roles);
   const { existed, added } = await addRoles(userSelected, memberRoles, roles);

   return await interaction.editReply({
    content:
     `${added.length > 0 ? `✅ You now have ${added.join(", ")}.\n` : ""}` +
     `${removed.length > 0 ? `❌ You no longer have ${removed.join(", ")}.\n` : ""}` +
     `${missing.length > 0 ? `❗ You never had ${missing.join(", ")}, so I cannot remove it.\n` : ""}` +
     `${existed.length > 0 ? `❕ You already have ${existed.join(", ")}, so I cannot add it.\n` : ""}`,
   });
 }
};

type GuildRoles = RoleManager;
type MemberRoles = GuildMemberRoleManager | undefined;
type Roles = string[];

async function removeRoles(remove_roles: Roles, member_roles: MemberRoles, guild_roles: GuildRoles) {
 const missing: string[] = [],
  removeName: string[] = [],
  removeIds: string[] = [];

 if (remove_roles.length > 0) {
  remove_roles.forEach((r) => {
   if (!member_roles?.cache.has(r)) {
    missing.push(guild_roles.cache.get(r)?.name ?? "N/A");
   } else {
    removeName.push(guild_roles.cache.get(r)?.name ?? "N/A");
    removeIds.push(r);
   }
  });

  if (removeIds.length > 0) {
   await member_roles?.remove(removeIds);
  }
 }

 return { missing, removed: removeName };
}

async function addRoles(add_roles: Roles, member_roles: MemberRoles, guild_roles: GuildRoles) {
 const existed: string[] = [],
  addedNames: string[] = [],
  addedIds: string[] = [];
 if (add_roles.length > 0) {
  add_roles.forEach((r) => {
   if (member_roles?.cache.has(r)) {
    existed.push(guild_roles.cache.get(r)?.name ?? "N/A");
   } else {
    addedNames.push(guild_roles.cache.get(r)?.name ?? "N/A");
    addedIds.push(r);
   }
  });

  if (addedIds.length > 0) {
   await member_roles?.add(addedIds);
  }
 }

 return { existed, added: addedNames };
}
