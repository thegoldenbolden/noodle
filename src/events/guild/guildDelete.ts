import { Guild } from "discord.js";
import { Pasta } from "../../index";
import { query } from "../../utils/functions/database";
import { handleError } from "../../utils/functions/helpers";

export default {
  name: "guildDelete",
  async execute(guild: Guild) {
    if (!guild || !guild.id) return;
    const pasta = Pasta.guilds.get(guild.id);
    if (!pasta) return;

    try {
      await query(`delete from guilds where discord_id='${guild.id}'`);
      Pasta.guilds.delete(guild.id);
    } catch (err) {
      handleError(err, null);
    }
  },
};
