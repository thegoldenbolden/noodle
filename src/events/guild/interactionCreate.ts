import { CommandInteraction } from "discord.js";
import { get } from "../../utils/functions/database";
import { handleError } from "../../utils/functions/helpers";
import Interaction from "../utils/interaction";

export default {
  name: "interactionCreate",
  async execute(interaction: CommandInteraction) {
    if (!interaction.guild?.available) return;
    await get({ discord_id: interaction.guildId, table: "guilds" });

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

    if (interaction.isAutocomplete()) {
      return await Interaction.handleAutocomplete(interaction).catch(async (err) => await handleError(err));
    }

    if (interaction.isSelectMenu()) {
      return await Interaction.handleSelectMenu(interaction);
    }

    if (interaction.isButton()) {
      return await Interaction.handleButton(interaction);
    }

    if (interaction.isCommand()) {
      return await Interaction.handleCommand(interaction).catch(async (err) => {
        console.log(err.stack);
        await handleError(err, interaction);
      });
    }
  },
};
