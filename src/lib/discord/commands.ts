import { ApplicationCommandOptionType } from "discord.js";
import { client } from "../..";
import { commands } from "./createCommands";

export async function setCommands(forceDev: boolean = false) {
 try {
  if (process.env.NODE_ENV === "production" || forceDev) {
   await client.application?.commands.set(commands);
  } else {
   if (client.isReady()) {
    const guild = client.guilds.cache.get(process.env.DEV_SERVER);
    await guild?.commands.set(commands);
   }
  }
 } catch (e) {
  console.log(e);
 }
}

export async function resetCommands() {
 try {
  if (process.env.NODE_ENV == "production") {
   await client.application?.commands.set(commands);
  } else {
   if (client.isReady()) {
    const guild = client.guilds.cache.get(process.env.DEV_SERVER);
    await guild?.commands.set([]);
   }
  }
 } catch (e) {
  console.log(e);
 }
}

export async function getCommandIds() {
 try {
  const cmds = (await client.application?.commands.fetch())?.map((command) => `${command.name}: ${command.id}`);
 } catch (e) {
  console.log(e);
 }
}

export async function editCommand() {
 try {
 } catch (e) {
  console.log(e);
 }
}

export async function createBotMasterGuildOnlyCommands() {
 await client.guilds.cache.get(process.env.DEV_SERVER)?.commands.create({
  name: "test",
  description: "testing",
  dmPermission: false,
  defaultMemberPermissions: "Administrator",
 });
}
