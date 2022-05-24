import { MessageReaction, User } from "discord.js";
import { client } from "../../bot";
import { get } from "../../utils/functions/database";
import { handleError } from "../../utils/functions/helpers";
import { Autorole, GuildProfile } from "../../utils/typings/database";
import Reactions from "../utils/reactions/index";

export default {
 name: "messageReactionRemove",
 async execute(reaction: MessageReaction, user: User) {
  try {
   if (user.bot) return;
   if (!reaction.message.guildId) return;

   const guild = await get<GuildProfile>({ discord_id: reaction.message.guildId, table: "guilds" });
   if (!guild) return;

   const { autoroles, notifications } = guild;
   if (!autoroles || autoroles?.length === 0) return;

   const cachedGuild = client.guilds.cache.get(`${reaction.message.guildId}`);
   if (!cachedGuild) return;

   const member = cachedGuild.members.cache.get(`${user.id}`);
   if (!member) return;

   const autorole = autoroles?.find(
    (a: Autorole) =>
     a.type == "reaction" && reaction.message.id == a.message_id && reaction.message.channelId && a.channel_id
   );

   if (autorole) {
    return await Reactions.handleAutorole("remove", autorole, cachedGuild, reaction, member, notifications);
   }
  } catch (err: any) {
   handleError(err, null);
  }
 },
};
