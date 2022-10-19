import { Guild } from "discord.js";
import { createGuild } from "../../lib/database";
import { useError } from "../../lib/log";

export default {
 name: "guildCreate",
 async execute(guild: Guild) {
  if (!guild || !guild.id) return;
  await createGuild(guild.id).catch((err) => useError(err, null));
 },
};
