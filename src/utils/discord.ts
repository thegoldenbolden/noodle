import { ButtonStyle, ComponentType, PermissionFlagsBits } from "discord-api-types/v10";
import {
  ButtonComponentData,
  CacheType,
  ChatInputCommandInteraction,
  Collection,
  GuildEmoji,
  Interaction,
  InteractionCollector,
  MessageComponentInteraction,
  WebhookEditMessageOptions,
} from "discord.js";
import { client } from "../bot";

type PartialEmoji = {
  name: string | undefined;
  id: string | undefined;
};

enum Label {
  first = "First",
  back = "Back",
  next = "Next",
  last = "Last",
  load = "Load",
  previous = "Previous",
}

export const createPaginationButtons = (
  interaction: { id: string },
  emojis?: Collection<string, GuildEmoji>,
  ids?: string[]
) => {
  ids = ids ?? ["first", "back", "next", "last"];

  const buttons: ButtonComponentData[] = [];
  ids.forEach((id, i) => {
    const emoji = emojis?.find((e) => e.name === id);
    buttons.push({
      type: ComponentType.Button,
      customId: `${id}.${interaction.id}`,
      style: ButtonStyle.Success,
      emoji: { id: emoji?.id, name: emoji?.name ?? undefined },
      label: !emoji ? undefined : `${id[0].toUpperCase() + id.substring(1)}`,
      disabled: i < 2,
    });
  });

  return buttons;
};

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
  collect?: (i: MessageComponentInteraction) => Promise<WebhookEditMessageOptions>;
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
      await i.editReply(options);
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
    interaction.guild?.me
      ?.permissionsIn(interaction.channel?.id)
      .has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.SendMessages])
  );
}
