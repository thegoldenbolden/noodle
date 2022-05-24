import { ApplicationCommandDataResolvable, Client } from "discord.js";
import { Logs } from "../../index";
import { useLog } from "../../utils/functions/helpers";

export default {
 name: "ready",
 once: true,
 async execute(client: Client) {
  await useLog({ name: "Ready", callback: async () => Logs.send("I'm online.") });
  const { commands } = await import("../../ignore/commands");
  // const cmd = await client.application?.commands.set([]);

  async function createGlobalCommand(command: ApplicationCommandDataResolvable[]) {
   await client.application?.commands.set(command);
  }

  async function createTestCommands(command: any[]) {
   const PASTAFONIA = client.guilds.cache.get(process.env.PASTAFONIA);
   await PASTAFONIA?.commands
    .create({
     name: "test",
     description: "test buddy",
    })
    .catch((e) => console.log(e));
  }
 },
};
