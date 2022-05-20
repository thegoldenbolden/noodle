import { APIEmbed, PermissionFlagsBits } from "discord-api-types/v10";
import {
  ChatInputCommandInteraction,
  ComponentType,
  InteractionCollector,
  SelectMenuComponentData,
  SelectMenuInteraction,
} from "discord.js";
import { pool } from "../../index";
import { getEmoji } from "../../utils/functions/discord";
import { handleError, useAxios } from "../../utils/functions/helpers";
import { APIs } from "../../utils/typings/database";
import { Category, Command } from "../../utils/typings/discord";

export default <Command>{
  name: "youtube",
  cooldown: 10,
  category: Category.Miscellaneous,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const video = interaction.options.getString("video", true);
    const youtube = getEmoji(["youtube"])?.first();
    const embed: APIEmbed = {
      color: 0xff0000,
      title: `${youtube} YouTube Buddy`,
    };

    const { rows }: { rows: APIs[] } = await pool.query(`SELECT current_date > apis.reset AS reset, apis.limited FROM apis`);

    if (!rows) {
      return await interaction.editReply({
        content: `An error occurred`,
      });
    }

    if (rows[0].limited) {
      return await interaction.editReply({
        content: `Please wait until tomorrow to use this command.`,
      });
    }

    if (rows[0].reset) {
      await pool.query(`UPDATE apis SET limited = false, reset = current_date WHERE name = 'youtube'`);
    }

    const { items } = await useAxios(
      `https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=video&order=viewCount&maxResults=10&q=${video}&key=${process.env.YT_API}`,
      interaction,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).catch((err) => {
      handleError(err, interaction);
      console.log(err.data.error);
      pool.query(`UPDATE apis SET limited = true WHERE name = 'youtube'`);
      return { items: [] };
    });

    if (!items[0]) {
      return await interaction.editReply("I was unable to find a video. D:");
    }

    const select: SelectMenuComponentData = {
      type: ComponentType.SelectMenu,
      customId: `youtube.${interaction.id}`,
      maxValues: 1,
      minValues: 1,
      placeholder: "Which video do you want to see?",
      options: [],
    };

    const description = items.map((data: any, i: number) => {
      select.options!.push({
        default: i === 0,
        label: `${i + 1}. ${data.snippet.title.substring(0, 19)}...`,
        value: `${data.id.videoId}`,
        description:
          data.snippet.description > 1
            ? `${data.snippet.description.substring(0, 50)}..`
            : `${data.snippet.title.substring(0, 50)}..`,
      });

      return `${i + 1}. ` + `[${data.snippet.title}]` + `(https://www.youtube.com/watch?v=${data.id.videoId})`;
    });

    embed.description = description.length > 0 ? `${description?.join("\n")}` : "No videos found.";

    const row = {
      type: ComponentType.ActionRow,
      components: [select],
    } as any;

    const canUseCollector =
      interaction.channel?.isText() &&
      interaction.guild?.members?.me
        ?.permissionsIn(interaction.channel?.id)
        .has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.SendMessages]);

    const message = await interaction.editReply({
      content: canUseCollector ? undefined : `${select.options![0].value}`,
      embeds: canUseCollector ? [embed] : [],
      components: canUseCollector ? ([row] as any) : [],
    });

    if (!canUseCollector) return;

    const collector = new InteractionCollector(interaction.client, {
      message: message,
      componentType: ComponentType.SelectMenu,
      filter: (i: SelectMenuInteraction) => i.user.id === interaction.user.id && i.customId === `youtube.${interaction.id}`,
      idle: 20000,
    });

    collector.on("collect", async (i) => {
      if (collector.ended) return;

      const value = i.values[0];
      select.options!.forEach((option) => (option.default = option.value === value));

      await i
        .update({
          content: `https://www.youtube.com/watch?v=${value}`,
          embeds: [],
          components: [row] as any,
        })
        .catch((err) => {
          handleError(err, i);
        });
    });

    collector.on("end", async (i, reason) => {
      if (["messageDelete", "channelDelete", "guildDelete"].includes(reason)) return;
      if (!i.first()) {
        select.disabled = true;
        select.placeholder = "You didn't choose a video in time..";
        await interaction
          .editReply({
            components: [row] as any,
          })
          .catch((err: any) => {
            handleError(err, interaction);
          });
      }
    });
  },
};
