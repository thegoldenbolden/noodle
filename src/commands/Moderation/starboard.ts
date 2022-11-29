import { GuildMemberRoleManager, MessageContextMenuCommandInteraction, TextChannel } from "discord.js";
import BotError from "../../lib/classes/Error";
import resend from "../../lib/discord/resend";
import { useError } from "../../lib/log";
import { BotGuild } from "../../types";

export default {
	name: "starboard",
	categories: ["Moderation"],
	database: "Guild",
	async execute(interaction: MessageContextMenuCommandInteraction) {
			await interaction.deferReply({ ephemeral: true });

			const me = interaction.guild?.members?.me;
			if (!me) throw new BotError({ message: `We were unable to find ourselves. D:`});
   const starboard = interaction.guild.channels.cache.find(channel => channel.name === "starboard");
   if (!starboard) throw new BotError({ message: "There isn't a starboard set up for this server."});

   const message = interaction.targetMessage;
			if (message.channelId === starboard.id) throw new BotError({ message: "This message is already in starboard."});
			if (message.reactions.cache.get("⭐")?.me) throw new BotError({ message: "This message has been sent already."});

   resend(message, starboard as TextChannel, interaction.guild, interaction.user?.displayAvatarURL())
   .then((e) => {
    interaction.editReply({ content: "Sent message to the starboard." })
   })
   .catch((e) => {
    useError(e, interaction);
   });
	} 
};
