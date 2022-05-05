import { ComponentType } from "discord-api-types/v10";
import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionCollector,
  SelectMenuBuilder,
  SelectMenuInteraction,
} from "discord.js";
import { pool } from "../../index";
import { handleError, useAxios } from "../../utils/functions";
import { APIs } from "../../utils/types/database";
import { Command } from "../../utils/types/discord";

export default <Command>{
  name: "youtube",
  cooldown: 5,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const video = interaction.options.getString("video");
    const embed = new EmbedBuilder().setColor("Red").setTitle(`YouTube Search`);

    const { rows }: { rows: APIs[] } = await pool.query(
      `SELECT current_date > apis.reset AS reset, apis.limited FROM apis`
    );

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
      await pool.query(
        `UPDATE apis SET limited = false, reset = current_date WHERE name = 'youtube'`
      );
    }

    const { items } = await useAxios(
      `https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=video&order=viewCount&maxResults=10&q=${video}&key=${process.env.YT_API}`,
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

    const select = new SelectMenuBuilder()
      .setCustomId(`${interaction.id}`)
      .setMaxValues(1)
      .setMinValues(1)
      .setPlaceholder("Which video do you want to see?");

    const description = items.map((data: any, i: number) => {
      select.addOptions([
        {
          default: i === 0,
          label: `${i + 1}. ${data.snippet.title.substring(0, 19)}...`,
          value: `https://www.youtube.com/watch?v=${data.id.videoId}`,
          description:
            data.snippet.description > 1
              ? `${data.snippet.description.substring(0, 50)}..`
              : `${data.snippet.title.substring(0, 50)}..`,
        },
      ]);

      return (
        `${i + 1}. ` +
        `[${data.snippet.title}]` +
        `(https://www.youtube.com/watch?v=${data.id.videoId})`
      );
    });

    embed.setDescription(
      description.length > 0 ? `${description?.join("\n")}` : "No videos found."
    );

    const row = new ActionRowBuilder().setComponents([select]);
    const message = await interaction.editReply({
      embeds: [embed],
      components: [row] as any,
    });

    const collector = new InteractionCollector(interaction.client, {
      message: message,
      componentType: ComponentType.SelectMenu,
      filter: (i: SelectMenuInteraction) =>
        i.user.id === interaction.user.id &&
        i.customId === `select.${interaction.id}`,
      idle: 20000,
    });

    collector.on("collect", async (i) => {
      const value = i.values[0];
      select.options.forEach((option) =>
        option.setDefault(option.data.value === value)
      );

      await i
        .update({
          content: `${value}`,
          embeds: [],
          components: [row] as any,
        })
        .catch((err) => {
          handleError(err, i);
        });
    });

    collector.on("end", async (i) => {
      if (!interaction.channel?.messages.cache.get(message.id)) return;
      const selected = i.first();

      select.setDisabled(true);
      if (!selected) {
        select.setPlaceholder("You didn't choose a video in time..");
        await interaction
          .editReply({
            components: [row] as any,
          })
          .catch((err) => {
            handleError(err, interaction);
          });
      } else {
        selected
          .editReply({
            components: [row] as any,
          })
          .catch((err) => {
            handleError(err, selected);
          });
      }
    });
  },
};
