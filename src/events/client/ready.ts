import { ApplicationCommandDataResolvable, Client } from "discord.js";
import { useLog } from "../../utils/functions/helpers";

export default {
  name: "ready",
  once: true,
  async execute(client: Client) {
    await useLog("Ready", () => {});
    // const { commands } = await import("../../ignore/commands");
    // const cmd = await client.application?.commands.set([]);

    async function createGlobalCommand(command: ApplicationCommandDataResolvable) {
      const cmd = await client.application?.commands.create(command);
    }

    async function createTestCommands(command: any[]) {
      const buds = client.guilds.cache.get(process.env.BUDS);
      await buds?.commands.set(command).catch((e) => console.log(e));
    }
  },
};
