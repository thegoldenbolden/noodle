import { Client } from "discord.js";
import { logger } from "../../index";

export default {
  name: "ready",
  once: true,
  async execute(client: Client) {
    const timeout = setTimeout(() => {
      logger.send("Im online");
      //   const Buds = client.guilds.cache.get(`${process.env.BUDS}`);

      //   const animanga = commands.find((command) => command.name === "animanga");
      //   console.log(animanga.options[1].options);

      //   Buds?.commands
      //     .set(commands as any)
      //     .then((co) => {
      //       console.log(co.map((f) => f.options.find((f) => f.autocomplete)));
      //     })
      //     .catch((err) => err);
      //   clearTimeout(timeout);
    }, 3000);
  },
};
