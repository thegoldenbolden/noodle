import { Guild, GuildMember, MessageReaction } from "discord.js";
import { addObjectToDbArray } from "../../../utils/functions/database";
import { Autorole, Notifications } from "../../../utils/typings/database";

type Action = "add" | "remove";
export default async function (t: Action, a: Autorole, g: Guild, r: MessageReaction, m: GuildMember, n?: Notifications[]) {
  const emojiIdOrName = r.emoji.id ?? r.emoji.name;
  if (!emojiIdOrName) throw new Error(`Emoji id returned ${emojiIdOrName}.`);

  const emojiIndex = a.emoji_ids?.findIndex((emoji) => emoji === emojiIdOrName);
  if (emojiIndex === undefined || emojiIndex === -1) return;

  const roleId = a.role_ids[emojiIndex];
  if (!roleId) throw new Error(`Guild: ${g.id}\nAR_ROLES: ${a.role_ids.join(", ")}\nAR_E_IDS: ${a.emoji_ids?.join(", ")}\nE_IDX: ${emojiIndex}`);

  const role = g.roles.cache.get(`${roleId}`);
  if (!role) throw new Error(`Guild does not have a role with ${roleId}`);

  if (!role.editable) {
    // If guild has been notified of uneditable role already.
    if (n && n.some((n) => n.id === `AR_NO_PERMS-${role.id}`)) return;
    await addObjectToDbArray({
      discord_id: `${g.id}`,
      table: "guilds",
      column: "notifications",
      updateValue: {
        id: `AR_NO_PERMS-${role.id}`,
        message_title: `Autorole: Missing Perms`,
        message: `A user tried to ${t} the role \_${role.name}\_ but failed because we cannot edit it.`,
        read: false,
      } as Notifications,
    });
    return;
  }

  switch (t) {
    case "add":
      await m.roles.add(`${role.id}`);
      break;
    case "remove":
      await m.roles.remove(`${role.id}`);
      break;
  }
}
