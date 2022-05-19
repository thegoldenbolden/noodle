import { Guild } from "discord.js";
import { GuildProfile } from "src/utils/typings/database";
import { logger } from "../../index";
import { get } from "../../utils/functions/database";
import { handleError } from "../../utils/functions/helpers";

export default {
  name: "guildCreate",
  async execute(guild: Guild) {
    if (!guild || !guild.id) return;

    try {
      logger
        .send({
          embeds: [
            {
              author: {
                name: `${guild.name ?? "No Guild Name"}`,
              },
              fields: [{ name: "ID", value: guild.id, inline: true }],
              timestamp: new Date().toISOString(),
            },
          ],
        })
        .catch((e: any) => handleError(e, null));

      await get<GuildProfile>({ table: "guilds", discord_id: guild.id });
    } catch (err) {
      handleError(err, null);
    }
  },
};
