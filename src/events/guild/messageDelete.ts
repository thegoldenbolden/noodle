import { Message } from "discord.js";
import { addObjectToDbArray, get, query } from "../../utils/functions/database";
import { handleError } from "../../utils/functions/helpers";
import { GuildProfile, Notifications } from "../../utils/typings/database";

export default {
  name: "messageDelete",
  async execute(message: Message) {
    if (!message.guild || !message.guild.available || !message.guildId) return;
    if (!message || !message.id) return;

    try {
      const guild = await get<GuildProfile>({ table: "guilds", discord_id: message.guildId });
      if (!guild) return;

      const autoroles = guild.autoroles;
      if (!autoroles || autoroles.length === 0) return;
      const titles: string[] = [];

      const autorolesRemaining = autoroles.filter((a) => {
        if (a.message_id === message.id) {
          titles.push(a.message_title);
          return false;
        }
        return true;
      });

      await query(`update guilds set autoroles = '${JSON.stringify(autorolesRemaining)}' where discord_id='${message.guildId}'`);
      guild.autoroles = autorolesRemaining;

      if (titles.length > 0) {
        await addObjectToDbArray({
          column: "notifications",
          table: "guilds",
          discord_id: message.guildId,
          updateValue: {
            id: `AR_MESSAGE-${message.id}`,
            message_title: "Autorole: Message Deleted",
            message: `The following autorole was deleted because the message was deleted: ${titles.join(", ")}`,
            read: false,
          } as Notifications,
        });
      }
    } catch (err) {
      handleError(err, null);
    }
  },
};
