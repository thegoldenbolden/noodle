import { Guild } from "discord.js";
import { createGuild } from "../../lib/database";
import error from "../../lib/error";

export default {
 name: "guildCreate",
 async execute(guild: Guild) {
  if (!guild || !guild.id) return;
  await createGuild(guild.id).catch((err) => error(err, null));
 },
};
