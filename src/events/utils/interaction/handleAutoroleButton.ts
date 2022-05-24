import { ButtonInteraction, GuildMember, Role } from "discord.js";
import { get } from "../../../utils/functions/database";
import { Autorole } from "../../../utils/typings/database";

export const handleAutoroleButton = async (interaction: ButtonInteraction) => {
 await interaction.deferReply({ ephemeral: true });

 if (!interaction.guild) return await interaction.editReply("We couldn't find this server.");
 if (!interaction.member) return await interaction.editReply("We couldn't find your current roles.");

 const memberRoles = (interaction.member as GuildMember).roles;
 if (!memberRoles) return await interaction.editReply("We couldn't find your current roles.");

 const guild = await get({ discord_id: interaction.guildId, table: "guilds", column: "autoroles" });
 if (!guild) return await interaction.editReply("We were unable to get information from this guild.");

 const autorole = guild.autoroles.find(
  (ar: Autorole) => interaction.channelId === ar.channel_id && ar.message_id === interaction.message.id
 );

 if (!autorole) return await interaction.editReply("We were unable to find the role.");

 let role: string | null | Role = interaction.customId.split("-")[1];
 role = await interaction.guild.roles.fetch(role);
 if (!role) return await interaction.editReply(`We were unable to find the role.`);

 if (memberRoles.cache.get(`${role.id}`)) {
  memberRoles
   .remove(role)
   .then(() => {
    interaction.editReply(`You no longer have the role ${role}.`);
   })
   .catch((err) => {
    interaction.editReply(`There was an error removing the role ${role}.`);
   });
  return;
 }

 memberRoles
  .add(role)
  .then(() => {
   interaction.editReply(`You now have the role ${role}.`);
  })
  .catch((err) => {
   interaction.editReply(`There was an error adding the role ${role}.`);
  });
};
