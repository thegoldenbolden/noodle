import { PermissionFlagsBits } from "discord-api-types/v10";
import { MessageReaction, User } from "discord.js";
import { client } from "../../bot";
import { get } from "../../utils/functions/database";
import { handleError } from "../../utils/functions/helpers";
import { Autorole, GuildProfile } from "../../utils/typings/database";
import Reactions from "../utils/reactions/index";

export default {
  name: "messageReactionAdd",
  async execute(reaction: MessageReaction, user: User) {
    try {
      if (user.bot) return;
      if (!reaction.message.guildId) return;

      const guild = await get<GuildProfile>({ discord_id: reaction.message.guildId, table: "guilds" });
      if (!guild) return;

      const { channels, autoroles, notifications } = guild;
      if ((!autoroles || autoroles?.length === 0) && channels.starboard) return;

      const cachedGuild = client.guilds.cache.get(`${reaction.message.guildId}`);
      if (!cachedGuild) return;

      const member = cachedGuild.members.cache.get(`${user.id}`);
      const permissions = member?.permissions;
      if (!member) return;

      const autorole = autoroles?.find((a: Autorole) => {
        a.type == "reaction" && reaction.message.id == a.message_id && reaction.message.channelId && a.channel_id;
      });

      if (autorole) {
        return await Reactions.handleAutorole("add", autorole, cachedGuild, reaction, member, notifications);
      }

      if (channels.starboard && reaction.emoji.name === "⭐" && permissions?.has(PermissionFlagsBits.Administrator)) {
        return await Reactions.handleStarboard(channels.starboard, reaction, member);
      }
    } catch (err: any) {
      err.message = `Reaction Add: ${err.message}`;
      handleError(err, null);
    }
  },
};
