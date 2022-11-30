import { ChannelType, ChatInputCommandInteraction, ModalSubmitInteraction, PermissionFlagsBits, TextChannel } from "discord.js";
import BotError from "../classes/Error";

type Interaction = ModalSubmitInteraction | ChatInputCommandInteraction;

export function checkSend(interaction: Interaction, channel: TextChannel) {
 if (!interaction.channelId) throw new BotError({ message: "We couldn't find this channel." });

 if (channel.type !== ChannelType.GuildText || !interaction.channel)
  throw new BotError({ message: "We need to be in a text channel for this command to work." });
 const me = interaction.guild?.members?.me;
 if (!me) throw new BotError({ message: "We couldn't find ourselves. :(" });
 const permissions = [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel];
 let msg = `we do not have one or more of the following permissions: Send Messages,  View Channel.`;

 if (!me.permissionsIn(interaction.channelId).has(permissions))
  throw new BotError({ message: `In ${interaction.channel}, ${msg}` });

 const channelToSendToPerms = me.permissionsIn(channel);
 if (!channelToSendToPerms.has(permissions)) throw new BotError({ message: `In ${channel}, ${msg}` });
}
