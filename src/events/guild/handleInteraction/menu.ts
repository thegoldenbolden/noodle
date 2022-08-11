import { GuildMemberRoleManager, SelectMenuComponent, SelectMenuInteraction } from "discord.js";
import { loadGuild } from "../../../lib/database";
import { InteractionIds } from "../../../types";

export default async (interaction: SelectMenuInteraction) => {
 // Only for autorole menus currently.
 if (interaction.customId !== InteractionIds.Autorole || !interaction.guild) return;
 await interaction.deferReply({ ephemeral: true });

 const guild = await loadGuild(interaction.guild);
 if (!guild) return await interaction.editReply("We couldn't find this server's information.");

 const autorole = guild.autoroles.find((ar) => ar.channelId === interaction.channelId && ar.messageId === interaction.message.id);
 if (!autorole) return await interaction.editReply("This message isn't an autorole menu.");

 const server = interaction.guild,
  roles = server.roles;
 if (!roles) return await interaction.editReply("We couldn't find this server's roles.");

 const memberRoles = interaction.member?.roles as GuildMemberRoleManager | null | undefined;
 if (!memberRoles) return await interaction.editReply("We couldn't find your current roles.");

 const selected = interaction.values,
  available = (interaction.message.components?.[0].components[0] as SelectMenuComponent).options.map((o) => o.value),
  remove = available.filter((r) => !selected.includes(r)),
  unableToAddRoles: string[] = [];

 available.forEach((id) => {
  const role = roles.resolve(id);
  if (!role) return;

  const highest = server.members?.me?.roles.highest;
  if (highest && role.comparePositionTo(highest) > 0) {
   unableToAddRoles.push(role.name);
  }
 });

 if (unableToAddRoles.length > 0) {
  return interaction.editReply({
   content: `The following roles are higher than mine, so I cannot add them.\n\`${unableToAddRoles.join(", ")}\``,
  });
 }

 const { missing, removed } = await removeRoles();
 const { existed, added } = await addRoles();

 async function removeRoles() {
  const missing: string[] = [],
   removeName: string[] = [],
   removeIds: string[] = [];

  if (remove.length > 0) {
   remove.forEach((r) => {
    if (!memberRoles?.cache.has(r)) {
     missing.push(roles.cache.get(r)?.name ?? "N/A");
    } else {
     removeName.push(roles.cache.get(r)?.name ?? "N/A");
     removeIds.push(r);
    }
   });

   if (removeIds.length > 0) {
    await memberRoles?.remove(removeIds);
   }
  }

  return { missing, removed: removeName };
 }

 async function addRoles() {
  const existed: string[] = [],
   addedNames: string[] = [],
   addedIds: string[] = [];
  if (selected.length > 0) {
   selected.forEach((r) => {
    if (memberRoles?.cache.has(r)) {
     existed.push(roles.cache.get(r)?.name ?? "N/A");
    } else {
     addedNames.push(roles.cache.get(r)?.name ?? "N/A");
     addedIds.push(r);
    }
   });

   if (addedIds.length > 0) {
    await memberRoles?.add(addedIds);
   }
  }

  return { existed, added: addedNames };
 }

 return await interaction.editReply({
  content:
   `${added.length > 0 ? `✅ You now have ${added.join(", ")}.\n` : ""}` +
   `${removed.length > 0 ? `❌ You no longer have ${removed.join(", ")}.\n` : ""}` +
   `${missing.length > 0 ? `❗ You never had ${missing.join(", ")}, so I cannot remove it.\n` : ""}` +
   `${existed.length > 0 ? `❕ You already have ${existed.join(", ")}, so I cannot add it.\n` : ""}`,
 });
};
