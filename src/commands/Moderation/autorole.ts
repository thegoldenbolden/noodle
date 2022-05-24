import { APIInteractionDataResolvedChannel, APIRole, ChannelType, PermissionFlagsBits } from "discord-api-types/v10";
import { ChatInputCommandInteraction, Collection, GuildBasedChannel, Message, Role, TextChannel } from "discord.js";
import PastaError from "../../utils/classes/Error";
import { Autorole, GuildProfile } from "../../utils/typings/database";
import { Category, Command, Load } from "../../utils/typings/discord";

export default <Command>{
	name: "autorole",
	permissions: [PermissionFlagsBits.ManageRoles],
	category: Category.Moderation,
	database: Load.Guild,
	cooldown: 3,
	async execute(interaction: ChatInputCommandInteraction, guild: GuildProfile) {
			await interaction.deferReply({ ephemeral: true });
			const subcommand = interaction.options.getSubcommand(true);
			const autoroles = guild.autoroles ?? [];
			const params: any[] = [interaction];

			// Checks finding title - add, create, delete, edit, remove
			const title = interaction.options.getString("id") ?? interaction.options.getString("title");
			if (!title) throw new PastaError({ message: "A title wasn't provided D:"});
			if (!/^[A-Z0-9_\s]{1,100}$/i.test(title)) throw new PastaError({ message: "Autorole titles can only contain letters, numbers, and spaces and be up to 100 characters."});
			if (/^\s*$/.test(title)) throw new PastaError({ message: "Autorole titles must contain a letter, number, or underscore."});
			
			const autorole = getAutorole(title, autoroles);
			if (subcommand === "create") {
					if (autorole)
							throw new PastaError({ message: "There is already an autorole with the title \*\*\*${autorole.message_title}\*\*\*."});
					if (autoroles.length >= guild.settings.autoroles_limit)
							throw new PastaError({ message: "This server can not have anymore autoroles."});
					params.push(title);
			} else {
					if (!autorole) throw new PastaError({ message: "We couldn't find an autorole with the title \*\*\*${title}\*\*\*."});
			}

			// For subcommands - create
			const type = interaction.options.getString("type") as Type | undefined;

			// For subcommnands - create, add, remove, edit
			let channel: APIInteractionDataResolvedChannel | GuildBasedChannel | null = interaction.options.getChannel("channel");
			channel = channel ? channel : autorole ? interaction.guild?.channels.cache.get(autorole?.channel_id) ?? null : null;
			type && channel && checkSend(interaction, channel as TextChannel, type);

			// For subcommands - create, add, remove
			let roles = interaction.options.resolved.roles;
			roles = roles && filterRoles(interaction, roles);

			// For subcommands - add, remove
			const existingRoles: number = autorole?.role_ids.length ?? 0;
			roles && messageLimit(roles, type ?? autorole?.type, existingRoles);

			let message: Message<boolean> | null = null;
			if (subcommand !== "create" && subcommand !== "delete") {
					message = await getMessage(autorole!, interaction);

					// For subcommands - remove
					if (subcommand == "remove" && existingRoles === 0) throw new PastaError({ message: "We cannot remove anymore roles from this autorole."});
			}

			autorole && params.push(autorole);
			type && params.push(type);
			channel && params.push(channel);
			roles && params.push(roles);
			message && params.push(message);

			const { run } = await import(`./autorole/${subcommand}`);
			await run(...params);
	},
};

type Roles = Collection<string, Role | APIRole | null> | undefined;
type Interaction = ChatInputCommandInteraction;
type Type = "menu" | "reaction" | "button" | undefined;
type X = Promise<Message<boolean>>;
const filterRoles = (interaction: Interaction, roles: Roles) => {
	if (!roles || roles.size == 0) throw new PastaError({ message: "We couldn't find any roles provided."});
	if (!interaction.guild?.members?.me?.permissions.has(PermissionFlagsBits.ManageRoles))	throw new PastaError({ message: "We need the Manage Roles permission to use this command."});

	let failed: string[] = [];
	const valid = roles?.filter((role) => {
			if (!role || !(role as Role).editable || (role as Role).managed) {
					failed.push(`${role?.name}`);
					return false;
			}

			if (role.name == "@everyone") {
					failed.push(`${role.name}`);
					return false;
			}

			if (interaction.guild?.members?.me?.roles.highest.comparePositionTo(role.id)! < 0) {
					failed.push(`${role.name}`);
					return false;
			}
			return true;
	});

	if (failed.length > 0) throw new PastaError({ message: `The following roles can not be used for autorole: ${failed.join(", ")}`});
	if (!valid || valid.size == 0) throw new PastaError({ message: "We didn't receive any valid roles."});
	return valid;
};

export const checkSend = (interaction: Interaction, channel: TextChannel, type: Type) => {
	if (channel.type !== ChannelType.GuildText || !interaction.channel) throw new PastaError({ message: "We need to be in a text channel for this command to work."});
	const me = interaction.guild?.members?.me;
	if (!me) throw new PastaError({ message: "We couldn't find ourselves. :("});
	const permissions = [PermissionFlagsBits.SendMessages,	PermissionFlagsBits.ManageMessages,	PermissionFlagsBits.ViewChannel];
	let msg = `we do not have one or more of the following permissions: Send Messages, Manage Messages, View Channel`;
	if (!me.permissionsIn(interaction.channelId).has(permissions)) throw new PastaError({ message: `In ${interaction.channel}, ${msg}`});
	type === "reaction" && permissions.push(PermissionFlagsBits.AddReactions);
	msg += type == "reaction" ? ", Add Reactions." : ".";
	const permsInAutoroleChannel = me.permissionsIn(channel);
	if (!permsInAutoroleChannel) throw new PastaError({ message: `We were unable to check my permissions for ${channel}.`, command: "Autorole", me: true, info: "Unable to check permissions from discord"});
	if (!permsInAutoroleChannel.has(permissions)) throw new PastaError({ message: `In ${channel}, ${msg}`});
};

const getAutorole = (id: string, autoroles: Autorole[]) => {
	id = id.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/g)
			? id.substring(id.lastIndexOf("/") + 1, id.length)
			: id;
	return autoroles.find((a) => a.message_title.toLowerCase() == id.toLowerCase() || a.message_id == id);
};

const messageLimit = (roles: Roles, type: Type, existingRoles?: number) => {
	let amount = (existingRoles ?? 0) + (roles?.size ?? 0);
	if (type == "reaction" && amount > 20) throw new PastaError({ message: "There can only be 20 reactions per message."});
	if (type == "menu" && amount < 1) throw new PastaError({ message: "Menus need at least one role."});
	if ((type == "button" || type == "menu") && amount > 25) {
			throw new PastaError({ message: "Menus & Buttons can only have 25 roles per message."});
	}
};

const getMessage = async (x: Autorole, interaction: Interaction): X => {
	const channel = interaction.guild?.channels.cache.get(x.channel_id) as TextChannel | undefined;
	if (!channel) throw new PastaError({ message: `We couldn't find the channel the autorole message.`, command: "Autorole", me: true, info: "Unable to fetch channel from discord"});

	const message = await channel.messages.fetch({ cache: true, message: `${x.message_id}` });
	if (!message) throw new PastaError({ message: `We couldn't find this autorole message.`, command: "Autorole", me: true, info: "Unable to fetch message from discord"});

	return message;
};
