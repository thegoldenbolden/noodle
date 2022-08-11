import { ApplicationCommandOptionType } from "discord.js";
import { client } from "../..";
import ordinal from "../ordinal";
import { commands } from "./createCommands";

export async function setCommands(forceDev: boolean = false) {
 try {
  if (process.env.NODE_ENV === "production" || forceDev) {
   await client.application?.commands.set(commands);
  } else {
   if (client.isReady()) {
    const guild = client.guilds.cache.get(process.env.BUDS_SERVER);
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
    const guild = client.guilds.cache.get(process.env.BUDS_SERVER);
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
  console.log(cmds);
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

export function createBotMasterGuildOnlyCommands() {
 client.guilds.cache.get(process.env.NOODLE_SERVER)?.commands.create({
  name: "review",
  description: "review bot master tings",
  dmPermission: false,
  defaultMemberPermissions: "Administrator",
  options: [
   {
    name: "submissions",
    description: "review submissions",
    type: ApplicationCommandOptionType.Subcommand,
    options: [
     {
      name: "category",
      type: ApplicationCommandOptionType.String,
      required: true,
      description: "category",
      choices: [{ name: "Versus", value: "versus" }],
     },
    ],
   },
  ],
 });
}

export function createDanBallGuildOnlyCommands() {
 client.guilds.cache.get("250066523346042881")?.commands.create({
  name: "unpin",
  description: "Send pinned messages elswhere",
  dmPermission: false,
  defaultMemberPermissions: "Administrator",
  options: [
   {
    name: "channel",
    description: "channel to send to",
    type: ApplicationCommandOptionType.Channel,
    required: true,
   },
  ],
 });
}

type Props = { data: any; required: number; length: number };
export function createGenericOptions({ data, required, length }: Props) {
 const array = [];
 for (let i = 0; i < length; i++) {
  array.push({ ...data, name: `${i + 1}${ordinal(i + 1)}`, required: i < required });
 }
 return array;
}
