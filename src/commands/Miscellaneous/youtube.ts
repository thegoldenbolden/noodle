import type { Command } from "../../types";
import {
 Collection,
 EmbedBuilder,
 ButtonBuilder,
 APIButtonComponent,
 APIStringSelectComponent,
 StringSelectMenuBuilder,
 SelectMenuComponentOptionData,
 ChatInputCommandInteraction,
} from "discord.js";

import { time, ButtonStyle, TimestampStyles } from "discord.js";
import { decode } from "html-entities";

import BotError from "../../lib/classes/Error";
import useAxios from "../../lib/Axios";
import { getInt, truncate, createPagination } from "../../lib/Helpers";
import { paginationEmojis } from "../../lib/Constants";

const UserRequests = new Collection<string, { data: any; expiresAt: number; user: string }>();
const youtubeUrl = "https://www.youtube.com/watch?v=";

const getId = (user?: string, ...keys: (string | number)[]) => {
 const params: (string | number)[] = ["youtube"];

 typeof user === "string" && params.push(user);
 params.push(...keys);

 return params.join("-");
};

const command: Command = {
 name: "youtube",
 categories: ["Miscellaneous"],
 cooldown: 10,
 async buttons(interaction) {
  const [, user, id] = interaction.customId.split("-");
  if (user !== interaction.user.id) throw new BotError({ message: "You didn't run this command." });

  const request = UserRequests.get(interaction.user.id);
  if (!request?.data) throw new BotError({ message: "You haven't requested a youtube video." });

  const embed = new EmbedBuilder({ color: 0xff0000, author: { name: "YouTube" } });

  const pageComponent = interaction.message.resolveComponent(getId("page"));
  if (!pageComponent) throw new Error("No page button");

  // 1 of 10;
  let [current, max] = (pageComponent.data as APIButtonComponent).label?.match(/\d+/g) ?? [1, request.data.length];
  (current = getInt(current ?? "1")), (max = getInt(max ?? request.data.length));
  let page: number = current;

  switch (id) {
   case "backSection":
    page = current;
    break;
   case "backPage":
    page = current === 1 ? max : current - 1; // current starts at 1;
    break;
   case "nextPage":
    page = current === max ? 1 : current + 1;
    break;
  }

  const menu = createMenu(user, embed, request.data, page - 1);
  // Creates menu options and updates embed fields.
  menu.setOptions(createOptions(embed, request.data, page - 1));
  const buttons = [backButton(user, "backPage"), pageButton(page - 1 ?? 0, max), nextButton(user)];

  interaction.update({
   content: null,
   embeds: [embed],
   components: [
    { type: 1, components: [menu] },
    { type: 1, components: buttons },
   ],
  });
 },
 async menu(interaction) {
  const [, user] = interaction.customId.split("-");
  if (user !== interaction.user.id) throw new BotError({ message: "You didn't run this command." });

  const request = UserRequests.get(interaction.user.id);
  if (!request?.data) throw new BotError({ message: "You haven't requested a youtube video." });
  const menuId = getId(user);

  // Change the back button to section and set next to disabled.
  const buttons = [
   backButton(user, "backSection"),
   new ButtonBuilder(interaction.message.components[1].components[1].data), // Page Button
   nextButton(user).setDisabled(true),
  ];

  // Update the default value in menu.
  const menuData = interaction.message.resolveComponent(menuId);
  if (!menuData?.data) throw new BotError({ message: "Unable to find component data" });
  const menu = new StringSelectMenuBuilder(menuData.data as APIStringSelectComponent);
  const value = interaction.values[0];
  menu.options.forEach((option) => option.setDefault(option.data.value === value));

  await interaction.update({
   content: `${youtubeUrl}${value}`,
   embeds: [],
   components: [
    { type: 1, components: [menu] },
    { type: 1, components: buttons },
   ],
  });
 },
 async execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const video = interaction.options.getString("video", true).replaceAll(" ", "+");
  const embed = new EmbedBuilder({ color: 0xff0000, author: { name: "YouTube" } });

  const url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=video&order=viewCount&maxResults=50&q=${video}&key=${process.env.YOUTUBE_KEY}`;
  const config = { method: "GET", headers: { "Content-Type": "application/json" } };
  const { data } = await useAxios({ interaction, url, name: "YouTube", config }).catch((e) => ({ items: [] }));
  const items = data?.items ?? [];
  if (!items[0]) throw new BotError({ message: "We wished, we wished with all our heart and got nothing." });

  const array = createPagination(items, 5, (e: any) => ({
   title: decode(e.snippet.title),
   id: decode(e.id.videoId),
   description: decode(e.snippet.description),
   channel: decode(e.snippet.channelTitle),
   publish: decode(e.snippet.publishedAt),
  }));

  const userId = interaction.user.id;
  UserRequests.set(interaction.user.id, { data: array, expiresAt: Date.now() + 3600000, user: interaction.user.id });

  const btns = [backButton(userId, "backPage"), pageButton(0, array.length), nextButton(userId)];
  const menu = [createMenu(userId, embed, array)];

  await interaction.editReply({
   embeds: [embed],
   components: [
    { type: 1, components: menu },
    { type: 1, components: btns },
   ],
  });

  UserRequests.filter((request) => request.expiresAt < Date.now()).forEach((request) => UserRequests.delete(request.user));
 },
};

function createOptions(embed: EmbedBuilder, array: any[], page: number = 0): SelectMenuComponentOptionData[] {
 if (array.length === 0 || !array[page]) throw new BotError({ message: `We couldn't find any videos.` });
 embed.setFields([]);

 return array[page].map((video: any) => {
  let description = video.channel ? `\*\*\_${truncate(video.channel, 20)}\_\*\*: ` : "No Title";
  description += video.description ? truncate(video.description, 200) : "No description available";

  embed.addFields({
   name: `📺 ${truncate(video.title, 50)}`,
   value:
    `${video.publish ? time(new Date(video.publish), TimestampStyles.LongDateTime) : ""} - ` +
    `[Go to video](${youtubeUrl}${video.id})\n${description}`,
  });

  return {
   label: video.title ? truncate(video.title, 50) : "No Title",
   value: video.id,
   description: video.description ? truncate(video.description, 80) : "No description available",
  };
 });
}

function backButton(user: string, type: "backSection" | "backPage", data?: Partial<APIButtonComponent>) {
 return new ButtonBuilder({
  ...data,
  style: ButtonStyle.Danger,
  label: "Back",
  customId: getId(user, type),
  emoji: paginationEmojis["back"] ?? undefined,
 });
}

function nextButton(userId: string, data?: Partial<APIButtonComponent>) {
 return new ButtonBuilder({
  ...data,
  style: ButtonStyle.Danger,
  label: "Next",
  customId: getId(userId, "nextPage"),
  emoji: paginationEmojis["next"] ?? undefined,
 });
}

function pageButton(current: number, max: number) {
 return new ButtonBuilder({
  style: ButtonStyle.Secondary,
  label: `Page ${current + 1} of ${max}`,
  disabled: true,
  customId: getId(undefined, "page"),
 });
}

function createMenu(user: string, embed: EmbedBuilder, array: any[], page: number = 0) {
 return new StringSelectMenuBuilder({
  customId: getId(user),
  maxValues: 1,
  minValues: 1,
  placeholder: "Which video do you want to see?",
  options: createOptions(embed, array, page),
 });
}

export default command;
