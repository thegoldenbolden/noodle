import commands, { botOwnerCommands } from "./Commands";
import { client } from "../..";
import BotError from "../classes/Error";

const values = Object.values(commands);

export async function setCommands(includeBotOwnerCommands: boolean = false) {
 try {
  if (process.env.NODE_ENV.trim() === "production") {
   await client.application?.commands.set(includeBotOwnerCommands ? [...values, ...Object.values(botOwnerCommands)] : values);
  } else {
   if (client.isReady()) {
    const guild = client.guilds.cache.get(process.env.PRIVATE_SERVER);
    const cmds = await guild?.commands.set(includeBotOwnerCommands ? [...values, ...Object.values(botOwnerCommands)] : values);
    console.log(cmds);
   }
  }
 } catch (error) {
  console.error(error);
 }
}

export async function resetCommands() {
 try {
  if (process.env.NODE_ENV.trim() == "production") {
   await client.application?.commands.set(values);
  } else {
   if (client.isReady()) {
    const guild = client.guilds.cache.get(process.env.PRIVATE_SERVER);
    await guild?.commands.set([]);
   }
  }
 } catch (error) {
  console.log(error);
 }
}

// Guild Commands
export async function createGuildCommand(commandName: string) {
 if (!client.isReady()) {
  console.error("Client is not ready");
  return;
 }

 const guild = client.guilds.cache.get(process.env.PRIVATE_SERVER);
 if (!guild) throw new Error(`Unable to find server: ${process.env.PRIVATE_SERVER}`);
 const command = commands[commandName] ?? botOwnerCommands[commandName];
 if (!command) throw new BotError({ message: "Unable to find command" });

 const cmd = await guild.commands.create(command);
 console.log(`${cmd.id} - ${cmd.name}`);
}

export async function editGuildCommand(id: string, commandName: string) {
 if (!client.isReady()) {
  console.error("Client is not ready");
  return;
 }

 const guild = client.guilds.cache.get(process.env.PRIVATE_SERVER);
 if (!guild) throw new Error(`Unable to find server: ${process.env.PRIVATE_SERVER}`);

 const command = commands[commandName] ?? botOwnerCommands[commandName];
 if (!command) throw new BotError({ message: "Unable to find command" });

 const cmd = await guild.commands.edit(id, command);
 console.log(`${cmd.id} - ${cmd.name}`);
}

export async function deleteGuildCommand(commandId: string) {
 const guild = client.guilds.cache.get(process.env.PRIVATE_SERVER);
 if (!guild) throw new Error(`Unable to find server: ${process.env.PRIVATE_SERVER}`);
 await guild.commands.delete(commandId);
}

// Global Commands
export async function createGlobalCommand(commandName: string) {
 if (!client.isReady()) {
  console.error("Client is not ready");
  return;
 }

 const command = commands[commandName];
 if (!command) throw new BotError({ message: "Unable to find command" });
 const cmd = await client.application.commands.create(command);
 console.log(`${cmd.id} - ${cmd.name}`);
}

export async function editGlobalCommand(id: string, commandName: string) {
 if (!client.isReady()) {
  console.error("Client is not ready");
  return;
 }

 const command = commands[commandName];
 if (!command) throw new BotError({ message: "Unable to find command" });
 const cmd = await client.application.commands.edit(id, command);
 console.log(`${cmd.id} - ${cmd.name}`);
}

export async function deleteGlobalCommand(commandId: string) {
 await client.application?.commands.delete(commandId);
}
