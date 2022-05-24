import { Collection, WebhookClient } from "discord.js";
import { Pool } from "pg";
import { PastaKing } from "./utils/typings/discord";

// if (process.env.NODE_ENV == "production") {
//   // For future support.
//   const manager = new ShardingManager("./dist/bot.js", {
//     execArgv: ["--no-warnings", "-r", "dotenv/config"],
//     totalShards: "auto",
//     token: process.env.BOT_TOKEN,
//     mode: "worker",
//   });

//   manager.on("shardCreate", (shard) => console.log(`Shard ${shard.id} launched.`));

//   manager.spawn().catch((e) => console.log(e));
// }

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

const { username, password, hostname, port, pathname } = new URL(`${process.env.DATABASE_URL}`);

export const pool = new Pool({
 password,
 port: parseInt(port),
 host: hostname,
 database: pathname.split("/")[1],
 user: username,
 max: 2,
 idleTimeoutMillis: 1000 * 60 * 3,
 connectionTimeoutMillis: 1000,
 ssl: {
  rejectUnauthorized: false,
 },
});

export const Pasta: PastaKing = {
 commands: new Collection(),
 guilds: new Collection(),
 users: new Collection(),
 cooldowns: new Collection(),
 deck: [],
};

type ExitOptions = {
 cleanup?: boolean;
 exit?: boolean;
};

function exitHandler(options: ExitOptions, exitCode: number) {
 if (options.cleanup) {
  pool.end();
 }

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
