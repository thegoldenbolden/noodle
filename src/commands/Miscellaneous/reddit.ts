import {
	APIActionRowComponent,
	APIButtonComponentWithCustomId,
	APIEmbed,
	ButtonStyle,
	ComponentType
} from "discord-api-types/v10";
import { ChatInputCommandInteraction, TextChannel, WebhookEditMessageOptions } from "discord.js";
import { Errors } from "../../index";
import PastaError from "../../utils/classes/Error";
import { basicCollector, createButtons } from "../../utils/functions/discord";
import { getColor, useAxios } from "../../utils/functions/helpers";
import { Category, Command } from "../../utils/typings/discord";

type Response = {
 title: string;
 ups: number;
 downs: number;
 total_awards_received: number;
 url: string | null;
 over_18: boolean;
 num_comments: number;
 subreddit_subscribers: number;
 selftext: string;
 is_video: boolean;
 dist: number | null;
 permalink: string;
 after: string | null;
};

export default <Command>{
 name: "reddit",
 category: Category.Miscellaneous,
 async execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const subreddit = interaction.options.getString("subreddit", true).replaceAll(" ", "");
  const view = interaction.options.getString("view") ?? "top";
  const time = interaction.options.getString("time") ?? "t=all";
  let url = `https://www.reddit.com/r/${subreddit}/${view}/.json?limit=24`;
  url += view === "top" ? `&${time}` : "";

  console.log(url);

  const data = await getData(url);
  if (!data) throw new PastaError({ message: "We found nothing in a hopeless place.", me: true });

  let [page, item, loading, lastPage] = [0, 0, false, false];
  let buttons: APIButtonComponentWithCustomId[] = [];
  const posts: Response[][] = [data];

  if (view === "random") {
   const { buttons: b, customIds: ci } = createButtons(interaction, ["shuffle"], true, ButtonStyle.Primary);
   let p: any = posts;

   await basicCollector({
    interaction,
    ephemeral: false,
    ids: ci,
    options: {
     ...formatReply(p, page, item),
     components: [{ type: ComponentType.ActionRow, components: b }],
    },
    collector: {
     idle: 60000,
    },
    collect: async (i) => {
     p = [await getData(url)];
     if (!p) return { content: "We found nothing in a hopeless place.", embeds: [], components: [] };

     return formatReply(p, page, item);
    },
   });

   return;
  }

  const components: APIActionRowComponent<APIButtonComponentWithCustomId>[] = [];
  let customIds: string[] = [];

  if (posts[page]?.length > 1) {
   const { buttons: btns, customIds: cid } = createButtons(
    interaction,
    ["first", "back", "next", "last", "previous", "load"],
    true,
    ButtonStyle.Primary
   );
   buttons = btns;
   customIds = cid;
   components.push({ type: ComponentType.ActionRow, components: buttons.slice(0, 4) });
  }

  const options = {
   ...formatReply(posts, page, item),
   components: components as any,
  };

  await basicCollector({
   interaction,
   ephemeral: false,
   ids: customIds,
   options,
   collector: {
    idle: 60000,
   },
   collect: (i) => {
    return new Promise((resolve, reject) => {
     try {
      if (loading) resolve(null);

      switch (i.customId) {
       case customIds[0]:
        item = 0;
        break;
       case customIds[1]:
        item -= item == 0 ? 0 : 1;
        break;
       case customIds[2]:
        item += item == posts[page].length - 1 ? 0 : 1;
        break;
       case customIds[3]:
        item = posts[page].length - 1;
        break;
       case customIds[4]:
        page -= page == 0 ? 0 : 1;
        item = posts[page].length - 1;
        break;
       case customIds[5]:
        loading = true;

        if (posts[page][0].after) {
         page += 1;
         item = 0;
         const timeout = setTimeout(async () => {
          try {
           const items = posts.reduce((a, b) => a + b?.length, 0);
           const d = await getData(`${url}&after=${posts[page - 1][0].after}&count=${items}`).catch((e) => {
            console.log(e);
            return null;
           });

           if (!d) {
            lastPage = true;
            page -= 1;
            item = posts[page].length - 1;
            clearTimeout(timeout);
            return resolve(null);
           }

           posts.push(d);
           loading = false;

           // Change components
           options.components![0].components[0] = buttons[4];
           options.components![0].components[3] = buttons[3];

           // Toggle components
           options.components![0].components[0].disabled = false;
           options.components![0].components[1].disabled = true;
           options.components![0].components[2].disabled = false;
           options.components![0].components[3].disabled = false;

           clearTimeout(timeout);
           return resolve({
            ...formatReply(posts, page, item),
            components: options.components,
           });
          } catch (e) {
           console.log(e);
           return resolve(null);
          }
         }, 1250);
        }

        if (loading) {
         options.components!.forEach((c: any) => c.components.forEach((c: any) => (c.disabled = true)));
         i.editReply({
          components: options.components,
         });
         return null;
        }
        return;
      }

      switch (item) {
       default:
        options.components![0].components[0] = buttons[0];
        options.components![0].components[3] = buttons[3];
        options.components![0].components.forEach((btn: any) => (btn.disabled = false));
        break;
       case 0:
        // Change buttons
        options.components![0].components[0] = page > 0 ? buttons[4] : buttons[0];
        options.components![0].components[3] = buttons[3];

        // Toggle buttons
        options.components![0].components[0].disabled = page === 0;
        options.components![0].components[1].disabled = true;
        options.components![0].components[2].disabled = false;
        options.components![0].components[3].disabled = false;
        break;
       case posts[page].length - 1:
        // Change buttons
        options.components![0].components[0] = buttons[0];
        options.components![0].components[3] = !lastPage ? buttons[5] : buttons[3];

        // Toggle buttons
        options.components![0].components[0].disabled = false;
        options.components![0].components[1].disabled = false;
        options.components![0].components[2].disabled = true;
        options.components![0].components[3].disabled = lastPage;
        break;
      }

      return resolve({
       ...formatReply(posts, page, item),
       components: options.components,
      });
     } catch (err) {
      Errors.send({ embeds: [{ title: "Reddit", description: `\`\`\`js\n${(err as Error).stack}\`\`\`` }] });
      reject(err);
     }
    });
   },
   end: async (i) => {
    return {
     components: options.components,
    };
   },
  });

  async function getData(url: string): Promise<Response[] | null> {
   const response = await useAxios({
    interaction,
    name: `Reddit: ${url}`,
    url: url,
   }).catch((e) => console.log(e));

   if (view === "random") {
    let a = response?.[0];
    if (!a || !a.data?.children || a.data.children?.length === 0) return null;
    a = a.data.children[0].data;
    if (!a) return null;

    return [
     {
      after: null,
      dist: null,
      title: a.title,
      ups: a.ups,
      downs: a.downs,
      total_awards_received: a.total_awards_received,
      url: a.url,
      over_18: a.over_18,
      num_comments: a.num_comments,
      subreddit_subscribers: a.subreddit_subscribers,
      selftext: a.selftext,
      is_video: a.is_video,
      permalink: a.permalink,
     },
    ];
   }

   if (!response || !response.data?.children || response.data?.children.length === 0) return null;

   if (!response.data.after) {
    lastPage = true;
   }

   return response.data.children.map((child: { data: Response; kind: string }) => {
    const { data } = child;
    if (!data) return {};

    return {
     after: response.data.after,
     dist: response.data.dist,
     title: data.title,
     ups: data.ups,
     downs: data.downs,
     total_awards_received: data.total_awards_received,
     url: data.url,
     over_18: data.over_18,
     num_comments: data.num_comments,
     subreddit_subscribers: data.subreddit_subscribers,
     selftext: data.selftext,
     is_video: data.is_video,
     permalink: data.permalink,
    };
   });
  }

  function formatReply(posts: Response[][], page: number = 0, item: number = 0): WebhookEditMessageOptions {
   const info = posts?.[page]?.[item];
   if (!info) return { content: "We couldn't find this page." };

   const spoiler = info.over_18 ? `\|\|` : "";
   const channelNsfw = (interaction.channel as TextChannel).nsfw;

   if (info.is_video) {
    return { embeds: [], content: `${spoiler}${info.url ?? "We couldn't find the url for this post."}${spoiler}` };
   }

   const embed: APIEmbed = {};
   if (info.url?.search(/.gif|.png|.jpg|.webp/) !== -1) {
    embed.image = {
     url: info.url ?? "",
     height: 4096,
     width: 4096,
    };
   }

   if (info.selftext?.length ?? 0 > 0) {
    embed.description = info.selftext.substring(0, 2000).trim() + (info.selftext.length > 2000 ? "..." : "");
    embed.description = embed.description.length == 0 ? "No description available" : embed.description;
   }

   embed.footer = {
    text: `👍 ${info.ups ?? 0} 👎 ${info.downs ?? 0} 💭 ${info.num_comments ?? 0} 🏆 ${info.total_awards_received ?? 0}`,
   };

   if (info.over_18) {
    embed.description =
     embed.description && embed.description.length > 0
      ? `${channelNsfw ? "" : spoiler}${embed.description}${channelNsfw ? "" : spoiler}`
      : "We will not show not safe for work content in a safe for work channel, hooligan.";

    embed.image = channelNsfw ? embed.image : undefined;
   }

   embed.title = `${info.over_18 ? "⚠️" : ""}`;
   embed.title += `${spoiler}${info.title ? info.title.substring(0, 200).trim() : "No Title"}${spoiler}`;
   embed.url = info.url ? `${info.url}` : info.permalink ? `${info.permalink}` : "";
   embed.color = getColor(interaction.guild?.members?.me);

   return { embeds: [embed], content: null };
  }
 },
};
