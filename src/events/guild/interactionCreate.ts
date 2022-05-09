import { CommandInteraction } from "discord.js";
import Interaction from "../../utils/events/interaction";
import { handleError } from "../../utils/functions.js";

export default {
  name: "interactionCreate",
  async execute(interaction: CommandInteraction) {
    if (!interaction.guild?.available) return;

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
      console.log("Autocomplete");
      return await Interaction.handleAutocomplete(interaction).catch(async (err) => await handleError(err));
    }

    // Discord.js v13.7
    if (interaction.isModalSubmit()) {
      console.log("Modal Submit");
      return await Interaction.handleModalSubmit(interaction);
    }

    if (interaction.isSelectMenu()) {
      console.log("Select Menu");
      return await Interaction.handleSelectMenu(interaction);
    }

    if (interaction.isCommand()) {
      console.log("Command");
      return await Interaction.handleCommand(interaction).catch(async (err) => await handleError(err, interaction));
    }
  },
};
