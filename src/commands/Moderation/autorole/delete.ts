import { ChatInputCommandInteraction } from "discord.js";
import { UserError } from "../../../utils/classes/Error";
import { deleteObjectFromDbArray } from "../../../utils/functions/database";
import { Autorole } from "../../../utils/typings/database";

type Params = (i: ChatInputCommandInteraction, a: Autorole) => void;
export const run: Params = async (interaction, autorole) => {
  if (!interaction.guildId) throw new UserError("There was an error deleting this autorole.");
  await deleteObjectFromDbArray({
    table: "guilds",
    discord_id: interaction.guildId,
    column: "autoroles",
    lookup: "message_id",
    lookupValue: autorole.message_id,
  });
  await interaction.editReply(`Sucessfully deleted the autorole \*\*\*${autorole.message_title}\*\*\*`);
};
