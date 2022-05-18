import { Client } from "discord.js";
// import { useLog } from "../../utils/functions/helpers";

export default {
  name: "ready",
  once: true,
  async execute(client: Client) {
    // const { commands } = await import("../../ignore/commands");
    // const buds = client.guilds.cache.get(process.env.BUDS);
    // await buds?.commands.set(commands).catch((e) => console.log(e));
    // useLog("READY", async () => {
    // await client.application?.commands.set([]).catch((e) => console.log(e));
    // const ar = await buds?.commands.edit("970755495382106192", {
    //   name: "test",
    //   description: "test command",
    //   options: [],
    // });
    // buds?.commands.fetch().then((r) => {
    //   console.log(r);
    // });
    // console.log(ar);
    // });
  },
};
