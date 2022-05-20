import { ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { UserError } from "../../../utils/classes/Error";
import { updateObjectInDb } from "../../../utils/functions/database";
import { GuildProfile } from "../../../utils/typings/database";

type Run = (I: ChatInputCommandInteraction, G: GuildProfile) => void;
export const run: Run = async (interaction, guild) => {
  const type = interaction.options.getString("type", true) as "starboard" | "logger";
  const channel = interaction.options.getChannel("channel");
  const channels = guild.channels;

  if (channel) {
    const permissions = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages];
    if (!interaction.guild?.members?.me?.permissionsIn(channel.id).has(permissions)) {
      throw new UserError(`I do not have the View Channel and/or Send Messages permissions for ${channel}`);
    }

    if (channels[type] === channel.id) {
      throw new UserError(`This channel is already set as the ${type}.`);
    }

    await updateObjectInDb({
      table: "guilds",
      discord_id: `${interaction.guildId}`,
      column: "channels",
      newValue: `${channel.id}`,
      path: [type],
    });

    await interaction.editReply(`${channel} will now be used as a ${type}.`);
    return;
  }

  await updateObjectInDb({
    table: "guilds",
    discord_id: `${interaction.guildId}`,
    column: "channels",
    newValue: null,
    path: ["starboard"],
  });

  await interaction.editReply(`Pasta will no longer use a ${type}`);
  return;
};
