import { APIRole, ButtonStyle, ComponentType } from "discord-api-types/v10";
import { ButtonComponentData, ChatInputCommandInteraction, Collection, MessageCollector, Role, SelectMenuComponentData, TextChannel, Util, WebhookEditMessageOptions } from "discord.js";
import { error } from "../../../index";
import { UserError } from "../../../utils/classes/Error";
import { addObjectToDbArray } from "../../../utils/functions/database";
import { handleError } from "../../../utils/functions/helpers";
import { Autorole } from "../../../utils/typings/database";
import { checkSend } from "../autorole";

export type I = ChatInputCommandInteraction;
export type R = Collection<string, Role | APIRole | null> | undefined;
export type C = TextChannel;
export type Emojis = { success: any[]; failed: any[] } | null;
export type Type = "reaction" | "menu" | "button";
type E = any;
type Params = (i: I, tt: string, t: Type, c: C, r: R) => void;

export const run: Params = async (interaction, title, type, channel, roles) => {
  const response = await CollectMessage(interaction, {
    message: "Please enter a message for the autorole. After 5 minutes, we will no longer wait for a message.\nType \*\*cancel\*\* to quit.",
    type: "msg",
  });

  if (response.error) throw new UserError(response.error);

  const opts: WebhookEditMessageOptions = {
    content: response.message ?? undefined,
    embeds: [],
    components: [],
  };

  const parsedEmojis: Emojis = type === "menu" ? null : await parseEmojis(interaction, roles, type);
  if (parsedEmojis?.failed?.[0]) {
    throw new UserError(`We cannot use the following emojis: ${parsedEmojis.failed.join(", ")}`);
  }

  let btns: any, emojis: any;
  switch (type) {
    case "menu":
      // ComponentType.ActionRow = 1;
      opts.components = [{ type: 1, components: [menu(roles)] }];
      break;
    case "reaction":
      emojis = parsedEmojis?.success;
      break;
    case "button":
      btns = createButtons(parsedEmojis?.success, roles);
      console.log(btns);
      opts.components = splitComponentsIntoRows(btns);
      break;
  }

  checkSend(interaction, channel, type);
  const msg = await channel.send(opts);

  const BASE_AUTOROLE: Autorole = {
    type,
    message_title: title,
    message_id: msg.id,
    channel_id: channel.id,
    role_ids: (roles?.map((role) => role?.id) as string[]) ?? [],
    created: Date.now(),
    created_by: `${interaction.user.username ?? "No username"}#${interaction.user.discriminator ?? "No tag"}`,
  };

  const QUERY_PARAMS = {
    discord_id: `${interaction.guildId}`,
    table: "guilds" as "guilds" | "users",
    column: "autoroles",
  };

  if (type == "reaction" && parsedEmojis) {
    emojis.forEach(async (e: any, i: number) => {
      const timeout = setTimeout(async () => {
        try {
          await msg.react(e);
          clearTimeout(timeout);

          if (i === emojis.length - 1) {
            await addObjectToDbArray({
              ...QUERY_PARAMS,
              updateValue: {
                ...BASE_AUTOROLE,
                emoji_ids: emojis.map((e: any) => e?.id || e?.name),
              },
            });
          }
        } catch (err) {
          handleError(err, interaction);
        }
      }, 2000);
    });
    return;
  }

  if (type == "menu") {
    await addObjectToDbArray({
      ...QUERY_PARAMS,
      updateValue: BASE_AUTOROLE,
    });
    return;
  }

  await addObjectToDbArray({
    ...QUERY_PARAMS,
    updateValue: BASE_AUTOROLE,
  });
};

type CollectOptions = {
  message: string;
  type: "msg" | "emoji";
  collect?: any;
  roles?: R;
  x?: Type;
};

export async function parseEmojis(interaction: I, roles: R, type: Type): Promise<{ success: any[]; failed: any[] }> {
  if (!roles || roles.size === 0) throw new UserError(`We are unable to use the roles provided.`);
  const getEmotes = (emotes: string[]) => {
    let failed: any[] = [],
      success: any[] = [];

    emotes.forEach((e) => {
      const a = Util.parseEmoji(e);
      if (!a?.name && !a?.id) {
        failed.push(e);
        return;
      }

      success.push(a);
    });

    return { failed, success };
  };

  let message = `Please enter the emojis (${roles.size}) for the following roles: `;
  message += roles.map((role) => `\*\*${role?.name ?? "No Role Name"}\*\*`).join(", ");
  message += type == "button" ? ".\nType \*\*cancel\*\* to have buttons without emojis." : ".";

  const response = await CollectMessage(interaction, {
    message,
    type: "emoji",
    x: type,
    roles: roles,
  });

  if (response.error) throw new UserError(response.error);
  if (response.message.includes("cancel")) return { success: [], failed: [] };

  const e = getEmotes([...new Set([...response.message.split(" ")])]);
  return { success: e.success, failed: e.failed };
}

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

        if (opts.x != "reaction" && msg.content.toLowerCase().trim() == "cancel") {
          collector.stop("cancel");
          return;
        }

        if (opts.type === "msg") {
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
        }

        if (opts.type == "emoji") {
          const emojis = [...new Set([...msg.content.split(" ")])];
          const unusable = emojis.some((e) => {
												if (/\p{Emoji}/gu.test(e) === false) return true;
            let k = Util.parseEmoji(e);
            if (!k) return true;
            return k.id && !interaction.guild?.emojis.cache.get(`${k.id}`);
          });

          if (unusable) {
            attempts -= 1;
            collector.resetTimer();
            collector.handleDispose(msg);

            await interaction.followUp({
              content: `We can only use unicode emojis and emojis that belong to this server.\n${attempts} attempts remaining.`,
              ephemeral: true,
            });
            return;
          }

          if (opts.x == "reaction" && emojis.length > 20) {
            attempts -= 1;
            collector.resetTimer();
            collector.handleDispose(msg);
            await interaction.followUp({
              content: `We received ${emojis.length} emojis when only 20 reactions can be present on a message.\n${attempts} attempts remaining.`,
              ephemeral: true,
            });
            return;
          }

          if (opts.roles && emojis.length !== opts.roles.size) {
            attempts -= 1;
            collector.resetTimer();
            collector.handleDispose(msg);
            let s = `We received ${emojis.length} emojis when there are ${opts.roles.size} roles.\n${attempts} attempts remaining.`;
            await interaction.followUp({ content: s, ephemeral: true });
            return;
          }
        }

        collector.stop("fini");
      });

      collector.on("end", async (messages, reason) => {
        console.log(reason);
        if (["messageDelete", "channelDelete", "guildDelete", "threadDelete"].includes(reason)) return;
        if (reason === "time") return resolve({ done: true, error: "Time ran out :(" });
        if (reason === "attempts") return resolve({ done: true, error: "No attempts remaining :'(" });
        if (reason === "cancel" && opts.x !== "button") return resolve({ done: true, error: "Oh.. okay 😭" });

        const message = messages.first()?.content;
        if (!message) return resolve({ done: true, error: "We were unable to use the message. o:" });
        return resolve({ done: true, message });
      });
    } catch (err: any) {
      error.send(err.stack);
      return reject({ done: true, error: "An error occurred. D:" });
    }
  });
}

export function menu(roles: R) {
  if (!roles || roles.size === 0) throw new UserError(`We are unable to use the roles provided for the menu.`);
  return {
    type: ComponentType.SelectMenu,
    customId: `AUTOROLE`,
    placeholder: `Please select a role(s)`,
    maxValues: roles?.size ?? 25,
    minValues: 0,
    options: roles.map((role) => {
      return {
        label: role?.name ?? "No Role Name",
        value: role?.id ?? "No Role Id",
        emoji: (role as Role)?.unicodeEmoji ?? undefined,
      };
    }),
  } as SelectMenuComponentData;
}

export function createButtons(emojis: E, roles: R) {
  if (!roles || roles.size === 0) throw new UserError("We couldn't use any roles for this autorole.");
  const buttons: ButtonComponentData[] = [];

  let i = 0;
  roles.forEach((role) => {
    buttons.push({
      type: ComponentType.Button,
      customId: `AUTOROLE-${role?.id}`,
      label: `${role?.name.substring(0, 50).trim() ?? "No Role Name"}${role?.name && role.name.length > 50 ? "..." : ""}`,
      style: ButtonStyle.Secondary,
      emoji: emojis[i] ?? undefined,
    });
    i += 1;
  });

  return buttons;
}

export function splitComponentsIntoRows(components: any[]) {
  const rows: any[] = [];
  let row: any[] = [];

  components.forEach((c, i) => {
    row.push(c);

    if (row.length === 5 || i === components.length - 1) {
      rows.push({
        type: ComponentType.ActionRow,
        components: row,
      });

      row = [];
      return;
    }
  });

  return rows;
}
