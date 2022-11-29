import { ChannelType, ChatInputCommandInteraction, OverwriteType } from "discord.js";
import BotError from "../../../lib/classes/Error";
import { BotGuild } from "../../../types";

export default async function (interaction: ChatInputCommandInteraction, guild: BotGuild) {
 if (!interaction.guildId) throw new BotError({ message: `We couldn't find this guild.` });
 const exists = interaction.guild?.channels.cache.find((channel) => channel.name === "starboard");
 await interaction.deferReply({ ephemeral: true });

 if (exists) {
  await interaction.editReply(`There is already a starboard for this server.`);
  return;
 }

 const starboard = await interaction.guild?.channels.create({
  name: "starboard",
  type: ChannelType.GuildText,
  reason: "Noodle starboard",
  permissionOverwrites: [
   {
    id: "@everyone",
    deny: ["SendMessages"],
    allow: ["ViewChannel"],
    type: OverwriteType.Member,
   },
   {
    id: interaction.applicationId,
    allow: ["SendMessages"],
   },
  ],
 });

 const content =
  `Whenever a user right clicks a message -> App -> Starboard, the message will be sent to ${starboard}.` +
  "Defaults to users with the 'Manage Guild' permission but can be changed in ``Server Settings -> Integrations -> Noodle -> 'Starboard'``";
 await interaction.editReply(content);
}
