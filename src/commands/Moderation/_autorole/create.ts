import { ComponentType } from "discord-api-types/v10";
import {
 MessageCollector,
 MessageCreateOptions,
 Role,
 SelectMenuComponentData,
 TextChannel,
 WebhookEditMessageOptions,
} from "discord.js";
import { checkSend } from ".";
import { Errors } from "../../../index";
import BotError from "../../../lib/classes/Error";
import { BotGuild, InteractionIds } from "../../../types";
import { I, R } from "./add";

export type C = TextChannel;
type Params = (i: I, title: string, c: C, r: R, g: BotGuild) => void;
export const run: Params = async (interaction, title, channel, roles, guild) => {
 const response = await CollectMessage(interaction, {
  message:
   "Please enter a message for the autorole. After 5 minutes, we will no longer wait for a message.\nType **cancel** to quit.",
 });

 if (response.error) throw new BotError({ message: response.error });

 const opts: MessageCreateOptions = {
  content: response.message ?? undefined,
  embeds: [],
  components: [],
 };

 opts.components = [{ type: 1, components: [menu(roles)] }];
 checkSend(interaction, channel);
 await channel.send(opts);

 if (!interaction.guildId) throw new BotError({ message: "We were unable to find this guild." });
};

type CollectOptions = { message: string; collect?: any; roles?: R };

export function CollectMessage(interaction: I, opts: CollectOptions): Promise<any> {
 return new Promise(async (resolve, reject) => {
  if (!interaction.channel) {
   return reject({ error: true, message: "We were unable to use this channel to collect messages." });
  }

  let attempts = 5;
  await interaction.followUp({ ephemeral: true, content: opts.message });

  const collector = new MessageCollector(interaction.channel, {
   filter: (msg) => msg.author.id === interaction.user.id,
   time: 60000 * 5,
   dispose: true,
   max: 5,
  });

  try {
   collector.on("collect", async (msg) => {
    if (collector.ended) return;

    if (attempts <= 0) {
     collector.stop("attempts");
     return;
    }

    if (msg.content.toLowerCase().trim() == "cancel") {
     collector.stop("cancel");
     return;
    }

    if (msg.content?.trim().replace(/\s+/g, "").length <= 0) {
     attempts -= 1;
     collector.resetTimer();
     collector.handleDispose(msg);
     await interaction.followUp({
      ephemeral: true,
      content: `${opts.message}\nPlease enter a message containing at least one character. ${attempts} attempts remaining.`,
     });
     return;
    }
    collector.stop("fini");
   });

   collector.on("end", async (messages, reason) => {
    if (!["time", "fini", "cancel", "attempts"].includes(reason)) return;
    if (reason === "time") return resolve({ done: true, error: "Time ran out :(" });
    if (reason === "attempts") return resolve({ done: true, error: "No attempts remaining :'(" });
    if (reason === "cancel") return resolve({ done: true, error: "Oh.. okay 😭" });
    const m = (messages as any).first()?.content;
    if (!m) return resolve({ done: true, error: "We were unable to use the message. o:" });
    return resolve({ done: true, message: m });
   });
  } catch (err: any) {
   Errors.send(err.stack);
   return reject({ done: true, error: "An error occurred. D:" });
  }
 });
}

export function menu(roles: R) {
 if (!roles || roles.size === 0) throw new BotError({ message: `We are unable to use the roles provided for the menu.` });
 return {
  type: ComponentType.SelectMenu,
  customId: InteractionIds.Autorole,
  placeholder: `Please select a role(s)`,
  maxValues: roles?.size ?? 25,
  minValues: 0,
  options: roles.map((role) => {
   return {
    label: role?.name ?? "Unknown Role Name",
    value: role?.id ?? "Unknown Role Id",
    emoji: (role as Role)?.unicodeEmoji ?? undefined,
   };
  }),
 } as SelectMenuComponentData;
}
