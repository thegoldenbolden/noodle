import type { Bot as TBot, Command } from "./types";
import { OpenAI } from "openai";
import { readdirSync } from "fs";
import Kitsu from "kitsu";

import {
 ActivityType,
 ChannelType,
 Client,
 Collection,
 Partials,
 WebhookClient,
} from "discord.js";

import { checkCooldown, checkPermissions } from "./lib/permissions";
import { setCommands } from "./lib/register";
import { log } from "./lib/logger";

export const client = new Client({
 partials: [
  Partials.Channel,
  Partials.GuildMember,
  Partials.Message,
  Partials.Reaction,
  Partials.User,
 ],
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

export const Logs = new WebhookClient({
 id: `${process.env.LOGGER_ID}`,
 token: `${process.env.LOGGER_TOKEN}`,
});

export const Bot: TBot = {
 commands: new Collection(),
 cooldowns: new Collection(),
 modals: new Collection(),
 openai: new Collection(),
};

export const KitsuApi = new Kitsu();

export const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY,
 organization: process.env.OPENAI_ORGANIZATION_ID,
});

(async () => {
 const register = async (name: "interactions" | "events") => {
  console.group(`Register ${name}`);
  const categories = readdirSync(`./dist/${name}`);

  for (const category in categories) {
   const files = readdirSync(`./dist/${name}/${categories[category]}`).filter(
    (file) => file.endsWith(".js")
   );

   for (const file of files) {
    const { default: command } = await import(
     `./${name}/${categories[category]}/${file}`
    );

    switch (name) {
     case "interactions":
      console.log(`Added command ${command.name}`);
      command?.name && Bot.commands.set(command.name, command);
      break;
     case "events":
      console.log(`Listening for ${command.name} event`);
      if (command.once) {
       client.once(command.name, command.execute.bind(null));
      } else {
       client.on(command.name, command.execute.bind(null));
      }
      break;
    }
   }
  }

  console.groupEnd();
 };

 await register("interactions");

 client.once("ready", async (client) => {
  console.log(`${client.user.tag} Ready!`);
  Logs.send("I'm online.");

  const registerArg = process.argv.find((v) => v === "--register");
  if (registerArg) {
   await setCommands();
  }
 });

 client.on("interactionCreate", async (interaction) => {
  if (
   interaction.channel?.type !== ChannelType.DM &&
   !interaction.guild?.available
  )
   return;

  try {
   if (
    interaction.channel?.type !== ChannelType.DM &&
    !interaction.guild?.available
   )
    return;

   if (interaction.isCommand()) {
    let command: Command | undefined;

    if (interaction.isContextMenuCommand()) {
     command = Bot.commands.find((command) =>
      command.contexts?.includes(interaction.commandName)
     );
    } else {
     command = Bot.commands.get(interaction.commandName);
    }

    if (!command) {
     throw new Error(`${interaction.commandName} is not a command.`);
    }

    if (interaction.isAutocomplete()) {
     command.autocomplete && (await command.autocomplete(interaction));
     return;
    }

    checkCooldown(interaction, command);
    checkPermissions(interaction.memberPermissions, command.permissions);
    await command.execute(interaction);
    return;
   }

   if (interaction.isMessageComponent()) {
    const [commandName, argument] = interaction.customId.split("-");
    const command = Bot.commands.get(commandName);
    if (!command) {
     throw new Error(`${commandName} is not a command.`);
    }

    if (interaction.isButton()) {
     return command.buttons && (await command.buttons(interaction, argument));
    }
    if (interaction.isAnySelectMenu()) {
     return command.menu && (await command.menu(interaction, argument));
    }
   }

   if (interaction.isModalSubmit()) {
    const [commandName, argument] = interaction.customId.split("-");
    const command = Bot.commands.get(commandName);
    if (!command) {
     throw new Error(`${commandName} is not a command.`);
    }

    command.modals && (await command.modals(interaction, argument));
    return;
   }

   throw new Error("I am somehow neither a command nor a message component.");
  } catch (error) {
   await log(error, interaction);
  }
 });

 const TOKEN =
  process.env.NODE_ENV?.trim() === "production"
   ? process.env.TOKEN_PRODUCTION
   : process.env.TOKEN_DEVELOPMENT;

 await client.login(TOKEN).catch((error: any) => log(error));
})();

type ExitOptions = { cleanup?: boolean; exit?: boolean };
async function exitHandler(options: ExitOptions, exitCode: number) {
 if (exitCode || exitCode === 0) {
  console.log(`Exit Code: ${exitCode}`);
  process.env.NODE_ENV === "production" &&
   (await Logs.send({ content: "Going offline" }));
 }

 if (options.exit) process.exit();
}

process.on("exit", exitHandler.bind(null, { cleanup: true }));
process.on("SIGINT", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));
process.on("uncaughtException", exitHandler.bind(null, { exit: true }));
