import { APISelectMenuComponent, ComponentType } from "discord-api-types/v10";
import { Message, TextChannel } from "discord.js";
import PastaError from "../../../utils/classes/Error";
import { editObjectFromDbArray } from "../../../utils/functions/database";
import { Autorole } from "../../../utils/typings/database";
import { checkSend } from "../autorole";
import { I, R, splitComponentsIntoRows } from "./create";

type Params = (i: I, A: Autorole, C: TextChannel, R: R, M: Message<boolean>) => void;
export const run: Params = async (interaction, autorole, channel, roles, message) => {
 if (!roles) throw new PastaError({ message: "We couldn't find the roles provided" });

 if (roles.map((r) => r?.id).some((r: any) => !autorole.role_ids.includes(r))) {
  throw new PastaError({ message: `A role provided isn't being used.` });
 }

 checkSend(interaction, channel, autorole.type);

 const index: number[] = [];
 const rolesRemaining = autorole.role_ids.filter((r, i) => {
  if (roles.has(r)) {
   index.push(i);
   return false;
  }
  return true;
 });

 if (rolesRemaining.length == 0) throw new PastaError({ message: "We cannot remove every role on this autorole message." });

 if (autorole.type == "reaction") {
  const emojisRemaining = autorole.emoji_ids!.filter((e, i) => !index.includes(i));
  const emojisToRemove = index.map((i) => autorole.emoji_ids?.[i]);

  emojisToRemove.forEach(async (emoji) => await message.reactions.cache?.get(`${emoji}`)?.remove());
  await update(rolesRemaining, autorole.message_title, `${interaction.guildId}`, "role_ids");
  await update(emojisRemaining, autorole.message_title, `${interaction.guildId}`, "emoji_ids");
 }

 let options: any = {};
 if (autorole.type == "button") {
  let components = message.components.flatMap((component) => component.components.map((c) => c.data));
  components = components.filter((c: any) => rolesRemaining.includes(c.custom_id?.split("-")?.[1]));

  if (components.length <= 0) throw new PastaError({ message: "There needs to be at least one button." });

  const rows = splitComponentsIntoRows(components);
  options.components = rows;
 }

 if (autorole.type == "menu") {
  const component = message.resolveComponent("AUTOROLE")?.data;
  if (!component) throw new PastaError({ message: "We were unable to find the menu." });
  let opts = (component as APISelectMenuComponent).options.filter((opt) => rolesRemaining.includes(opt.value));

  if (opts.length <= 0) throw new PastaError({ message: "There needs to be at least one role on the menu." });

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

 await editObjectFromDbArray({
  table: "guilds",
  discord_id: `${interaction.guildId}`,
  column: "autoroles",
  updateValue: rolesRemaining,
  key: "role_ids",
  lookup: "message_title",
  lookupValue: autorole.message_title,
 });

 checkSend(interaction, channel, autorole.type);
 await message.edit(options);
 await interaction.editReply(`Successfully removed roles from \*\*\*${autorole.message_title}\*\*\*.`);
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
