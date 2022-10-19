import { Client } from "discord.js";
import { Logs } from "../..";
import { useLog } from "../../lib/log";

export default {
 name: "ready",
 once: true,
 async execute(client: Client) {
  useLog({ name: "Ready", callback: () => Logs.send("I'm online.") });
 },
};
