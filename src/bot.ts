import { ActivityType, GatewayIntentBits } from "discord-api-types/v10";
import { Client, Partials } from "discord.js";
import { readdirSync } from "fs";
import { Pasta } from "./index";
import { getInitialProps, handleError } from "./utils/functions/helpers";

export const client = new Client({
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.User,
  ],
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
      if (name === "events" && directories[directory] === "utils") continue;
      const files = readdirSync(
        `./dist/${name}/${directories[directory]}`
      ).filter((file) => file.endsWith(".js"));

      for (const file in files) {
        const { default: exported } = await import(
          `./${name}/${directories[directory]}/${files[file]}`
        );

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

  await register("commands");
  await register("events");
  await getInitialProps();

  const TOKEN = process.env.BOT_TOKEN;
  await client.login(TOKEN).catch((err) => handleError(err));
})();
