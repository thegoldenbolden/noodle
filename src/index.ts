import { ActivityType, Client, Collection, Partials, WebhookClient } from "discord.js";
import { readdirSync } from "fs";
import handleError from "./lib/error";
import prisma from "./lib/prisma";
import { Bot as BotType, SubmissionType } from "./types";

export const client = new Client({
 partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction, Partials.User],
 intents: [
  "DirectMessages",
  "GuildEmojisAndStickers",
  "GuildEmojisAndStickers",
  "GuildMembers",
  "GuildMessageReactions",
  "GuildMessages",
  "GuildPresences",
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
  activities: [{ name: "Noodle 101", type: ActivityType.Playing }],
 },
});

export const Logs = new WebhookClient({
 id: `${process.env.LOGGER_ID}`,
 token: `${process.env.LOGGER_TOKEN}`,
});

export const Errors = new WebhookClient({
 id: `${process.env.ERROR_ID}`,
 token: `${process.env.ERROR_TOKEN}`,
});

export const Submissions = new WebhookClient({
 id: `${process.env.SUBMISSIONS_ID}`,
 token: `${process.env.SUBMISSIONS_TOKEN}`,
});

export const Bot: BotType = {
 commands: new Collection(),
 guilds: new Collection(),
 users: new Collection(),
 cooldowns: new Collection(),
 deck: [],
 games: {
  versus: new Collection(),
 },
};

type ExitOptions = { cleanup?: boolean; exit?: boolean };
function exitHandler(options: ExitOptions, exitCode: number) {
 if (exitCode || exitCode === 0) {
  console.log(`Exit Code: ${exitCode}`);
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
  const categories = readdirSync(`./dist/${name}`).filter((folder) => folder != "test");
  for (const category in categories) {
   const files = readdirSync(`./dist/${name}/${categories[category]}`).filter((file) => file.endsWith(".js"));
   for (const file of files) {
    const { default: exported } = await import(`./${name}/${categories[category]}/${file}`);

    switch (name) {
     case "commands":
      exported?.name && Bot.commands.set(exported.name, exported);
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

 (["versus"] as SubmissionType[]).forEach(async (key) => {
  const data = await prisma[key].findMany({ include: { user: { select: { name: true, private: true } } } });
  data.forEach((d) => Bot.games[key].set(d.id, d as any));
 });

 let TOKEN = process.env.TOKEN_PRODUCTION;
 if (process.env.NODE_ENV === "development") {
  TOKEN = process.env.TOKEN_DEVELOPMENT;
 }
 await client.login(TOKEN).catch((err: any) => handleError(err));
})();
