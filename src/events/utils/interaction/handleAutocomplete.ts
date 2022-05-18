import { AutocompleteInteraction, TextChannel, ThreadChannel } from "discord.js";
import { debounce } from "lodash";
import { Pasta } from "../../../index";

export default async (interaction: AutocompleteInteraction) => {
  const command = Pasta.commands.get(interaction.commandName);
  if (!command) return;

  if (interaction.commandName === "animanga") {
    const subcommand = interaction.options.getSubcommand(true);
    let db = debounce(filter, 1500, { leading: true });
    db();

    async function filter() {
      try {
        let { name, value: focused } = interaction.options.getFocused(true);

        if (subcommand === "series") {
          let display = interaction.options.getString("display", true);
          let sfw = interaction.options.getBoolean("sfw");
          sfw = sfw === null ? true : sfw;

          let initial =
            name !== "rating"
              ? command?.choices[display][name]
              : command?.choices.rating.filter((choice: any) => {
                  const safe =
                    sfw === null
                      ? !(interaction.channel as ThreadChannel).parent?.nsfw || !(interaction.channel as TextChannel).nsfw
                      : sfw;

                  if (safe) {
                    if (choice.value === "r" || choice.value === "rx") {
                      return false;
                    }
                  }
                  return true;
                });

          let options: any[];
          if (focused.toString().length > 0) {
            options = initial?.filter((choice: any) => {
              return choice.name
                .replace(/\s+/, "")
                .toLowerCase()
                .includes((focused as string).toLowerCase().replace(/\s+/g, ""));
            });
          } else {
            options = initial?.filter((choice: any) => {
              return choice.name
                .replace(/\s+/, "")
                .toLowerCase()
                .includes((focused as string).toLowerCase().replace(/\s+/g, ""));
            });
          }

          options = options?.slice(0, 20);
          await interaction.respond(options ?? []);
          return;
        }

        if (subcommand === "top") {
          const n = interaction.options.getString("display", true);

          if (n === "characters") {
            return await interaction.respond([]);
          }

          let options =
            name === "filter"
              ? [
                  { name: "Upcoming", value: "upcoming" },
                  { name: "Popularity", value: "bypopularity" },
                  { name: "Favorite", value: "favorite" },
                ]
              : command?.choices[n].type;

          if (name === "filter") {
            options.push(n === "anime" ? { name: "Airing", value: "airing" } : { name: "Published", value: "published " });
          }

          let filter = options.filter((o: any) => o.name.toLowerCase().includes(focused.toString()?.toLowerCase()));
          return await interaction.respond(filter);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
};
