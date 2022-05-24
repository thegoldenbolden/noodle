import { APIEmbed, PermissionFlagsBits, StickerFormatType } from "discord-api-types/v10";
import { ContextMenuCommandInteraction, TextChannel } from "discord.js";
import PastaError from "../../utils/classes/Error";
import { getColor } from "../../utils/functions/helpers";
import { GuildProfile } from "../../utils/typings/database";
import { Category, Command, Load } from "../../utils/typings/discord";

export default <Command>{
	name: "starboard",
	category: Category.Moderation,
	database: Load.Guild,
	permissions: [PermissionFlagsBits.Administrator],
	async execute(interaction: ContextMenuCommandInteraction, guild: GuildProfile) {
			await interaction.deferReply({ ephemeral: true });
			const me = interaction.guild?.members?.me;
			if (!me) throw new PastaError({ message: `We were unable to find ourselves. D:`});
			
			if (guild.channels.starboard === null) throw new PastaError({ message: "A starboard channel isn't setup for this server yet. Use \*settings channels add\* to set up one."});
			const starboard = interaction.guild?.channels?.cache.get(`${guild.channels.starboard}`) as TextChannel;
			if (!starboard) throw new PastaError({ message: `We were unable to find the starboard channel.`});

			let perms = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles];
			if (!me.permissionsIn(starboard).has(perms)) throw new PastaError({ message: `We need the following permissions in ${starboard}: View Channel, Send Messages, Embed Links, Attach Files`});

			perms = [PermissionFlagsBits.AddReactions];
			const channel = interaction.guild?.channels?.cache.get(`${interaction.channelId}`) as TextChannel;
			if (!channel) throw new PastaError({ message: `We were unable to find the channel the message is in.`});
			if (channel.id === starboard.id)	throw new PastaError({ message: `This message is already in ${starboard}.`});
			if (!me.permissionsIn(channel).has(perms)) throw new PastaError({ message: "We need the permission \*Add Reactions\* for this command to work."});

			const message = channel.messages.cache.get(interaction.targetId);
			if (!message) throw new PastaError({ message: "We were unable to find the message."});
			if (message.reactions.cache.get("⭐")?.me) throw new PastaError({ message: "This message has already been sent to the starboard."});
			await message.react("⭐");

			const user = `${message.member?.displayName ?? message.author?.tag ?? "A User"}`;


			const embed: APIEmbed = {
				...message.embeds[0]?.data,
				color: getColor(me),
				title: `${channel.nsfw ? `This was starred in a NSFW channel` : ""}`,
				url: `${message.url}`,
				timestamp: new Date(message.editedTimestamp ?? message.createdTimestamp).toISOString(), 
				author: {
					name: `${user}`,
					icon_url: message.author.displayAvatarURL() ?? "",
					url: `${message.url}`
				},
				footer: {
					text: `Starred in ${channel.nsfw ? "NSFW" : ""} #${channel.name ?? "Mystery Channel"}`,
					icon_url: interaction.user.displayAvatarURL() ?? "",
				},
			};

			const spoiler = channel.nsfw ? "\|\|" : "";
			if (message.content && !message.embeds[0]) {
				embed.description = `${spoiler}${message.content.substring(0, 4000)}${message.content.length >= 4000 ? "..." : ""}${spoiler}`;
			};
			
			const t = message.attachments.size > 0 ? "attachments" : message.stickers.size > 0 ? "stickers" : null;
			if (t) {
				if (!channel.nsfw || !embed.video) {
					let attachment: any;
					if (t == "attachments") {
						attachment = message.attachments.find(a => a.contentType == "image/gif" || a.contentType == "image/png" || a.contentType == "image/jpeg");
					} else {
						attachment = message.stickers.find(s => s.format == StickerFormatType.APNG || s.format == StickerFormatType.PNG);
					};

					embed.image = {
						url: attachment.url ?? "",
						height: 4096,
						width: 4096
					}
				} else {
					embed.description = embed.description + `\n${t[0].toUpperCase() + t.substring(1)} were provided.`
				}
			}

			if (embed.thumbnail && channel.nsfw) embed.thumbnail = undefined; 

			starboard.send({ embeds: [embed] })
				.then(async () => {
					await interaction.editReply({
						content: `Successfully sent this message to ${starboard}.`
					});
				})
				.catch(async e => {
					await interaction.editReply({
						content: `There was an error sending this message to ${starboard}.\nError: ${e.message}`
					});
				});
			}
};
