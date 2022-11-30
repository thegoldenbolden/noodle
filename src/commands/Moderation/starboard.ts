import {
 ChannelType,
 ChatInputCommandInteraction,
 CommandInteraction,
 MessageContextMenuCommandInteraction,
 OverwriteType,
 TextChannel,
} from "discord.js";
import BotError from "../../lib/classes/Error";
import resend from "../../lib/discord/resend";
import { useError } from "../../lib/log";

export default {
 name: "starboard",
 categories: ["Moderation"],
 database: "Guild",
 async execute(interaction: ChatInputCommandInteraction | MessageContextMenuCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });
  const starboard = interaction.guild?.channels.cache.find((channel) => channel.name === "starboard");

  // Create starboard channel
  if (interaction.isChatInputCommand()) {
   if (!interaction.guildId) throw new BotError({ message: `We couldn't find this guild.` });

   if (starboard) {
    await interaction.editReply(`There is already a starboard for this server.`);
    return;
   }

   const created = await interaction.guild?.channels.create({
    name: "starboard",
    type: ChannelType.GuildText,
    reason: "Noodle starboard",

    permissionOverwrites: [
     {
      id: interaction.guild?.roles.everyone,
      deny: ["SendMessages"],
      allow: ["ViewChannel"],
      type: OverwriteType.Role,
     },
     {
      id: interaction.applicationId,
      allow: ["SendMessages"],
     },
    ],
   });

   const content =
    `Whenever a user right clicks a message -> App -> Starboard, the message will be sent to ${created}.` +
    "Defaults to users with the 'Manage Guild' permission but can be changed in ``Server Settings -> Integrations -> Noodle -> 'Starboard'``";
   await interaction.editReply(content);
   return;
  }

  if (!starboard) throw new BotError({ message: "There isn't a starboard set up for this server." });

  const message = interaction.targetMessage;
  if (message.channelId === starboard.id) throw new BotError({ message: "This message is already in starboard." });
  if (message.reactions.cache.get("⭐")?.me) throw new BotError({ message: "This message has been sent already." });

  resend(message, starboard as TextChannel, interaction.user?.displayAvatarURL())
   .then((e) => {
    interaction.editReply({ content: "Sent message to the starboard." });
   })
   .catch((e) => {
    useError(e, interaction);
   });
 },
};
