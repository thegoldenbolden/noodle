import { Collection, ShardingManager, WebhookClient } from "discord.js";
import { Pool } from "pg";
import { PastaKing } from "./utils/types/discord";

if (process.env.NODE_ENV == "production") {
  const manager = new ShardingManager("./dist/bot.js", {
    execArgv: ["--no-warnings", "-r", "dotenv/config"],
    totalShards: "auto",
    token: process.env.BOT_TOKEN,
  });

  manager.on("shardCreate", (shard) =>
    console.log(`Shard ${shard.id} launched.`)
  );

  manager
    .spawn()
    .then((shards) => {
      shards.forEach((shard) => {
        shard.on("message", (message) => {
          console.log(
            `Shard[${shard.id}] : ${message._eval} : ${message._result}`
          );
        });
      });
    })
    .catch(console.error);
}

export const logger = new WebhookClient({
  id: `${process.env.LOGGER_ID}`,
  token: `${process.env.LOGGER_TOKEN}`,
});

export const error = new WebhookClient({
  id: `${process.env.ERROR_ID}`,
  token: `${process.env.ERROR_TOKEN}`,
});

const { username, password, hostname, port, pathname } = new URL(
  `${process.env.DATABASE_URL}`
);

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
