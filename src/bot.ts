import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js";
import { readdirSync } from "fs";
import { error, logger, Pasta } from "./index";
import { format } from "./utils/dayjs";
import { getEmoji } from "./utils/discord";
import { getInitialProps, randomColor } from "./utils/functions";

export const client = new Client({
  partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction, Partials.User],
  intents: [
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  allowedMentions: {
    parse: ["roles", "users"],
    repliedUser: false,
  },
  presence: {
    status: "online",
    activities: [
      {
        name: "in a field of pasta",
        type: ActivityType.Playing,
      },
    ],
  },
});

(async () => {
  const register = async (name: "commands" | "events") => {
    const directories = readdirSync(`./dist/${name}`);

    for (const directory in directories) {
      const files = readdirSync(`./dist/${name}/${directories[directory]}`).filter((file) => file.endsWith(".js"));

      for (const file in files) {
        const { default: exported } = await import(`./${name}/${directories[directory]}/${files[file]}`);

        switch (name) {
          case "commands":
            exported?.name && Pasta.commands.set(exported.name, exported);
            break;
          case "events":
            if (exported.once) {
              client.once(exported.name, exported.execute.bind(null));
            } else {
              client.on(exported.name, exported.execute.bind(null));
            }
            break;
        }
      }
    }
  };

  console.time("Registering");
  await register("commands");
  await register("events");
  await getInitialProps();
  console.timeEnd("Registering");

  const TOKEN = process.env.BOT_TOKEN;
  const start = Date.now();
  await client.login(TOKEN).catch((err) => {
    console.log(err);
    error.send(`${err.message}`);
  });

  let k = getEmoji(["first", "back", "next", "last", "previous", "load"]);
  console.log(k);

  const end = Date.now();
  logger.send({
    embeds: [
      {
        title: `Login Execution`,
        color: randomColor(),
        timestamp: format(),
        fields: [
          {
            name: `Time Taken`,
            value: `${(end - start) / 1000} seconds..`,
          },
          {
            name: `Approx Memory Used`,
            value: `${process.memoryUsage().heapUsed / 1024 / 1024}`,
          },
        ],
      },
    ],
  });
})();
