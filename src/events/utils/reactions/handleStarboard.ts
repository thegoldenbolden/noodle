import { APIEmbed, StickerFormatType } from "discord-api-types/v10";
import { GuildMember, Message, MessageReaction, PartialMessage, PermissionFlagsBits, TextChannel } from "discord.js";
import { getColor } from "../../../utils/functions/helpers";

export default async function (starboardId: string, reaction: MessageReaction, member: GuildMember) {
  if (reaction.me) return;

  const guild = reaction.message.guild;
  if (!guild) return;

  const me = guild.members.me;
  if (!me) return;

  const starboard = guild?.channels?.cache.get(`${starboardId}`) as TextChannel;
  if (!starboard) return;

  let message: Message<boolean> | PartialMessage | null = reaction.message;
  let perms = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles];
  if (!me.permissionsIn(starboard).has(perms)) return;

  perms = [PermissionFlagsBits.AddReactions];
  const channel = guild?.channels?.cache.get(`${message.channelId}`) as TextChannel;
  if (!channel) return;
  if (channel.id === starboard.id) return;
  if (!me.permissionsIn(channel).has(perms)) return;

  if (message.partial) message = await message.fetch().catch((e) => null);
  if (!message?.content && !message?.embeds?.[0]) return;
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
      url: `${message.url}`,
    },
    footer: {
      text: `Starred in ${channel.nsfw ? "NSFW" : ""} #${channel.name ?? "Mystery Channel"}`,
      icon_url: member.user.displayAvatarURL() ?? "",
    },
  };

  const spoiler = channel.nsfw ? "||" : "";
  if (message.content && !message.embeds[0]) {
    embed.description = `${spoiler}${message.content.substring(0, 4000)}${
      message.content.length >= 4000 ? "..." : ""
    }${spoiler}`;
  }

  const t = message.attachments.size > 0 ? "attachments" : message.stickers.size > 0 ? "stickers" : null;
  if (t) {
    if (!channel.nsfw || !embed.video) {
      let attachment: any;
      if (t == "attachments") {
        attachment = message.attachments.find(
          (a) => a.contentType == "image/gif" || a.contentType == "image/png" || a.contentType == "image/jpeg"
        );
      } else {
        attachment = message.stickers.find((s) => s.format == StickerFormatType.APNG || s.format == StickerFormatType.PNG);
      }

      embed.image = {
        url: attachment.url ?? "",
        height: 4096,
        width: 4096,
      };
    } else {
      embed.description = embed.description + `\n${t[0].toUpperCase() + t.substring(1)} were provided.`;
    }
  }

  if (embed.thumbnail && channel.nsfw) embed.thumbnail = undefined;
  starboard.send({ embeds: [embed] }).catch((e) => console.log(e));
}
