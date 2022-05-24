import { Guild } from "discord.js";
import { GuildProfile } from "src/utils/typings/database";
import { Logs } from "../../index";
import { get } from "../../utils/functions/database";
import { handleError } from "../../utils/functions/helpers";

export default {
 name: "guildCreate",
 async execute(guild: Guild) {
  if (!guild || !guild.id) return;

  try {
   await Logs.send({
    embeds: [
     {
      description: "Added guild.",
      author: { name: `${guild.name ?? "No Guild Name"}` },
      fields: [{ name: "ID", value: guild.id, inline: true }],
      timestamp: new Date().toISOString(),
     },
    ],
   });

   await get<GuildProfile>({ table: "guilds", discord_id: guild.id });
  } catch (err) {
   handleError(err as Error, null);
  }
 },
};
