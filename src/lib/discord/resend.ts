import { APIEmbed, BitFieldResolvable, Message, PermissionsString, StickerFormatType, TextChannel } from "discord.js";
import interactionCreate from "../../events/guild/interactionCreate";
import { BotGuild } from "../../types";
import BotError from "../classes/Error";
import getColor from "../color";

export default async (message: Message, channel: TextChannel, guild: BotGuild, starrer: string) => {
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
 if (message.reactions.cache.size < 20) {
  await message.react("⭐").catch((e) => e);
 }

 const user = `${message.member?.displayName ?? message.author?.tag ?? "A User"}`;

 const embed: APIEmbed = {
  ...message.embeds[0]?.data,
  color: getColor(me),
  title: `${(message.channel as TextChannel).nsfw ? `This was starred in a NSFW channel` : ""}`,
  url: `${message.url}`,
  timestamp: new Date(message.editedTimestamp ?? message.createdTimestamp).toISOString(),
  author: {
   name: `${user}`,
   icon_url: message.author.displayAvatarURL() ?? "",
   url: `${message.url}`,
  },
  footer: {
   text: `Starred in ${(message.channel as TextChannel).nsfw ? "NSFW" : ""} #${
    (message.channel as TextChannel)?.name ?? "Mystery Channel"
   }`,
   icon_url: starrer ?? "",
  },
 };

 const spoiler = (message.channel as TextChannel).nsfw ? "||" : "";
 if (message.content && !message.embeds[0]) {
  embed.description = `${spoiler}${message.content.substring(0, 4000)}${message.content.length >= 4000 ? "..." : ""}${spoiler}`;
 }

 const t = message.attachments.size > 0 ? "attachments" : message.stickers.size > 0 ? "stickers" : null;
 let video = null;
 if (t) {
  if (!(message.channel as TextChannel).nsfw || !embed.video) {
   let attachment: any;
   if (t == "attachments") {
    video = message.attachments.find((a) => a.contentType == "video/mp4");
    if (video) {
     await channel.send({ content: `${user} in ${message.channel}: ${message.content ?? ""}`, files: [video.url] });
     return;
    }
    attachment = message.attachments.find(({ contentType: x }) => x == "image/gif" || x == "image/png" || x == "image/jpeg");
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

 if (embed.thumbnail && !channel.nsfw) embed.thumbnail = undefined;
 await channel.send({ embeds: [embed] });
};
