import { APISelectMenuComponent, ComponentType } from "discord-api-types/v10";
import { Message, Role, SelectMenuComponentOptionData, TextChannel } from "discord.js";
import { BotError, UserError } from "../../../utils/classes/Error";
import { editObjectFromDbArray } from "../../../utils/functions/database";
import { handleError } from "../../../utils/functions/helpers";
import { Autorole } from "../../../utils/typings/database";
import { checkSend } from "../autorole";
import { createButtons, Emojis, I, parseEmojis, R, splitComponentsIntoRows } from "./create";

type Params = (i: I, A: Autorole, C: TextChannel, R: R, M: Message<boolean>) => void;
export const run: Params = async (interaction, autorole, channel, roles, message) => {
  if (!roles) throw new UserError("We couldn't find the roles provided");

  if (roles.map((r) => r?.id).some((r: any) => autorole.role_ids.includes(r))) {
    throw new UserError(`A role provided is already being used.`);
  }

  checkSend(interaction, channel, autorole.type);

  const parsedEmojis: Emojis = autorole.type == "menu" ? null : await parseEmojis(interaction, roles, autorole.type);
  if (parsedEmojis?.failed?.[0]) {
    throw new UserError(`We cannot use the following emojis: ${parsedEmojis.failed.join(", ")}`);
  }

  const roles_ids: any = [...new Set([...autorole.role_ids, ...roles.map((r) => r?.id)])];
  if (autorole.type == "reaction") {
    if (parsedEmojis?.success.map((e) => e.id ?? e.name).some((e: any) => autorole.emoji_ids?.includes(e))) {
      throw new UserError("A provided emoji is already being used.");
    }

    parsedEmojis?.success.forEach(async (e: any, i: number) => {
      const timeout = setTimeout(async () => {
        try {
          i % 3 == 0 && checkSend(interaction, channel, autorole.type);
          await message.react(e);
          if (i === parsedEmojis.success.length - 1) {
            await update(roles_ids, autorole.message_title, `${interaction.guildId}`, "role_ids");

            const emoji_ids: any = [...new Set([...(autorole.emoji_ids ?? []), ...parsedEmojis?.success.map((e) => e?.id || e?.name)])];

            await update(emoji_ids, autorole.message_title, `${interaction.guildId}`, "emoji_ids");
            await interaction.editReply(`Successfully added roles to \*\*\*${autorole.message_title}\*\*\*.`);
          }
        } catch (err) {
          handleError(err, interaction);
        } finally {
          clearTimeout(timeout);
        }
      }, 2000);
    });
    return;
  }

  let options: any = {};
  if (autorole.type == "button") {
    const components = [...message.components.flatMap((component) => component.components.map((c) => c.data)), ...createButtons(parsedEmojis!.success, roles)];

    if (components.length > 25) throw new UserError("There can only be 25 buttons on a message.");

    const rows = splitComponentsIntoRows(components);
    options.components = rows;
  }

  if (autorole.type == "menu") {
    const component = message.resolveComponent("AUTOROLE")?.data;
    if (!component) throw new BotError("We were unable to find the menu.");
    let opts: SelectMenuComponentOptionData[] = [
      ...(component as APISelectMenuComponent).options,
      ...roles.map((role) => {
        return {
          label: role?.name ?? "No Role Name",
          value: role?.id ?? "No Role Id",
          emoji: (role as Role)?.unicodeEmoji ?? undefined,
        };
      }),
    ];

    if (opts.length > 25) throw new UserError("There can only 25 roles on a menu.");

    options.components = [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            ...component,
            max_values: opts.length,
            options: opts,
          },
        ],
      },
    ];
  }

  console.log(roles_ids);
  await editObjectFromDbArray({
    table: "guilds",
    discord_id: `${interaction.guildId}`,
    column: "autoroles",
    updateValue: roles_ids,
    key: "role_ids",
    lookup: "message_title",
    lookupValue: autorole.message_title,
  });

  console.log(options);
  checkSend(interaction, channel, autorole.type);
  await message.edit(options);
  await interaction.editReply(`Successfully added roles to \*\*\*${autorole.message_title}\*\*\*.`);
};

async function update(ids: string[], title: string, guildId: string, key: "role_ids" | "emoji_ids") {
  await editObjectFromDbArray({
    table: "guilds",
    discord_id: guildId,
    column: "autoroles",
    updateValue: ids,
    key: key,
    lookup: "message_title",
    lookupValue: title,
  });
}
