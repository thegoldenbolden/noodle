import { ChannelType, DMChannel, GuildChannel } from "discord.js";
import { addObjectToDbArray, get, query, updateObjectInDb } from "../../utils/functions/database";
import { handleError } from "../../utils/functions/helpers";
import { GuildProfile, Notifications } from "../../utils/typings/database";

export default {
  name: "channelDelete",
  async execute(channel: DMChannel | GuildChannel) {
    if (!channel || !channel.id || channel.type == ChannelType.DM) return;
    if (!channel.guild || !channel.guild.available || !channel.guildId) return;

    try {
      const guild = await get<GuildProfile>({ table: "guilds", discord_id: channel.guildId });
      if (!guild) return;

      const starboardDeleted = guild.channels.starboard === channel.id;
      const loggerDeleted = guild.channels.logger === channel.id;
      if (starboardDeleted || loggerDeleted) {
        await updateObjectInDb({
          column: "channels",
          table: "guilds",
          discord_id: channel.guildId,
          path: [starboardDeleted ? "starboard" : "logger"],
          newValue: null,
        });

        await addObjectToDbArray({
          column: "notifications",
          table: "guilds",
          discord_id: channel.guildId,
          updateValue: {
            id: `channel-${channel.id}`,
            message_title: `${starboardDeleted ? "Starboard" : "Logger"} Deleted`,
            message: `A pasta channel was deleted by something other than \*\*/server channels remove\*\*`,
            read: false,
          } as Notifications,
        });
      }

      const autoroles = guild.autoroles;
      if (!autoroles || autoroles.length === 0) return;

      const titles: string[] = [];
      const remainingAutoroles = autoroles.filter((a) => {
        if (a.channel_id === channel.id) {
          titles.push(a.message_title);
          return false;
        }
        return true;
      });

      await query(`update guilds set autoroles = '${JSON.stringify(remainingAutoroles)}' where discord_id='${channel.guildId}'`);
      guild.autoroles = remainingAutoroles;

      if (titles.length > 0) {
        await addObjectToDbArray({
          column: "notifications",
          table: "guilds",
          discord_id: channel.guildId,
          updateValue: {
            id: `AR_CHANNEL-${channel.id}`,
            message_title: `Autorole: ${channel.name} Deleted`,
            message: `The following autoroles were deleted because the channel they were in was deleted. ${titles.join(", ")}`,
            read: false,
          } as Notifications,
        });
      }
    } catch (err) {
      handleError(err, null);
    }
  },
};
