import { Client } from "discord.js";
import { useLog } from "../../utils/functions";

export default {
  name: "ready",
  once: true,
  async execute(client: Client) {
    useLog("READY", async () => {
      const buds = client.guilds.cache.get(process.env.BUDS);
      // const ar = await buds?.commands.edit("970755495382106192", {
      //   name: "test",
      //   description: "test command",
      //   options: [],
      // });
      // await buds?.commands.set(commands);
      // buds?.commands.fetch().then((r) => {
      //   console.log(r);
      // });
      // console.log(ar);
    });
  },
};

// [
//   { name: "profile", id: "965951731005546516" },
//   { name: "list", id: "965951731005546517" },
//   { name: "color", id: "965951731005546518" },
//   { name: "comic", id: "965951731005546519" },
//   { name: "rick", id: "965951731005546520" },
//   { name: "config", id: "965951731005546521" },
//   { name: "role", id: "965951731005546522" },
//   { name: "autorole", id: "965951731005546523" },
//   { name: "Starboard", id: "965951731005546524" },
//   { name: "unpin", id: "965951731005546525" },
//   { name: "Profile", id: "965951731106205746" },
//   { name: "youtube", id: "965951731106205749" },
//   { name: "autocomplete", id: "970755495382106192" },
//   { name: "animanga", id: "970777038346674176" },
// ];
