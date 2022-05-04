import { APIEmbed, ComponentType, InteractionType } from "discord-api-types/v10";
import { ApplicationCommandOptionChoiceData, EmbedFieldData } from "discord.js";
import { Pasta } from "../../index";
import { convert, isValid } from "../../utils/dayjs";
import { pagination } from "../../utils/discord";
import { useAxios } from "../../utils/functions";
import { Command, PaginationData } from "../../utils/types/discord";

export default <Command>{
  name: "animanga",
  cooldown: 5,
  async execute(interaction) {
    await interaction.deferReply();
    const subcommand = interaction.options.getSubcommand();
    const api = "https://api.jikan.moe/v4/";
    const self = Pasta.commands.get("animanga");

    switch (subcommand) {
      case "charatcer":
        await getCharacter();
        break;
      case "series":
        await getSeries();
        break;
    }

    async function getCharacter() {}
    async function getSeries() {
      const m = interaction.options.getString("medium", true) as "anime" | "manga";
      const name = interaction.options.getString("name");
      const type = interaction.options.getString("type");
      const status = interaction.options.getString("status");
      const sort = interaction.options.getString("sort") ?? "asc";
      const order = interaction.options.getString("order") ?? "rank";
      const rating = interaction.options.getString("rating");
      const start = interaction.options.getString("start");
      const end = interaction.options.getString("end");
      const genre = interaction.options.getInteger("genres");
      const sfw = interaction.options.getBoolean("sfw") ?? true;
      const max = interaction.options.getNumber("max_score");
      const min = interaction.options.getNumber("min_score");

      if (min && max && min > max) {
        return await interaction.editReply({
          content: `${max} isn't bigger than ${min}.`,
        });
      }

      const missing = (t: "type" | "status" | "order", v: string | null) => {
        if (v === null) return;
        if (!self?.choices[m][t].some((c: ApplicationCommandOptionChoiceData) => c.value === v)) {
          throw new Error(`${m[0].toUpperCase() + m.substring(1)} does not have ${v} ${t}.`, {
            cause: { name: "Invalid Input", message: "User didn't give a valid input" },
          });
        }
      };

      missing("type", type);
      missing("status", status);
      missing("order", order);

      const query = (page: number) => {
        let string = api + `${m}?page=${page}&limit=25`;
        string += m === "anime" ? `&sfw=${sfw}` : "";
        string += max ? `&max_score=${max}` : "";
        string += min ? `&min_score=${min}` : "";
        string += name ? `&q="${name}"` : "";
        string += type ? `&type=${type}` : "";
        string += sort ? `&sort=${sort}` : "";
        string += genre ? `&genres=${genre}` : "";
        string += order ? `&order_by=${order}` : "";
        string += rating ? `&rating=${rating}` : "";
        string += status ? `&status=${status}` : "";
        string += isValid(start) ? `&start_date=${convert(start, { format: "YYYY-MM-DD" })}` : "";
        string += isValid(end) ? `&end_date=${convert(end, { format: "YYYY-MM-DD" })}` : "";
        return string;
      };

      await pagination({
        interaction,
        getData,
        initial: "fullview",
        ephemeral: false,
        pagination: [await getData(1, null)],
        options: {
          idle: 20000,
          interactionType: InteractionType.MessageComponent,
          dispose: true,
        },
      });

      async function getData(page: number, collector: any): Promise<PaginationData> {
        const { pagination: data, data: results } = await useAxios(query(page));

        if (!data || data.items.total === 0 || results.length === 0) {
          if (collector) {
            collector.stop();
          } else {
            return null as any;
          }
        }

        const p: PaginationData = {
          next_page: data.has_next_page,
          max: data.items.count,
          current_item: 0,
          fullview: [],
          menus: [],
        };

        p.fullview.push(
          ...results.map((result: any, i: number): APIEmbed => {
            const color: number = result.score > 7 ? 65280 : result.score > 5 ? 16776960 : 16711680;
            const name: string = result.title?.substring(0, 100) ?? "Unknown Title";
            const icon_url = result.images?.small_image_url ?? "";
            const url = result.url ?? "";
            const description = [(result.synopsis?.substring(0, 250) ?? "No synopsis available") + "..."];
            const thumbnail =
              result.images?.webp?.maximum_image_url || result.images?.webp?.large_image_url
                ? {
                    url: result.images?.webp?.maximum_image_url || result.images?.webp?.large_image_url,
                    height: 4096,
                    width: 4096,
                  }
                : undefined;

            const idx = i + 1 + data.items.count * (data.current_page - 1);

            p.menus.push({
              type: ComponentType.SelectMenu,
              custom_id: "pagination",
              max_values: 1,
              min_values: 1,
              placeholder: `Select a${m === "anime" ? "n" : ""} ${m}`,
              options: results.map((r: any, i: number) => {
                const getTitle = (t: "english" | "japanese") => {
                  return r[`title_${t}`] ? r[`title_${t}`].substring(0, 100) : name;
                };

                return {
                  label: `#${idx}. ` + getTitle("english").substring(0, 80),
                  value: `${i}`,
                  description: getTitle("japanese"),
                };
              }),
            });

            const resultsFound = data.items.total ? ` • #${idx} of ${data.items.total}` : "";
            const trailer = result.trailer?.youtube_id
              ? `https://www.youtube.com/watch?v=${result.trailer?.youtube_id}`
              : undefined;
            let title = trailer ? `📺 Watch the Trailer` : undefined;
            let titleUrl = title ? trailer : undefined;
            let footer = {
              text: "Powered by Jikan API" + resultsFound,
            };

            const o = {
              fields: [
                { name: "Type & Status", value: `${result.type ?? "TBD"} • ${result.status ?? "TBD"}`, inline: true },
                { name: "Members", value: `${result.members ?? "TBD"}`, inline: true },
              ] as EmbedFieldData[],
            };

            if (result.source) {
              description[0] += ` [Source: \*${result.source}\*]`;
            }

            let popularity = `Popularity #${result.popularity ?? "TBD"}`;
            let rank = `Rank #${result.rank ?? "TBD"}`;
            let fav = `Favorites #${result.favorites ?? "TBD"}`;
            let str = [popularity, rank, fav].map((i) => `\`\`${i}\`\``).join(" — ");

            description.push(
              `\n\*\*Score: ${result.score ?? "TBD"}\*\* — Scored by ${result.scored_by ?? "TBD"} members.\n${str}`
            );

            if (m === "manga") {
              const volumes = result.volumes ? `${result.volumes} Vol.` : "TBD";
              const chapters = result.chapters ? `${result.chapters} Ch.` : "TBD";

              o.fields.push({ name: "Volumes & Chapters", value: `${volumes} ${chapters}`, inline: true });

              footer.text = `Published from ${result.published?.string} • ${resultsFound}`;

              o.fields.push({
                name: "Authors",
                value: !result.authors?.[0]
                  ? "TBD"
                  : `${result.authors.map((a: any) => `[${a.name}](${a.url})`).join(", ")}`,
                inline: true,
              });
            } else {
              if (result.episodes) {
                o.fields.push({
                  name: "Episodes",
                  value: `${result.episodes} ${result.duration ? ` • ${result.duration}` : ""}`,
                  inline: true,
                });
              }

              if (result?.aired.string) {
                footer.text = `Aired from ${result?.aired.string} ${
                  result.broadcast?.string ? `on ${result.broadcast?.string}.` : ""
                } ${resultsFound}`;
              }

              o.fields.push({
                name: "Producers",
                value: !result.producers?.[0]
                  ? "TBD"
                  : `${result.producers.map((a: any) => `[${a.name}](${a.url})`).join(", ")}`,
                inline: true,
              });
              o.fields.push({
                name: "Licensors",
                value: !result.licensors?.[0]
                  ? "TBD"
                  : `${result.licensors.map((a: any) => `[${a.name}](${a.url})`).join(", ")}`,
                inline: true,
              });
              o.fields.push({
                name: "Studios",
                value: !result.studios?.[0]
                  ? "TBD"
                  : `${result.studios.map((a: any) => `[${a.name}](${a.url})`).join(", ")}`,
                inline: true,
              });
            }

            o.fields.push({
              name: "Genres",
              value: !result.genres?.[0] ? "TBD" : `${result.genres.map((g: any) => `[${g.name}](${g.url})`).join(", ")}`,
              inline: true,
            });
            o.fields.push({
              name: "Themes",
              value: !result.themes?.[0] ? "TBD" : `${result.themes.map((t: any) => `[${t.name}](${t.url})`).join(", ")}`,
              inline: true,
            });
            o.fields.push({
              name: "Demographics",
              value: !result.demographics?.[0]
                ? "TBD"
                : `${result.demographics.map((t: any) => `[${t.name}](${t.url})`).join(", ")}`,
              inline: true,
            });

            return {
              color,
              thumbnail,
              title,
              description: description.join("\n").substring(0, 2500),
              url: titleUrl,
              footer,
              author: { name, icon_url, url },
              fields: o.fields,
            };
          })
        );
        return p;
      }
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
      ] as ApplicationCommandOptionChoiceData[],
      status: [
        { name: "Airing", value: "airing" },
        { name: "Complete", value: "complete" },
        { name: "Upcoming", value: "upcoming" },
      ] as ApplicationCommandOptionChoiceData[],
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
      ] as ApplicationCommandOptionChoiceData[],
      genres: [] as ApplicationCommandOptionChoiceData[],
    },
    manga: {
      genres: [] as ApplicationCommandOptionChoiceData[],
      type: [
        { name: "Manga", value: "manga" },
        { name: "Novel", value: "novel" },
        { name: "Light Novel", value: "lightnovel" },
        { name: "Oneshot", value: "oneshot" },
        { name: "Doujin", value: "doujin" },
        { name: "Manhwa", value: "manhwa" },
      ] as ApplicationCommandOptionChoiceData[],
      status: [
        { name: "Publishing", value: "publishing" },
        { name: "Complete", value: "complete" },
        { name: "Hiatus", value: "hiatus" },
        { name: "Discontinued", value: "discontinued" },
        { name: "Upcoming", value: "upcoming" },
      ] as ApplicationCommandOptionChoiceData[],
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
      ] as ApplicationCommandOptionChoiceData[],
    },
  },
};
