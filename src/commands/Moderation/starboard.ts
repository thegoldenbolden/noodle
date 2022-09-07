import { GuildMemberRoleManager, MessageContextMenuCommandInteraction, TextChannel } from "discord.js";
import BotError from "../../lib/classes/Error";
import resend from "../../lib/discord/resend";
import error from "../../lib/error";
import { BotGuild } from "../../types";

export default {
	name: "starboard",
	categories: ["Moderation"],
	database: "Guild",
	async execute(interaction: MessageContextMenuCommandInteraction, guild: BotGuild) {
			await interaction.deferReply({ ephemeral: true });

			const me = interaction.guild?.members?.me;
			if (!me) throw new BotError({ message: `We were unable to find ourselves. D:`});
   const starboard = guild.channels.find(channel => channel.type == "STARBOARD");
   if (!starboard) throw new BotError({ message: "There isn't a starboard set up for this server."});
			const starboardChannel = interaction.guild?.channels?.cache.get(`${starboard.channelId}`);
			if (!starboardChannel) throw new BotError({ message: `We were unable to find the starboard channel.`});

   const isAdmin = interaction.memberPermissions?.has("Administrator");
   
   // Admin overrides.
   if (!isAdmin) {
    const error = { message: "You don't have permission to send a mesage to the starboard."};
    if (!starboard.role) throw new BotError(error);
    if (!(interaction.member?.roles as GuildMemberRoleManager)?.cache.get(starboard.role)) throw new BotError(error);
   };

   const message = interaction.targetMessage;
			if (message.channelId === starboardChannel.id) throw new BotError({ message: "This message is already in starboard."});
			if (message.reactions.cache.get("⭐")?.me) throw new BotError({ message: "This message has been sent already."});

   resend(message, starboardChannel as TextChannel, guild, interaction.user?.displayAvatarURL())
   .then((e) => {
    interaction.editReply({ content: "Sent message to the starboard." })
   })
   .catch((e) => {
    error(e, interaction);
   });
	} 
};
