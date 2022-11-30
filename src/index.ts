import { ActivityType, Client, Collection, Partials, WebhookClient } from "discord.js";
import { readdirSync } from "fs";
import { setCommands } from "./lib/discord/commands";
import { useError } from "./lib/log";
import { Bot as BotType } from "./types";

export const client = new Client({
 partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction, Partials.User],
 intents: [
  "DirectMessages",
  "GuildEmojisAndStickers",
  "GuildEmojisAndStickers",
  "GuildMembers",
  "GuildMessageReactions",
  "GuildMessages",
  "Guilds",
  "MessageContent",
  "GuildVoiceStates",
 ],
 allowedMentions: {
  parse: ["roles", "users"],
  repliedUser: false,
 },
 presence: {
  status: "online",
  activities: [{ name: "a noodle documentary", type: ActivityType.Watching }],
 },
});

// For api calls, etc.
export const Logs = new WebhookClient({
 id: `${process.env.LOGGER_ID}`,
 token: `${process.env.LOGGER_TOKEN}`,
});

// Log errors.
export const Errors = new WebhookClient({
 id: `${process.env.ERROR_ID}`,
 token: `${process.env.ERROR_TOKEN}`,
});

export const Bot: BotType = {
 commands: new Collection(),
 cooldowns: new Collection(),
 modals: new Collection(),
};

type ExitOptions = { cleanup?: boolean; exit?: boolean };
async function exitHandler(options: ExitOptions, exitCode: number) {
 if (exitCode || exitCode === 0) {
  console.log(`Exit Code: ${exitCode}`);
  await Logs.send({ content: "Going offline" });
 }

 if (options.exit) process.exit();
}

//do something when app is closing
process.on("exit", exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on("SIGINT", exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on("uncaughtException", exitHandler.bind(null, { exit: true }));

(async () => {
 const register = async (name: "commands" | "events") => {
  console.group(`Register ${name}`);
  const categories = readdirSync(`./dist/${name}`).filter((folder) => folder != "test");
  for (const category in categories) {
   const files = readdirSync(`./dist/${name}/${categories[category]}`).filter((file) => file.endsWith(".js"));
   for (const file of files) {
    const { default: exported } = await import(`./${name}/${categories[category]}/${file}`);

    switch (name) {
     case "commands":
      console.log(`Added command ${exported.name}`);
      exported?.name && Bot.commands.set(exported.name, exported);
      break;
     case "events":
      console.log(`Listening for ${exported.name} event`);
      if (exported.once) {
       client.once(exported.name, exported.execute.bind(null));
      } else {
       client.on(exported.name, exported.execute.bind(null));
      }
      break;
    }
   }
  }

  console.groupEnd();
 };

 let TOKEN = process.env.NODE_ENV === "production" ? process.env.TOKEN_PRODUCTION : process.env.TOKEN_DEVELOPMENT;
 await client.login(TOKEN).catch((err: any) => useError(err));
 client
  .login(TOKEN)
  .then(async () => {
   await register("commands");
   await register("events");
   console.log(`Logged in as ${client.user?.tag}`);
  })
  .catch((err) => useError(err));
})();
