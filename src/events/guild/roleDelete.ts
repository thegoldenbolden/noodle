import { Role } from "discord.js";
import { addObjectToDbArray, get } from "../../utils/functions/database";
import { handleError } from "../../utils/functions/helpers";
import { GuildProfile, Notifications } from "../../utils/typings/database";

export default {
  name: "roleDelete",
  async execute(role: Role) {
    if (!role || !role.id || !role.guild.id) return;

    try {
      const guild = await get<GuildProfile>({ table: "guilds", discord_id: role.guild.id });
      if (!guild) return;

      const autoroles = guild.autoroles;
      if (!autoroles || autoroles.length === 0) return;
      const roles = autoroles
        .filter((a) => a.role_ids.includes(role.id))
        .map((a) => `[${a.message_title}](https://discord.com/channels/${role.guild.id}/${a.channel_id}/${a.message_id})`);

      if (roles.length > 0) {
        const r = roles.join(", ");
        await addObjectToDbArray({
          column: "notifications",
          table: "guilds",
          discord_id: role.guild.id,
          updateValue: {
            id: `AR_ROLE-${role.id}`,
            message_title: `Autoroles: ${role.name ?? role.id} Deleted`,
            message: `The role ${role.name} was deleted and is included in the following autoroles: ${r}.`,
            read: false,
          } as Notifications,
        });
      }
    } catch (err) {
      handleError(err, null);
    }
  },
};
