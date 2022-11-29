import {
 APIButtonComponentWithCustomId,
 APIMessageComponentEmoji,
 ButtonStyle,
 ChannelType,
 ComponentType,
} from "discord-api-types/v10";
import {
 ButtonComponent,
 ButtonComponentData,
 CacheType,
 ChatInputCommandInteraction,
 Collection,
 Interaction,
 InteractionButtonComponentData,
 InteractionCollector,
 MessageComponentInteraction,
 WebhookEditMessageOptions,
} from "discord.js";

export const e: { [key: string]: APIMessageComponentEmoji } = {
 shuffle: {
  name: "shuffle",
  animated: false,
  id: "973195576994852864",
 },
 back: {
  name: "back",
  animated: false,
  id: "966205161322188850",
 },
 next: {
  name: "next",
  animated: false,
  id: "966205161439637514",
 },
 first: {
  name: "first",
  animated: false,
  id: "966205161414467594",
 },
 last: {
  name: "last",
  animated: false,
  id: "966205161452216360",
 },
 load: {
  name: "load",
  animated: false,
  id: "970952982977990696",
 },
 previous: {
  name: "previous",
  animated: false,
  id: "971045834059829288",
 },
};

type CreateButtonResponse = { buttons: InteractionButtonComponentData[]; emojis: string[]; customIds: string[] };
type CreateButton = (interaction: any, ids: string[], emojis: string[], style?: number) => CreateButtonResponse;
export const createButtons: CreateButton = (interaction, ids, emojis, style = ButtonStyle.Secondary) => {
 let buttons: InteractionButtonComponentData[] = [];
 let customIds: string[] = [];

 ids.forEach((id, i) => {
  customIds.push(`${id.toUpperCase()}-${interaction.id}`);

  buttons.push({
   type: ComponentType.Button,
   customId: `${id.toUpperCase()}-${interaction.id}`,
   style: style,
   label: undefined ?? `${id[0].toUpperCase() + id.substring(1)}`,
   emoji: e[emojis[i]] ?? undefined,
   disabled: ids[0] === "first" && ids[1] === "back" ? i < 2 : false,
  });
 });

 return { buttons, emojis, customIds };
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

  let r: any;
  if (args.end) {
   r = await args.end(i, reason);
  }

  options.components?.forEach((c: any) => c.components.forEach((c: any) => (c.disabled = true)));
  await interaction.editReply(r ? r : options);
 });
};

export function canUseCollector(interaction: ChatInputCommandInteraction) {
 return (
  interaction.channel?.type === ChannelType.GuildText &&
  interaction.guild?.members?.me?.permissionsIn(interaction.channel?.id).has(["ViewChannel", "ManageMessages", "SendMessages"])
 );
}
