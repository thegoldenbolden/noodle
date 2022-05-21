import {
  APIButtonComponentWithCustomId,
  APIEmbed,
  ButtonStyle,
} from "discord-api-types/v10";
import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  ComponentType,
  Formatters,
  InteractionCollector,
  MessageComponentInteraction,
  SelectMenuComponentData,
  SelectMenuComponentOptionData,
  SelectMenuInteraction,
} from "discord.js";
import { pool } from "../../index";
import { BotError, UserError } from "../../utils/classes/Error";
import { createButtons } from "../../utils/functions/discord";
import {
  handleError,
  splitArray,
  useAxios,
} from "../../utils/functions/helpers";
import { APIs } from "../../utils/typings/database";
import { Category, Command } from "../../utils/typings/discord";

export default <Command>{
  name: "youtube",
  cooldown: 10,
  category: Category.Miscellaneous,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const video = interaction.options
      .getString("video", true)
      .replaceAll(" ", "+");
    const youtubeUrl = "https://www.youtube.com/watch?v=";
    const embed: APIEmbed = {
      color: 0xff0000,
      author: {
        name: `YouTube Buddy`,
        url: "https://youtube.com",
      },
    };

    const { rows }: { rows: APIs[] } = await pool.query(
      `SELECT current_date > apis.reset AS reset, apis.limited FROM apis`
    );

    if (!rows) throw new BotError("An error occurred.");
    if (rows[0].limited)
      throw new UserError("Please wait until tomorrow to use this command.y");
    rows[0].reset &&
      (await pool.query(
        `UPDATE apis SET limited = false, reset = current_date WHERE name = 'youtube'`
      ));

    const url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=video&order=viewCount&maxResults=50&q=${video}&key=${process.env.YT_API}`;
    const { items } = await useAxios(url, interaction, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).catch((err) => {
      handleError(err, interaction);
      console.log(err.data.error);
      pool.query(`UPDATE apis SET limited = true WHERE name = 'youtube'`);
      return { items: [] };
    });

    if (!items[0])
      throw new BotError(
        "We wished, we wished with all our heart and got nothing."
      );
    let page = 0;

    const menu: SelectMenuComponentData = {
      type: ComponentType.SelectMenu,
      customId: `youtube.${interaction.id}`,
      maxValues: 1,
      minValues: 1,
      placeholder: "Which video do you want to see?",
      options: [],
    };

    const array = splitArray(items, 5, (e: any, i: number) => ({
      title: e.snippet.title,
      id: e.id.videoId,
      description: e.snippet.description,
      channel: e.snippet.channelTitle,
      publish: e.snippet.publishedAt,
    }));

    menu.options = setOptions(0);

    const components: any = [
      { type: ComponentType.ActionRow, components: [menu] },
    ];

    let buttons: APIButtonComponentWithCustomId[];
    if (array.length > 1) {
      const { buttons: btns } = createButtons(
        interaction,
        ["back", "next"],
        true,
        ButtonStyle.Danger
      );
      buttons = btns as APIButtonComponentWithCustomId[];
      components.push({ type: ComponentType.ActionRow, components: buttons });
    }

    await interaction.editReply({
      embeds: [embed],
      components: components,
    });

    const collector = new InteractionCollector(interaction.client, {
      filter: (i: SelectMenuInteraction | ButtonInteraction) =>
        i.user.id === interaction.user.id &&
        [
          `youtube.${interaction.id}`,
          `back.${interaction.id}`,
          `next.${interaction.id}`,
        ].includes(i.customId),
      idle: 45000,
    });

    let clickedMenu = false;
    collector.on("collect", async (i: MessageComponentInteraction) => {
      if (collector.ended) return;
      let content: string | undefined = undefined;

      if (i.isButton()) {
        switch (i.customId) {
          case `back.${interaction.id}`:
            if (clickedMenu) {
              buttons[1].disabled = false;
              clickedMenu = false;
            } else {
              page = page == 0 ? array.length - 1 : page - 1;
            }
            break;
          case `next.${interaction.id}`:
            page = page == array.length - 1 ? 0 : page + 1;
        }

        menu.options = setOptions(page);
      }

      if (i.isSelectMenu()) {
        clickedMenu = true;
        buttons[1].disabled = true;
        const value = i.values[0];
        menu.options!.forEach(
          (option) => (option.default = option.value === value)
        );
        content = youtubeUrl + i.values[0];
      }

      await i.update({
        content,
        embeds: clickedMenu ? [] : [embed],
        components: components,
      });
    });

    collector.on("end", (i, r) => {
      if (
        [
          "messageDelete",
          "channelDelete",
          "guildDelete",
          "threadDelete",
        ].includes(r)
      )
        return;

      if (!i.first()) {
        if (buttons[0] && buttons[1]) {
          buttons[0].disabled = true;
          buttons[1].disabled = true;
        }

        menu.placeholder = "You didn't choose a video in time.";
        interaction.editReply({
          components: components,
        });
      }
    });

    function setOptions(page: number = 0): SelectMenuComponentOptionData[] {
      embed.fields = [];

      return array[page].map((video: any) => {
        let description = video.channel
          ? `\*\*\_${
              video.channel.substring(0, 20).trim() +
              (video.channel.length > 20 ? "..." : "") +
              ""
            }\_\*\*: `
          : "No Title";
        description += video.description
          ? video.description.substring(0, 200).trim() +
            (video.description.length > 200 ? "..." : "")
          : "No description available";

        embed.fields!.push({
          name: video.title
            ? video.title.substring(0, 50).trim() +
              (video.title.length > 50 ? "..." : "")
            : "No Video Title",
          value: `
										${
                      video.publish
                        ? Formatters.time(
                            new Date(video.publish),
                            Formatters.TimestampStyles.LongDateTime
                          )
                        : ""
                    } [Go to video](${youtubeUrl}${video.id})
										${description}`,
        });

        return {
          label: video.title
            ? video.title.substring(0, 50) +
              (video.title?.length > 50 ? "..." : "")
            : "No Title",
          value: video.id,
          description: video.description
            ? video.description.substring(0, 80) +
              (video.description.length > 80 ? "..." : "")
            : "No description available",
        };
      });
    }
  },
};
