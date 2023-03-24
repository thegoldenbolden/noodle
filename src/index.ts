import type { Bot as TBot, Command } from "./types";

import { ActivityType, ChannelType, Client, Collection, Partials, WebhookClient } from "discord.js";
import { checkCooldown, checkPermissions } from "./lib/discord/CheckPermissions";
import { Configuration, OpenAIApi } from "openai";
import { useError, useLog } from "./lib/Logger";
import { readdirSync } from "fs";
import Kitsu from "kitsu";

export const client = new Client({
 partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction, Partials.User],
 allowedMentions: { parse: ["roles", "users"], repliedUser: false },
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
 presence: {
  status: "online",
  activities: [{ name: "a noodle documentary", type: ActivityType.Watching }],
 },
});

export const Logs = new WebhookClient({ id: process.env.LOGGER_ID, token: process.env.LOGGER_TOKEN });
export const Errors = new WebhookClient({ id: process.env.ERROR_ID, token: process.env.ERROR_TOKEN });

export const Bot: TBot = {
 commands: new Collection(),
 cooldowns: new Collection(),
 modals: new Collection(),
 openai: new Collection(),
 servers: undefined,
};

export const KitsuApi = new Kitsu();

const configuration = new Configuration({
 apiKey: process.env.OPENAI_API_KEY,
 organization: process.env.OPENAI_ORGANIZATION_ID,
});

export const openai = new OpenAIApi(configuration);

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

 await register("commands");

 client.once("ready", async (client) => {
  console.log(`${client.user.tag} Ready!`);
  useLog({ name: "Ready", callback: () => Logs.send("I'm online.") });
 });

 client.on("interactionCreate", async (interaction) => {
  if (interaction.channel?.type !== ChannelType.DM && !interaction.guild?.available) return;

  try {
   if (interaction.channel?.type !== ChannelType.DM && !interaction.guild?.available) return;

   if (interaction.isCommand()) {
    let command: Command | undefined;

    if (interaction.isContextMenuCommand()) {
     command = Bot.commands.find((command) => command.contexts?.includes(interaction.commandName));
    } else {
     command = Bot.commands.get(interaction.commandName);
    }

    if (!command) throw new Error(`${interaction.commandName} is not a command.`);
    if (interaction.isAutocomplete()) return command.autocomplete && (await command.autocomplete(interaction));
    checkCooldown(interaction, command);
    checkPermissions(interaction.memberPermissions, command.permissions);
    return await command.execute(interaction);
   }

   if (interaction.isMessageComponent()) {
    const [commandName, argument] = interaction.customId.split("-");
    const command = Bot.commands.get(commandName);
    if (!command) throw new Error(`${commandName} is not a command.`);
    if (interaction.isButton()) return command.buttons && (await command.buttons(interaction, argument));
    if (interaction.isAnySelectMenu()) return command.menu && (await command.menu(interaction, argument));
   }

   if (interaction.isModalSubmit()) {
    const [commandName, argument] = interaction.customId.split("-");
    const command = Bot.commands.get(commandName);
    if (!command) throw new Error(`${commandName} is not a command.`);
    return command.modals && (await command.modals(interaction, argument));
   }

   throw new Error("I am somehow neither a command nor a message component.");
  } catch (error) {
   await useError(error as any, interaction);
  }
 });

 const TOKEN = process.env.NODE_ENV.trim() === "production" ? process.env.TOKEN_PRODUCTION : process.env.TOKEN_DEVELOPMENT;
 await client.login(TOKEN).catch((error: any) => useError(error));
})();

type ExitOptions = { cleanup?: boolean; exit?: boolean };
async function exitHandler(options: ExitOptions, exitCode: number) {
 if (exitCode || exitCode === 0) {
  console.log(`Exit Code: ${exitCode}`);
  process.env.NODE_ENV === "production" && (await Logs.send({ content: "Going offline" }));
 }

 if (options.exit) process.exit();
}

process.on("exit", exitHandler.bind(null, { cleanup: true }));
process.on("SIGINT", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));
process.on("uncaughtException", exitHandler.bind(null, { exit: true }));
