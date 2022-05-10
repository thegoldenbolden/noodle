// import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js"; v14
// import { Client } from "discord.js";
import { ActivityType, GatewayIntentBits } from "discord-api-types/v10";
import { Client, Partials } from "discord.js";
import { readdirSync } from "fs";
import { Pasta } from "./index";
import { getInitialProps, handleError } from "./utils/functions";

export const client = new Client({
  // Discord.js v14
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

  // Discord.js v13
  // partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"],
  // intents: [
  //   "GUILD_EMOJIS_AND_STICKERS",
  //   "GUILD_MEMBERS",
  //   "GUILD_MESSAGE_REACTIONS",
  //   "GUILD_MESSAGES",
  //   "GUILD_WEBHOOKS",
  //   "GUILD_BANS",
  //   "GUILD_PRESENCES",
  //   "GUILDS",
  //   "GUILD_VOICE_STATES",
  // ],
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
  // await create({ table: "guilds" });
  // await insert({ table: "guilds", id: process.env.BUDS });
  // await get({ table: "guilds", id: process.env.BUDS });

  // console.log(Pasta.guilds.get(process.env.BUDS));

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

  await register("commands");
  await register("events");
  await getInitialProps();

  const TOKEN = process.env.BOT_TOKEN;
  await client.login(TOKEN).catch((err) => handleError(err));
})();
