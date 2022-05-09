import { Message } from "discord.js";

export default {
  name: "messageCreate",
  async execute(message: Message) {
    if (!message.guild?.available) return;
    if (message.author.id !== process.env.GOLDY) return;

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
