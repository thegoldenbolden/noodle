import { APIButtonComponentWithCustomId, ButtonStyle, ComponentType, PermissionFlagsBits } from "discord-api-types/v10";
import {
 CacheType,
 ChatInputCommandInteraction,
 Collection,
 GuildEmoji,
 Interaction,
 InteractionCollector,
 MessageComponentInteraction,
 WebhookEditMessageOptions,
} from "discord.js";
import { client } from "../../bot";

export function createButtons(
 interaction: any,
 ids: string[] = [],
 useEmojis: boolean = true,
 buttonStyle: number = ButtonStyle.Success
) {
 let buttons: APIButtonComponentWithCustomId[] = [];
 let emojis: any = useEmojis ? getEmoji(ids) : null;
 let customIds: string[] = [];

 ids.forEach((id, i) => {
  let e: any = useEmojis ? emojis.find((emoji: any) => emoji.name == id) : null;
  customIds.push(`${id.toUpperCase()}-${interaction.id}`);

  buttons.push({
   type: ComponentType.Button,
   custom_id: `${id.toUpperCase()}-${interaction.id}`,
   style: buttonStyle,
   label: undefined ?? `${id[0].toUpperCase() + id.substring(1)}`,
   emoji: useEmojis ? { id: e?.id ?? undefined, name: e?.name ?? undefined, animated: e?.animated ?? false } : undefined,
   disabled: ids[0] === "first" && ids[1] === "back" ? i < 2 : false,
  });
 });

 return { buttons, emojis, customIds };
}

export const getEmoji = (emoji: string[]): Collection<string, GuildEmoji> | undefined => {
 const guilds = [
  "891401581650661456",
  "891401535605575781",
  "891819421507674112",
  "891722774593290280",
  "909896674401472532",
  `${process.env.BUDS}`,
 ];

 let emojis: Collection<string, GuildEmoji> | undefined = undefined;

 emojis = client.emojis.cache.filter((e: any) => {
  return guilds.includes(e.guild.id) && emoji.includes(e.name);
 });

 return emojis;
};

type Args = {
 interaction: ChatInputCommandInteraction;
 ephemeral: boolean;
 options: WebhookEditMessageOptions;
 ids: string[];
 collector?: any;
 collect?: (i: MessageComponentInteraction) => Promise<WebhookEditMessageOptions | null | undefined>;
 end?: (i: Collection<string, Interaction<CacheType>>, reason: string) => Promise<WebhookEditMessageOptions>;
};

export const basicCollector = async (args: Args) => {
 const { interaction, ephemeral, options } = args;
 !interaction.deferred && (await interaction.deferReply({ ephemeral }));

 if (!canUseCollector(interaction)) {
  options.components = [];
 }

 const message = await interaction.editReply(options);

 const { ids } = args;
 if (!args.collector) {
  args.collector = {};
 }

 const collector = new InteractionCollector(interaction.client, {
  filter: (i: MessageComponentInteraction) => i.user.id === interaction.user.id && ids.includes(i.customId),
  idle: 20000,
  time: 60000 * 10,
  dispose: true,
  message: message,
  channel: interaction.channel ?? undefined,
  guild: interaction.guild ?? undefined,
  ...args.collector,
 });

 collector.on("collect", async (i: MessageComponentInteraction) => {
  if (collector.ended) return;
  await i.deferUpdate();

  if (args.collect) {
   const options = await args.collect(i);
   if (options) {
    await i.editReply(options);
   }
  }
 });

 collector.on("end", async (i, reason) => {
  if (!canUseCollector(interaction)) return;
  if (["messageDelete", "channelDelete", "guildDelete"].includes(reason)) return;

  let r = null;
  if (args.end) {
   r = await args.end(i, reason);
  }

  options.components?.forEach((c: any) => c.components.forEach((c: any) => (c.disabled = true)));
  await interaction.editReply(r ? r : options);
 });
};

export function canUseCollector(interaction: ChatInputCommandInteraction) {
 return (
  interaction.channel?.isText() &&
  interaction.guild?.members?.me
   ?.permissionsIn(interaction.channel?.id)
   .has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.SendMessages])
 );
}
