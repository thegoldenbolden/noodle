import { APIApplicationCommandOptionChoice, APIEmbed, ButtonStyle, ComponentType } from "discord-api-types/v10";
import {
  ButtonComponentData,
  ChatInputCommandInteraction,
  Embed,
  SelectMenuComponentData,
  SelectMenuInteraction,
} from "discord.js";
import { Pasta } from "../../index";
import { BotError } from "../../utils/classes/BotError";
import { convert, isValid } from "../../utils/dayjs";
import { basicCollector, getEmoji } from "../../utils/discord";
import { randomColor, useAxios } from "../../utils/functions";
import { createButtons } from "../../utils/functions/Collector";
import { Jikan } from "../../utils/typings/apis/Jikan";
import { Category, Command } from "../../utils/typings/discord/index";

type Paginate = {
  count: number;
  next_page: boolean;
  per_page: number;
  embeds: Embed[];
  menu: SelectMenuComponentData;
  create: {
    type?: string;
    placeholder: string;
    title: {
      get: (data: any, type: string) => string;
      name: ["english", "japanese", "name", "name_kanji"];
    };
    query: (page: number) => string;
  };
};

export default <Command>{
  name: "animanga",
  category: Category.Miscellaneous,
  cooldown: 15,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const subcommand = interaction.options.getSubcommand();
    const api = "https://api.jikan.moe/v4/";
    const self = Pasta.commands.get("animanga");
    const color = interaction.guild?.me?.displayColor || randomColor();
    const display = interaction.options.getString("display");
    const paginate: Paginate[] = [];
    const errorMessage = "We traveled the land searching far and wide and came up with nothing.";

    switch (subcommand) {
      case "character":
        paginate.push(await getCharacter());
        break;
      case "series":
        paginate.push(await getSeries());
        break;
      case "random":
        await getRandom();
        return;
      case "top":
        paginate.push(await getTop());
    }

    const { buttons } = createButtons(interaction, ["first", "back", "next", "last", "previous", "load"]);
    let page = 0,
      index = 0,
      loading = false;

    const options: any = {
      embeds: [paginate[page].embeds[index]],
      components: [
        {
          type: ComponentType.ActionRow,
          components: [paginate[page].menu],
        },
        {
          type: ComponentType.ActionRow,
          components: buttons.slice(0, 4),
        },
      ],
    };

    await basicCollector({
      interaction,
      ephemeral: false,
      ids: [...buttons.map((button) => button.custom_id), paginate[page].menu.customId],
      options,
      collect: (i) => {
        return new Promise((resolve, reject) => {
          if (loading) resolve(null);

          switch (i.customId) {
            case `paginate.${interaction.id}`:
              index = +(i as SelectMenuInteraction).values[0];
              break;
            case `first.${interaction.id}`:
              index = 0;
              break;
            case `back.${interaction.id}`:
              index -= index == 0 ? 0 : 1;
              break;
            case `next.${interaction.id}`:
              index += index == paginate[page].count - 1 ? 0 : 1;
              break;
            case `last.${interaction.id}`:
              index = paginate[page].count - 1;
              break;
            case `load.${interaction.id}`:
              loading = true;
              if (paginate[page]?.next_page) {
                page += 1;
                index = 0;
                options.components![0].components[0].placeholder = "Loading...";

                const timeout = setTimeout(async () => {
                  paginate.push(await shared(paginate[0].create, page + 1));
                  loading = false;

                  paginate[page - 1].menu.placeholder = `Select a${
                    display === "anime" ? "n anime" : display === "manga" ? " manga" : " character"
                  }`;

                  // Change embed
                  options.embeds![0] = paginate[page].embeds[index];

                  // Change components
                  options.components![0].components[0] = paginate[page].menu;
                  options.components![1].components[0] = buttons[4];
                  options.components![1].components[3] = buttons[3];

                  // Toggle components
                  options.components![1].components[0].disabled = false;
                  options.components![1].components[1].disabled = true;
                  options.components![1].components[2].disabled = false;
                  options.components![1].components[3].disabled = false;
                  paginate[page - 1].menu.disabled = false;

                  clearTimeout(timeout);
                  return resolve(options);
                }, 400);
              }

              if (loading) {
                options.components!.forEach((c: any) => c.components.forEach((c: any) => (c.disabled = true)));
                i.editReply(options);
                return null;
              }
              return;
            case `previous.${interaction.id}`:
              page -= page == 0 ? 0 : 1;
              index = paginate[page].count - 1;
              options.components![0].components[0] = paginate[page].menu;
              break;
          }

          switch (index) {
            default:
              options.components![1].components[0] = buttons[0];
              options.components![1].components[3] = buttons[3];
              options.components![1].components.forEach((btn: any) => (btn.disabled = false));
              break;
            case 0:
              // Change buttons
              options.components![1].components[0] = page > 0 ? buttons[4] : buttons[0];
              options.components![1].components[3] = buttons[3];

              // Toggle buttons
              options.components![1].components[0].disabled = page === 0;
              options.components![1].components[1].disabled = true;
              options.components![1].components[2].disabled = false;
              options.components![1].components[3].disabled = false;
              break;
            case paginate[page].count - 1:
              // Change buttons
              options.components![1].components[0] = buttons[0];
              options.components![1].components[3] = paginate[page].next_page ? buttons[5] : buttons[3];

              // Toggle buttons
              options.components![1].components[0].disabled = false;
              options.components![1].components[1].disabled = false;
              options.components![1].components[2].disabled = true;
              options.components![1].components[3].disabled = !paginate[page].next_page;
              break;
          }

          options.embeds![0] = paginate[page].embeds[index];
          options.components![0].components[0] = paginate[page].menu;
          return resolve(options);
        });
      },
    });

    function setCharacterEmbed(data: any): APIEmbed[] {
      if (!data) return [];

      const image = data.images?.webp?.image_url ?? "";
      const description = [(data.about?.substring(0, 2500).trim() ?? "No description available") + "..."];
      const nicknames = data.nicknames?.map((name: string) => `\*\*${name}\*\*`).join(", ");
      description.push(nicknames ? "\n**Nicknames**\n" + nicknames : "");

      return [
        {
          color,
          url: data.url ?? "",
          title: data.name_kanji ?? undefined,
          description: description.join("\n").substring(0, 4000).trim(),
          author: {
            name: data.name?.substring(0, 200) ?? "No Name",
            icon_url: image,
            url: data.url ?? "",
          },
          thumbnail: {
            url: image,
            height: 4096,
            width: 4096,
          },
        },
      ];
    }

    function setMangaEmbed(data?: any): APIEmbed[] {
      if (!data) return [];

      const description = [(data?.synopsis?.substring(0, 250) ?? "No synopsis provided").trim() + "..."];
      const popularity = `Popularity #${data?.popularity ?? "TBD"}`;
      const rank = `Rank #${data?.rank ?? "TBD"}`;
      const fav = `Favorites #${data?.favorites ?? "TBD"}`;
      const str = [popularity, rank, fav].map((i) => `\`\`${i}\`\``).join(" — ");
      const volumes = data?.volumes ? `${data.volumes} Vol.` : "TBD";
      const chapters = data?.chapters ? `${data.chapters} Ch.` : "TBD";

      description.push(`\n\*\*Score: ${data?.score ?? "TBD"}\*\* — Scored by ${data?.scored_by ?? "TBD"} members.\n${str}`);
      description.push(
        `\*\*Authors\*\*\n` +
          (!data?.authors?.[0] ? "TBD" : `${data.authors.map((a: any) => `[${a.name}](${a.url})`).join(", ")}`)
      );

      description.push(
        `\*\*Genres\*\*\n` +
          (!data?.genres?.[0] ? "TBD" : `${data.genres.map((a: any) => `[${a.name}](${a.url})`).join(", ")}`)
      );
      description.push(
        `\*\*Themes\*\*\n` +
          (!data?.themes?.[0] ? "TBD" : `${data.themes.map((a: any) => `[${a.name}](${a.url})`).join(", ")}`)
      );
      description.push(
        `\*\*Demographics\*\*\n` +
          (!data?.demographics?.[0] ? "TBD" : `${data.demographics.map((a: any) => `[${a.name}](${a.url})`).join(", ")}`)
      );

      return [
        {
          color,
          description: description.join("\n").substring(0, 4000).trim(),
          author: {
            name: data?.title?.substring(0, 100) ?? "No Title",
            icon_url: data?.images?.webp?.small_image_url ?? "",
            url: data?.url ?? "",
          },
          thumbnail: {
            url: data?.images?.webp?.large_image_url ?? "",
            height: 4096,
            width: 4096,
          },
          fields: [
            { name: "Type & Status", value: `${data?.type ?? "TBD"} • ${data?.status ?? "TBD"}`, inline: true },
            { name: "Members", value: `${data?.members ?? "TBD"}`, inline: true },
            { name: "Volumes & Chapters", value: `${volumes} ${chapters}`, inline: true },
          ],
          footer: {
            text: `• Published from ${data?.published?.string}`,
          },
        },
      ];
    }

    function setAnimeEmbed(data?: any): APIEmbed[] {
      if (!data) return [];

      const description = [(data?.synopsis?.substring(0, 250) ?? "No synopsis provided").trim() + "..."];
      description[0] += data?.source ? ` [Source: \*${data.source}\*]` : "";

      const popularity = `Popularity #${data?.popularity ?? "TBD"}`;
      const rank = `Rank #${data?.rank ?? "TBD"}`;
      const fav = `Favorites #${data?.favorites ?? "TBD"}`;
      const str = [popularity, rank, fav].map((i) => `\`\`${i}\`\``).join(" — ");
      const trailer = data?.trailer?.youtube_id ? `https://www.youtube.com/watch?v=${data.trailer?.youtube_id}` : undefined;
      const title = trailer ? `📺 Watch the Trailer` : undefined;
      const titleUrl = title ? trailer : undefined;

      description.push(`\n\*\*Score: ${data?.score ?? "TBD"}\*\* — Scored by ${data?.scored_by ?? "TBD"} members.\n${str}`);

      description.push(
        `\*\*Producers\*\*\n` +
          (!data?.producers?.[0] ? "TBD" : `${data?.producers.map((a: any) => `[${a.name}](${a.url})`).join(", ")}`)
      );

      description.push(
        `\*\*Licensors\*\*\n` +
          (!data?.licensors?.[0] ? "TBD" : `${data?.licensors.map((a: any) => `[${a.name}](${a.url})`).join(", ")}`)
      );

      description.push(
        `\*\*Studios\*\*\n` +
          (!data?.studios?.[0] ? "TBD" : `${data?.studios.map((a: any) => `[${a.name}](${a.url})`).join(", ")}`)
      );

      description.push(
        `\*\*Genres\*\*\n` +
          (!data?.genres?.[0] ? "TBD" : `${data.genres.map((a: any) => `[${a.name}](${a.url})`).join(", ")}`)
      );
      description.push(
        `\*\*Themes\*\*\n` +
          (!data?.themes?.[0] ? "TBD" : `${data.themes.map((a: any) => `[${a.name}](${a.url})`).join(", ")}`)
      );
      description.push(
        `\*\*Demographics\*\*\n` +
          (!data?.demographics?.[0] ? "TBD" : `${data.demographics.map((a: any) => `[${a.name}](${a.url})`).join(", ")}`)
      );

      return [
        {
          color,
          title: title,
          url: titleUrl,
          description: description.join("\n")?.substring(0, 4000).trim(),
          author: {
            name: data?.title?.substring(0, 100) ?? "No Title",
            icon_url: data?.images?.webp?.small_image_url ?? "",
            url: data?.url ?? "",
          },
          thumbnail: {
            url: data?.images?.webp?.large_image_url ?? "",
            height: 4096,
            width: 4096,
          },
          fields: [
            { name: "Type & Status", value: `${data?.type ?? "TBD"} • ${data?.status ?? "TBD"}`, inline: true },
            { name: "Members", value: `${data?.members ?? "TBD"}`, inline: true },
            {
              name: "Episodes & Runtime",
              value: `${data?.episodes ?? "TBD"} • ${data?.duration === "Unknown" ? "TBD" : data?.duration}`,
              inline: true,
            },
          ],
          footer: {
            text:
              `• Aired from ${data?.aired?.string ?? "TBD"} on ` +
              `${data?.broadcast?.string === "Unknown" ? `${data.broadcast?.string}` : "TBD"}`,
          },
        },
      ];
    }

    async function getRandom(): Promise<void> {
      const d = display == "characters" ? "character" : (display as string);
      const shuffle = getEmoji(["shuffle"])?.find((e) => e.name === "shuffle");
      const button: ButtonComponentData = {
        customId: `anishuff.${interaction.id}`,
        type: ComponentType.Button,
        style: ButtonStyle.Success,
        label: `New ${d[0].toUpperCase() + d.substring(1)}`,
        emoji: { id: shuffle?.id, name: shuffle?.name ?? undefined },
      };

      async function get() {
        const { data } = await useAxios(api + `random/${display}`);
        let embeds: APIEmbed[] = [];

        switch (display) {
          case "anime":
            embeds = setAnimeEmbed(data);
            break;
          case "manga":
            embeds = setMangaEmbed(data);
            break;
          case "characters":
            embeds = setCharacterEmbed(data);
        }
        return embeds;
      }

      const embed = await get();

      if (!embed?.[0]) {
        await interaction.editReply("We traveled the land searching far and wide and came up with nothing.");
        return;
      }

      await basicCollector({
        interaction,
        ephemeral: false,
        ids: [`anishuff.${interaction.id}`],
        options: {
          embeds: embed,
          components: [
            {
              type: ComponentType.ActionRow,
              components: [button],
            },
          ],
        },
        collect: async (i) => {
          button.disabled = true;
          button.label = "Loading..";
          const timeout = setTimeout(async () => {
            let embed: APIEmbed[] = await get();
            if (!embed || embed.length == 0) {
              button.disabled = true;
              button.label = "Oops..";
              embed = [{ description: `${errorMessage}` }];
            } else {
              button.disabled = false;
              button.label = `New ${d[0].toUpperCase() + d.substring(1)}`;
            }

            await interaction.editReply({
              embeds: embed,
              components: [
                {
                  type: ComponentType.ActionRow,
                  components: [button],
                },
              ],
            });
            clearTimeout(timeout);
            return;
          }, 1500);

          return {
            components: [
              {
                type: ComponentType.ActionRow,
                components: [button],
              },
            ],
          };
        },
      });
    }

    async function getCharacter(): Promise<Paginate> {
      const name = interaction.options.getString("name");
      const order = interaction.options.getString("order") ?? "favorites";
      const direction = interaction.options.getString("direction") ?? "desc";

      const createData: Jikan = {
        page: 1,
        type: display as "character",
        placeholder: ` character`,
        title: {
          get: (data, type) => (data[type] ? data[type] : "No Name"),
          name: ["name", "name_kanji"],
        },
        query: (page: number) => {
          let str = api + `characters?page=${page}&limit=25&sort=${direction}&order_by=${order}`;
          str += name ? `&q=${name}` : "";
          return str;
        },
      };

      const data = await shared(createData, 1);

      return {
        create: createData,
        ...data,
      };
    }

    async function getSeries(): Promise<Paginate> {
      const name = interaction.options.getString("name");
      const type = interaction.options.getString("type");
      const status = interaction.options.getString("status");
      const direction = interaction.options.getString("direction") ?? "desc";
      const order = interaction.options.getString("order") ?? "score";
      const rating = interaction.options.getString("rating");
      const start = interaction.options.getString("start");
      const end = interaction.options.getString("end");
      const genre = interaction.options.getInteger("genres");
      const sfw = interaction.options.getBoolean("sfw") ?? true;
      const max = interaction.options.getNumber("max_score");
      const min = interaction.options.getNumber("min_score");

      if (min && max && min > max) {
        throw new BotError(`${max} isn't bigger than ${min}.`);
      }

      const missing = (t: "type" | "status" | "order", v: string | null) => {
        if (v === null) return;
        if (!self?.choices[display!][t].some((c: any) => c.value === v)) {
          throw new BotError(`${display![0].toUpperCase() + display!.substring(1)} does not have ${v} ${t}.`);
        }
      };

      missing("type", type);
      missing("status", status);
      missing("order", order);

      const createData: Jikan = {
        type: display as "anime" | "manga",
        placeholder: display === "anime" ? "n anime" : " manga",
        title: {
          get: (data, type) => (data[`title_${type}`] ? data[`title_${type}`] : "Unknown Name"),
          name: ["english", "japanese"],
        },
        query: (page) => {
          let string = api + `${display}?page=${page}&limit=25`;
          string += ["anime", "manga"].includes(display as "anime" | "manga") ? `&sfw=${sfw}` : "";
          string += max ? `&max_score=${max}` : "";
          string += min ? `&min_score=${min}` : "";
          string += name ? `&q="${name}"` : "";
          string += type ? `&type=${type}` : "";
          string += direction ? `&sort=${direction}` : "";
          string += genre ? `&genres=${genre}` : "";
          string += order ? `&order_by=${order}` : "";
          string += rating ? `&rating=${rating}` : "";
          string += status ? `&status=${status}` : "";
          string += isValid(start) ? `&start_date=${convert(start, { format: "YYYY-MM-DD" })}` : "";
          string += isValid(end) ? `&end_date=${convert(end, { format: "YYYY-MM-DD" })}` : "";
          return string;
        },
      };

      const data = await shared(createData, 1);

      return {
        create: createData,
        ...data,
      };
    }

    async function getTop(): Promise<Paginate> {
      const type = interaction.options.getString("type");
      const filter = interaction.options.getString("filter");
      const createData: any = {
        type: display,
        placeholder: display === "anime" ? "n anime" : display === "manga" ? " manga" : " character",
        title: {
          get: (data: any, type: string) => {
            if (display === "characters") {
              return data[type] ? data[type] : "Unknown Name";
            }
            return data.title ? data.title : data[`title_${type}`] ? data[`title_${type}`] : "Unknown Name";
          },
          name: display === "characters" ? ["name", "name_kanji"] : ["english", "japanese"],
        },
        query: (page: number) => {
          let string = api + `top/${display}?page=${page}&limit=25`;
          string += type ? `&type=${type}` : "";
          string += filter ? `&filter=${filter}` : "";
          return string;
        },
      };

      const data = await shared(createData, 1);

      return {
        create: createData,
        ...data,
      };
    }

    async function shared(args: any, page: number): Promise<any> {
      const response = await useAxios(args.query(page));
      if (!response) return;

      const { pagination, data } = response;
      if (!pagination || pagination.items?.total === 0 || data?.length === 0) {
        throw new BotError(errorMessage);
      }

      const idx = (i: number) => i + 1 + pagination.items?.per_page * (pagination.current_page - 1);

      const embeds: APIEmbed[] = [];
      let menu: SelectMenuComponentData = {
        disabled: data.length === 1,
        type: ComponentType.SelectMenu,
        customId: `paginate.${interaction.id}`,
        maxValues: 1,
        minValues: 1,
        placeholder: `Select a${args.placeholder}`,
        options: [],
      };

      embeds.push(
        ...data.map((result: any, i: number): APIEmbed => {
          menu.options?.push({
            label: `#${idx(i)}. ` + args.title.get(result, args.title.name[0]).substring(0, 50).trim() + "...",
            value: `${i}`,
            description: args.title.get(result, args.title.name[1]).substring(0, 80).trim() + "...",
          });

          let embed: APIEmbed[] = [];
          switch (args.type) {
            default:
              embed = setCharacterEmbed(result);
              break;
            case "anime":
              embed = setAnimeEmbed(result);
              break;
            case "manga":
              embed = setMangaEmbed(result);
              break;
          }

          if (!embed[0]) {
            throw new BotError(`I was unable to create a response.`);
          }

          if (embed[0].footer?.text) {
            embed[0].footer.text += ` • ${idx(i)} of ${pagination?.items?.total} results`;
          } else {
            embed[0].footer = { text: ` • ${idx(i)} of ${pagination?.items?.total} results` };
          }

          return embed[0];
        })
      );

      return {
        embeds,
        menu,
        next_page: pagination.has_next_page,
        items_per: 25,
        count: pagination.items?.count,
      };
    }
  },
  choices: {
    rating: [
      { name: "G - All Ages", value: "g" },
      { name: "PG - Children", value: "pg" },
      { name: "PG13 - Age 13+", value: "pg13" },
      { name: "R - Age 17+ (Violence & Profanity)", value: "r17" },
      { name: "R+ - Mild Nudity (Violence & Profanity)", value: "r" },
      { name: "Rx - Hentai (Extreme Nudity)", value: "rx" },
    ],
    anime: {
      type: [
        { name: "TV", value: "tv" },
        { name: "Movie", value: "tv" },
        { name: "OVA", value: "ova" },
        { name: "Special", value: "special" },
        { name: "ONA", value: "music" },
      ] as APIApplicationCommandOptionChoice[],
      status: [
        { name: "Airing", value: "airing" },
        { name: "Complete", value: "complete" },
        { name: "Upcoming", value: "upcoming" },
      ] as APIApplicationCommandOptionChoice[],
      order: [
        { name: "Title", value: "title" },
        { name: "Type", value: "type" },
        { name: "Rating", value: "rating" },
        { name: "Episodes", value: "episodes" },
        { name: "Score", value: "score" },
        { name: "Popularity", value: "popularity" },
        { name: "Rank", value: "rank" },
        { name: "Members", value: "members" },
        { name: "Favorites", value: "members" },
        { name: "Id", value: "mal_id" },
        { name: "Scored By", value: "scored_by" },
        { name: "Start Date", value: "start_date" },
        { name: "End Date", value: "end_date" },
      ] as APIApplicationCommandOptionChoice[],
      genres: [] as APIApplicationCommandOptionChoice[],
    },
    manga: {
      genres: [] as APIApplicationCommandOptionChoice[],
      type: [
        { name: "Manga", value: "manga" },
        { name: "Novel", value: "novel" },
        { name: "Light Novel", value: "lightnovel" },
        { name: "Oneshot", value: "oneshot" },
        { name: "Doujin", value: "doujin" },
        { name: "Manhwa", value: "manhwa" },
        { name: "Manhua", value: "manhua" },
      ] as APIApplicationCommandOptionChoice[],
      status: [
        { name: "Publishing", value: "publishing" },
        { name: "Complete", value: "complete" },
        { name: "Hiatus", value: "hiatus" },
        { name: "Discontinued", value: "discontinued" },
        { name: "Upcoming", value: "upcoming" },
      ] as APIApplicationCommandOptionChoice[],
      order: [
        { name: "Title", value: "title" },
        { name: "Chapters", value: "chapters" },
        { name: "Volumes", value: "volumes" },
        { name: "Score", value: "score" },
        { name: "Popularity", value: "popularity" },
        { name: "Rank", value: "rank" },
        { name: "Members", value: "members" },
        { name: "Favorites", value: "members" },
        { name: "Id", value: "mal_id" },
        { name: "Scored By", value: "scored_by" },
        { name: "Start Date", value: "start_date" },
        { name: "End Date", value: "end_date" },
      ] as APIApplicationCommandOptionChoice[],
    },
  },
};
