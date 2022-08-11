import { APIEmbed, BitFieldResolvable, Message, PermissionsString, StickerFormatType, TextChannel } from "discord.js";
import { BotGuild } from "../../types";
import BotError from "../classes/Error";
import getColor from "../color";

export default async (message: Message, channel: TextChannel, guild: BotGuild) => {
 if (!message.guild) throw new BotError({ message: "We couldn't find the guild." });

 const me = message.guild.members?.me;
 if (!me) throw new BotError({ message: "We couldn't find ourselves." });

 const VIEW_PERMS: BitFieldResolvable<PermissionsString, bigint>[] = ["ViewChannel", "SendMessages", "EmbedLinks", "AttachFiles"];
 if (!me.permissionsIn(channel).has(VIEW_PERMS)) {
  throw new BotError({
   message: `We cannot send messages to ${channel} because we may be missing View Channel or Send Messages permission.`,
  });
 }

 if (message.reactions.cache.get("⭐")?.me) {
  throw new BotError({ message: "This message has already been sent to the starboard." });
 }
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
   icon_url: message.member?.user.displayAvatarURL() ?? "",
  },
 };

 const spoiler = channel.nsfw ? "||" : "";
 if (message.content && !message.embeds[0]) {
  embed.description = `${spoiler}${message.content.substring(0, 4000)}${message.content.length >= 4000 ? "..." : ""}${spoiler}`;
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

 await channel.send({ embeds: [embed] });
};