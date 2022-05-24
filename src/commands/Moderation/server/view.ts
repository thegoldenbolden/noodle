import { APIActionRowComponent, APIButtonComponent, APIEmbed, APISelectMenuComponent, ButtonStyle, ChannelType, ComponentType, PermissionFlagsBits } from "discord-api-types/v10";
import { ChatInputCommandInteraction, Formatters, Guild, GuildMember, InteractionCollector, MessageComponentInteraction, WebhookEditMessageOptions } from "discord.js";
import PastaError from "../../../utils/classes/Error";
import { deleteObjectFromDbArray } from "../../../utils/functions/database";
import { getColor } from "../../../utils/functions/helpers";
import { Autorole, Channels, GuildProfile, Notifications } from "../../../utils/typings/database";

enum Keys { "notifications" = "id", "autoroles" = "message_id" }
type Pages = { embeds: APIEmbed[]; components: APIActionRowComponent<APIButtonComponent>[] };
type Run = (I: ChatInputCommandInteraction, G: GuildProfile) => void;
export const run: Run = async (interaction, guild) => {
	const ids = ["settings", "menu", "back", "next", "delete"];
	ids.forEach((id) => (id = `${id}-${interaction.id}`));

	const menu: APISelectMenuComponent = {
			type: ComponentType.SelectMenu,
			custom_id: ids[0],
			max_values: 1,
			disabled: false,
			min_values: 1,
			options: [{ label: "General", description: "View general information", value: "general", default: true }],
	};

	if ((interaction.member as GuildMember)?.permissions.has(PermissionFlagsBits.Administrator)) {
			if (guild.notifications?.[0]) {
					menu.options.push({ label: "Notifications", description: "View notifications", value: "notifications" });
			}

			if (guild.autoroles?.[0]) {
					menu.options.push({ label: "Autoroles", description: "View current autoroles", value: "autoroles" });
			}

			if (guild.channels.starboard || guild.channels.logger) {
					menu.options.push({
							label: "Channels",
							description: "View Pasta channels, e.g. starboard, logger..",
							value: "channels",
					});
			}
	}

	if (menu.options.length === 1) {
			menu.disabled = true;
	}

	const color = getColor(interaction.guild?.members?.me);
	const general = getGeneral(interaction.guild);
	general.color = color;

	const options: WebhookEditMessageOptions = {
			embeds: [general],
			components: [
					{
							type: ComponentType.ActionRow,
							components: [menu],
					},
			],
	};

	await interaction.editReply(options);
	if (options.components!.length == 0) return;

	let pages: any[] = [],
			page = 0,
			key: "notifications" | "autoroles" | null = null,
			content: string | undefined = undefined;

	const collector = new InteractionCollector(interaction.client, {
			idle: 20000,
			dispose: true,
			filter: (i: MessageComponentInteraction) => i.user.id === interaction.user.id && ids.includes(i.customId),
	});

	collector.on("collect", async (i: MessageComponentInteraction) => {
			if (collector.ended) return;
			await i.deferUpdate();

			if (i.isSelectMenu()) {
					switch (i.values[0]) {
							case "general":
									options.embeds = [general];
									options.components = [options.components![0]];
									key = null;
									break;
							case "notifications":
									let { embeds: notifs, components: notifs_components } = getNotifications(guild.notifications, interaction.guild);
									if (notifs[page]) options.embeds = [notifs[page]];
									if (notifs_components[page]) (options.components![1] as APIActionRowComponent<APIButtonComponent>) = notifs_components[page];
									(options.components![0] as APIActionRowComponent<APISelectMenuComponent>).components[0].disabled = true;
									pages = notifs;
									key = "notifications";
									break;
							case "autoroles":
									let { embeds: autos, components: autos_components } = getAutoroles(guild.autoroles, interaction.guild);
									if (autos[page]) options.embeds = [autos[page]];
									if (autos_components[page]) (options.components![1] as APIActionRowComponent<APIButtonComponent>) = autos_components[page];
									(options.components![0] as APIActionRowComponent<APISelectMenuComponent>).components[0].disabled = true;
									pages = autos;
									key = "autoroles";
									break;
							case "channels":
									options.embeds = getChannels(guild.channels, interaction.guild);
									key = null;
									break;
					}
					(options.components![0] as APIActionRowComponent<APISelectMenuComponent>).components[0].options.forEach((o) => (o.default = o.value == i.values[0]));
			}

			if (i.isButton()) {
					(options.components![0] as APIActionRowComponent<APISelectMenuComponent>).components[0].disabled = true;
					switch (i.customId) {
							case ids[1]:
									(options.components![0] as APIActionRowComponent<APISelectMenuComponent>).components[0].disabled = false;
									(options.components![0] as APIActionRowComponent<APISelectMenuComponent>).components[0].options.forEach((o) => (o.default = o.value == "general"));
									options.components = [options.components![0]];
									options.embeds = [general];
									page = 0;
									content = undefined;
									break;
							case ids[2]:
									page = page == 0 ? pages.length - 1 : page - 1;
									options.embeds = [pages[page]];
									content = undefined;
									break;
							case ids[3]:
									page = page == pages.length - 1 ? 0 : page + 1;
									content = undefined;
									options.embeds = [pages[page]];
									break;
							case ids[4]:
									if (!key) {
											content = "❌ There was an error deleting this.";
											break;
									}

									const item = key == "autoroles" ? guild.autoroles?.[page] : guild.notifications?.[page];
									if (!item) {
											content = "❌ There was an error deleting this.";
											break;
									}

									let id = key == "autoroles" ? (item as Autorole).message_id : (item as Notifications).id;
									const deleted = await deleteItem(key, Keys[key], id, interaction.guildId).catch((e) => e);
									if (!deleted) {
											content = "❌ There was an error deleting this.";
											break;
									}

									pages.splice(page, 1);
									page = page == 0 ? 0 : page - 1;
									content = `✅ Successfully deleted ${id}.`;
									if (pages[page]) {
											pages[page].author.name = `${interaction.guild?.name} ${key[0].toUpperCase() + key.substring(1)} (${pages.length})`;
									}

									if (!pages[page]) {
											content = undefined;
											page = 0;
											options.embeds = [general];

											const menuOptions = (options.components![0] as APIActionRowComponent<APISelectMenuComponent>).components[0].options;
											const selected = menuOptions.findIndex((option, idx) => option.value == key);
											key = null;

											if (selected == -1) {
													content = "An error occurred.";
											}

											menuOptions.splice(selected, 1);
											menu.options = menuOptions;
											options.components = [options.components![0]];
											(options.components![0] as APIActionRowComponent<APISelectMenuComponent>).components[0].disabled = false;
											(options.components![0] as APIActionRowComponent<APISelectMenuComponent>).components[0].options[0].default = true;
											break;
									}
									break;
					}
			}

			if (!options.embeds?.[0]) {
					options.embeds = [{ description: "Uh oh.." }];
			}

			(options.embeds[0] as APIEmbed).color = color;
			options.content = content;
			await i.editReply(options);
	});

	collector.on("end", async (i, reason) => {
			if (["messageDelete", "guildDelete", "channelDelete", "threadDelete"].includes(reason)) return;

			(options.components as APIActionRowComponent<APISelectMenuComponent | APIButtonComponent>[]).forEach((c) => c.components.forEach((x) => (x.disabled = true)));

			await interaction.editReply({ components: options.components });
	});

	function createButtons(): APIButtonComponent[] {
			return [
					{
							type: ComponentType.Button,
							custom_id: ids[1],
							label: `Back to Menu`,
							style: ButtonStyle.Secondary,
					},
					{
							type: ComponentType.Button,
							custom_id: ids[2],
							label: `Back`,
							style: ButtonStyle.Primary,
					},
					{
							type: ComponentType.Button,
							custom_id: ids[3],
							label: `Next`,
							style: ButtonStyle.Primary,
					},
					{
							type: ComponentType.Button,
							custom_id: ids[4],
							label: `Delete`,
							style: ButtonStyle.Danger,
					},
			];
	}

	function getGeneral(guild: Guild | null): APIEmbed {
			if (!guild) return { description: `We were unable to find this server's information.` };

			const title = `${guild.verified ? "✅ " : ""}${guild.partnered ? "😭 " : ""}${guild.name}`;
			const membersBans = `${guild.memberCount} members and ${guild.bans.cache.size} bans.`;
			let voice = 0, publicThread = 0, privateThread = 0, categories = 0, text = 0, stage = 0, annoucements = 0;
			guild.channels.cache.forEach(channel => {
				switch (channel.type) {
					case ChannelType.GuildText: text += 1; break;
					case ChannelType.GuildVoice: voice += 1; break;
					case ChannelType.GuildPublicThread: publicThread += 1; break;
					case ChannelType.GuildPrivateThread: privateThread += 1; break;
					case ChannelType.GuildCategory: categories += 1; break;
					case ChannelType.GuildStageVoice: stage += 1; break;
					case ChannelType.GuildNews: annoucements += 1; break;
				}
			});

			let channels = "";
			[categories, text, voice, annoucements, stage, publicThread, privateThread].forEach((amount, i) => {
				let key = i == 0 ? "Categories" : i == 1 ? "Text" : i == 2 ? "Voice" : i == 3 ? "Announcements" : i == 4 ? "Stage" : i == 5 ? "Public Threads" : "Private Threads" 
				if (amount > 0) {
					channels += `${i == 0 ? "" : ", "}\*\*${amount}\*\* ${key}`
				}
			});

			let animated = 0, plain = 0;
			guild.emojis.cache.forEach(emoji => {
				if (emoji.animated) {
					animated += 1;
				} else {
					plain += 1;
				}
			});

			const roles = guild.roles.cache.size
			const colored = guild.roles.cache.filter(role => role.color != 0).size;
			const emojis = `${animated} animated emojis, ${plain} static emojis, ${colored} color roles, ${roles - colored} other roles, and ${guild.stickers.cache.size} stickers`;

			const embed: APIEmbed = {
					title,
					description: guild.description ?? undefined,
					thumbnail: { url: guild.iconURL() ?? "" },
					fields: [
							{ name: "Members & Bans", value: membersBans, inline: false },
							{ name: `Emojis (${guild.emojis.cache.size}), Roles (${roles}) & Stickers`, value: emojis, inline: false },
							{ name: `Channels (${guild.channels.cache.size})`, value: channels, inline: false },
							{ name: `Features (${guild?.features?.length ?? 0})`, value: `${capitalize(guild?.features)}`, inline: false },
							{
									name: "Boosts",
									value: `Level ${guild.premiumTier} • ${guild.premiumSubscriptionCount} member(s) boosted.`,
									inline: true,
							},
							{ name: "Created", value: Formatters.time(guild.createdAt, "F"), inline: false },
					],
			};

			if (guild.bannerURL()) {
					embed.image = {
							url: guild.bannerURL() ?? "",
							height: 4096,
							width: 4096,
					};
			}

			return embed;
	}

	function capitalize(array: string[]) {
		if (!array || array.length === 0) return "None";

			array.forEach((word, i) => {
					let x = word.split(/_+|\s+/g);
					x.forEach((w, idx) => {
							x[idx] = w[0].toUpperCase() + w.substring(1).toLowerCase();
					});

					array[i] = x.join(" ");
			});

			return array.join(", ");
	}

	function getNotifications(notifications: Notifications[], guild: Guild | null): Pages {
			const embeds: APIEmbed[] = [];
			const components: APIActionRowComponent<APIButtonComponent>[] = [];

			notifications.forEach((notification) => {
					embeds.push({
							author: {
									name: `${guild?.name ?? "This Server's"} Notifications (${notifications.length})`,
									icon_url: guild?.iconURL() ?? "",
							},
							title: notification.message_title,
							description: notification.message,
							footer: {
								text: notification.id,
							}
					});

					const buttons = createButtons();
					buttons[1].disabled = notifications.length == 1;
					buttons[2].disabled = notifications.length == 1;

					components.push({
							type: ComponentType.ActionRow,
							components: buttons,
					});
			});

			return { embeds, components };
	}

	function getAutoroles(autoroles: Autorole[] | null, guild: Guild | null): Pages {
			if (!autoroles || !autoroles[0]) {
					return { embeds: [{ description: "No autoroles have been setup." }], components: [] };
			}

			const embeds: APIEmbed[] = [];
			const components: APIActionRowComponent<APIButtonComponent>[] = [];

			autoroles.forEach((autorole) => {
					const roles = autorole.role_ids.map((role) => guild?.roles.cache.get(role));

					embeds.push({
							author: {
									name: `${guild?.name ?? "This Server's"} Autoroles (${autoroles.length})`,
									icon_url: guild?.iconURL() ?? "",
							},
							title: `${autorole.message_title}`,
							url: `https://discord.com/channels/${guild?.id}/${autorole.channel_id}/${autorole.message_id}`,
							description: `${roles.map((role, idx) => `${role}${autorole.emoji_ids ? " - " + autorole.emoji_ids[idx] : ""}`).join(" • ")}`,
							footer: {
									text: `Autorole created by ${autorole.created_by} in #${guild?.channels.cache.get(autorole.channel_id)?.name}`,
							},
							timestamp: new Date(autorole.created).toISOString(),
					});

					const buttons = createButtons();
					buttons[1].disabled = autoroles.length == 1;
					buttons[2].disabled = autoroles.length == 1;

					components.push({
							type: ComponentType.ActionRow,
							components: buttons,
					});
			});

			return { embeds, components };
	}

	function getChannels(channels: Channels, guild: Guild | null): APIEmbed[] {
			let embed: APIEmbed = {
					author: {
							name: `${guild?.name ?? "This Server's"} Pasta Channels`,
							icon_url: guild?.iconURL() ?? "",
					},
					fields: [],
			};

			Object.entries(channels).forEach((channel) => {
					const resolved = channel[1] ? guild?.channels.cache.get(channel[1]) : null;

					embed.fields!.push({
							name: `${channel[0][0].toUpperCase() + channel[0].substring(1)}`,
							value: `${resolved}`,
							inline: true,
					});
			});

			return [embed];
	}

	async function deleteItem(column: string, lookupKey: string, id: any, guildId: string | null) {
			if (!guildId) throw new PastaError({ message: "There was an error when deleting."});
			let k = await deleteObjectFromDbArray({
					table: "guilds",
					discord_id: guildId,
					column: column,
					lookup: lookupKey,
					lookupValue: id,
			});

			return k ? true : false;
	}
};
