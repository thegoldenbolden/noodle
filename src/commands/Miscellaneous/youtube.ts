import {
 APIButtonComponentWithCustomId,
 APIEmbed,
 ButtonStyle,
 ComponentType,
 EmbedField,
 MessageComponentInteraction,
 SelectMenuComponentData,
 SelectMenuComponentOptionData,
 time,
 TimestampStyles,
} from "discord.js";
import { decode } from "html-entities";
import useAxios from "../../lib/axios";
import BotError from "../../lib/classes/Error";
import { createButtons } from "../../lib/discord/collectors";
import { useError } from "../../lib/log";
import split from "../../lib/split";
import { Command } from "../../types";

// const YT = prisma.api.findFirst({ where: { name: "youtube" } });
export default {
 name: "youtube",
 categories: ["Miscellaneous"],
 cooldown: 10,
 async execute(interaction) {
  await interaction.deferReply();
  const video = interaction.options.getString("video", true).replaceAll(" ", "+");
  const youtubeUrl = "https://www.youtube.com/watch?v=";
  const embed: APIEmbed = { color: 0xff0000, author: { name: `YouTube` } };

  const {
   data: { items },
  } = await useAxios({
   interaction,
   url: `https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=video&order=viewCount&maxResults=50&q=${video}&key=${process.env.API_YT}`,
   name: "YouTube",
   config: {
    method: "GET",
    headers: { "Content-Type": "application/json" },
   },
  }).catch((err) => {
   console.log(err?.data?.error ?? err);
   useError(err, interaction);
   return { items: [] };
  });

  if (!items[0]) throw new BotError({ message: "We wished, we wished with all our heart and got nothing." });
  let page = 0;
  const array = split(items, 5, (e: any) => ({
   title: decode(e.snippet.title),
   id: decode(e.id.videoId),
   description: decode(e.snippet.description),
   channel: decode(e.snippet.channelTitle),
   publish: decode(e.snippet.publishedAt),
  }));

  const menuId = `youtube-${interaction.id}`;
  const menu: SelectMenuComponentData = {
   type: ComponentType.SelectMenu,
   customId: menuId,
   maxValues: 1,
   minValues: 1,
   placeholder: "Which video do you want to see?",
   options: setOptions(page),
  };

  const components: any = [{ type: ComponentType.ActionRow, components: [menu] }];
  let buttons: APIButtonComponentWithCustomId[];
  let ids: string[] = [menuId];
  if (array.length > 1) {
   const { buttons: btns, customIds } = createButtons(interaction, ["back", "next"], ["back", "next"], ButtonStyle.Danger);
   ids = [...ids, ...customIds];
   buttons = btns as APIButtonComponentWithCustomId[];
   components.push({ type: ComponentType.ActionRow, components: buttons });
  }

  embed.footer = { text: `Page 1 of ${array.length}` };
  const message = await interaction.editReply({ embeds: [embed], components });

  const collector = message.createMessageComponentCollector({
   filter: (i) => i.user.id === interaction.user.id && ids.includes(i.customId),
   idle: 45000,
   time: 300000,
  });

  let clickedMenu = false;
  collector.on("collect", async (i: MessageComponentInteraction) => {
   if (collector.ended) return;
   let content: string | undefined = undefined;

   if (i.isButton()) {
    switch (i.customId) {
     case buttons[0].custom_id:
      if (clickedMenu) {
       buttons[1].disabled = false;
       clickedMenu = false;
      } else {
       page = page == 0 ? array.length - 1 : page - 1;
      }
      break;
     case buttons[1].custom_id:
      page = page == array.length - 1 ? 0 : page + 1;
    }

    menu.options = setOptions(page);
   }

   if (i.isSelectMenu()) {
    clickedMenu = true;
    buttons[1].disabled = true;
    const value = i.values[0];
    menu.options!.forEach((option) => (option.default = option.value === value));
    content = youtubeUrl + i.values[0];
   }

   await i.update({ content, embeds: clickedMenu ? [] : [embed], components });
  });

  collector.on("end", (i, r) => {
   if (r !== "time" && r !== "idle") return;

   if (!i.first()) {
    if (buttons && buttons[0] && buttons[1]) {
     buttons[0].disabled = true;
     buttons[1].disabled = true;
    }

    menu.placeholder = "You didn't choose a video in time.";
    interaction.editReply({ components: components });
   }
  });

  function setOptions(page: number = 0): SelectMenuComponentOptionData[] {
   if (array.length === 0) throw new BotError({ message: `We couldn't find any videos.` });
   embed.fields = [] as EmbedField[];
   embed.footer = { text: `Page ${page + 1} of ${array.length}` };

   return array[page].map((video: any) => {
    let description = video.channel
     ? `\*\*\_${video.channel.substring(0, 20).trim() + (video.channel.length > 20 ? "..." : "") + ""}\_\*\*: `
     : "No Title";
    description += video.description
     ? video.description.substring(0, 200).trim() + (video.description.length > 200 ? "..." : "")
     : "No description available";

    embed.fields!.push({
     name: video.title ? video.title.substring(0, 50).trim() + (video.title.length > 50 ? "..." : "") : "No Video Title",
     value:
      `${video.publish ? time(new Date(video.publish), TimestampStyles.LongDateTime) : ""} - ` +
      `[Go to video](${youtubeUrl}${video.id})\n${description}`,
    });

    return {
     label: video.title ? video.title.substring(0, 50) + (video.title?.length > 50 ? "..." : "") : "No Title",
     value: video.id,
     description: video.description
      ? video.description.substring(0, 80) + (video.description.length > 80 ? "..." : "")
      : "No description available",
    };
   });
  }
 },
} as Command;
