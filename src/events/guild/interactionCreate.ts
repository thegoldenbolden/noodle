import { CommandInteraction } from "discord.js";
import { get } from "../../utils/functions/database";
import { handleError } from "../../utils/functions/helpers";
import Interaction from "../utils/interaction";

export default {
  name: "interactionCreate",
  async execute(interaction: CommandInteraction) {
    if (!interaction.guild?.available) return;
    try {
      await get({ discord_id: interaction.guildId, table: "guilds" });

      if (interaction.isAutocomplete()) {
        await Interaction.handleAutocomplete(interaction);
        return;
      }

      if (interaction.isSelectMenu()) {
        await Interaction.handleSelectMenu(interaction);
        return;
      }

      if (interaction.isButton()) {
        await Interaction.handleButton(interaction);
        return;
      }

      if (interaction.isCommand()) {
        await Interaction.handleCommand(interaction);
        return;
      }
    } catch (err) {
      handleError(err, interaction);
    }

    // Discord Sharding
    // if (process.env.NODE_ENV === "production") {
    //   const stats: any[] = await Promise.all([
    //     client.shard?.fetchClientValues("guilds.cache.size"),
    //     client.shard?.broadcastEval((c) => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
    //   ]);

    //   const guilds = stats[0].reduce((acc: number, count: number) => acc + count, 0);
    //   const members = stats[0].reduce((acc: number, count: number) => acc + count, 0);

    //   console.log({ guilds, members });
    // };
  },
};
