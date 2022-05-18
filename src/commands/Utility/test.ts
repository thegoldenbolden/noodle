import { ChatInputCommandInteraction } from "discord.js";
import { get, query } from "../../utils/functions/database";
import { convert } from "../../utils/functions/dayjs";
import { GuildProfile } from "../../utils/typings/database";
import { Command } from "../../utils/typings/discord";

export default <Command>{
  name: "test",
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const args = interaction.options.getString("arg");

      const g = await get<GuildProfile>({ discord_id: interaction.guildId, table: "guilds" });
      const a = g.autoroles?.[0];
      if (!a) return interaction.reply("no");

      console.log({
        convert: convert(a.created, { tz: interaction.guildLocale ?? undefined }),
      });

      if (args) {
        if (args === "reset") {
          await query(`update guilds set autoroles = [] where discord_id='${process.env.BUDS}'`);
          return;
        }

        if (args === "view") {
          const a = await get({ table: "guilds", discord_id: process.env.BUDS });
          console.log({
            ...a.channels,
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  },
};
