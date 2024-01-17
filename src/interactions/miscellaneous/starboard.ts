import {
 ChannelType,
 ChatInputCommandInteraction,
 MessageContextMenuCommandInteraction,
 OverwriteType,
 TextChannel,
} from "discord.js";
import { BotError } from "../../lib/error";
import { sendMessage } from "../../lib/send-message";
import { log } from "../../lib/logger";

type Interaction =
 | ChatInputCommandInteraction
 | MessageContextMenuCommandInteraction;

export default {
 name: "starboard",
 contexts: ["Starboard"],
 categories: ["Moderation"],
 database: "Guild",
 async execute(interaction: Interaction) {
  await interaction.deferReply({ ephemeral: true });
  const starboard = interaction.guild?.channels.cache.find(
   (channel) => channel.name === "starboard"
  );

  // Create starboard channel
  if (interaction.isChatInputCommand()) {
   if (!interaction.guildId) {
    throw new BotError({ message: `We couldn't find this guild.` });
   }

   if (starboard) {
    await interaction.editReply(
     `There is already a starboard for this server.`
    );
    return;
   }

   const created = await interaction.guild?.channels.create({
    name: "starboard",
    type: ChannelType.GuildText,
    reason: "No starboard existed",
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

  if (!starboard) {
   throw new BotError({
    message: "There isn't a starboard set up for this server.",
   });
  }

  const message = interaction.targetMessage;
  if (message.channelId === starboard.id) {
   throw new BotError({ message: "This message is already in starboard." });
  }

  if (message.reactions.cache.get("⭐")?.me) {
   throw new BotError({ message: "This message has been sent already." });
  }

  sendMessage(
   message,
   starboard as TextChannel,
   interaction.user?.displayAvatarURL()
  )
   .then((e) =>
    interaction.editReply({ content: "Sent message to the starboard." })
   )
   .catch((e) => log(e, interaction));
 },
};
