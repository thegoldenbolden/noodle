import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  CommandInteraction,
  ContextMenuCommandInteraction,
  ModalSubmitInteraction,
  SelectMenuInteraction,
  TextChannel,
  ThreadChannel,
} from "discord.js";
import { debounce } from "lodash";
import { Pasta } from "../../index";
import { get } from "../database";
import { execution, handleError } from "../functions";
import { GuildProfile, UserProfile } from "../types/database";
import { Load } from "../types/discord";

type AutoArgs = AutocompleteInteraction;
const handleAutocomplete = async (interaction: AutoArgs) => {
  const command = Pasta.commands.get(interaction.commandName);
  if (!command) return;

  if (interaction.commandName === "animanga") {
    let db = debounce(filter, 1500, { leading: true });
    db();

    async function filter(choices?: ApplicationCommandOptionChoiceData[]) {
      try {
        let { name, value: focused } = interaction.options.getFocused(true);
        let medium = interaction.options.getString("medium", true);
        let sfw = interaction.options.getBoolean("sfw");
        sfw = sfw === null ? true : sfw;

        let initial =
          name !== "rating"
            ? command?.choices[medium][name]
            : command?.choices.rating.filter((choice: ApplicationCommandOptionChoiceData) => {
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

        let options: ApplicationCommandOptionChoiceData[];
        if (focused.toString().length > 0) {
          options = initial?.filter((choice: ApplicationCommandOptionChoiceData) => {
            return choice.name
              .replace(/\s+/, "")
              .toLowerCase()
              .includes((focused as string).toLowerCase().replace(/\s+/g, ""));
          });
        } else {
          options = initial?.filter((choice: ApplicationCommandOptionChoiceData) => {
            return choice.name
              .replace(/\s+/, "")
              .toLowerCase()
              .includes((focused as string).toLowerCase().replace(/\s+/g, ""));
          });
        }

        options = options?.slice(0, 20);
        await interaction.respond(options ?? []);
      } catch (err) {
        console.log(err);
      }
    }
  }
};

type ModalArgs = ModalSubmitInteraction;
const handleModalSubmit = async (interaction: ModalArgs) => {};

type SelectArgs = SelectMenuInteraction;
const handleSelectMenu = async (interaction: SelectArgs) => {
  if (interaction.customId !== "autorole") return;
  console.log(interaction);
};

type CommandArgs = CommandInteraction | ChatInputCommandInteraction | ContextMenuCommandInteraction;
const handleCommand = async (interaction: CommandArgs) => {
  const command = Pasta.commands.get(interaction.commandName);

  if (command) {
    const params: any[] = [];

    switch (command.database) {
      case Load.User:
        params.push(await get<UserProfile>({ id: interaction.user.id, table: "users" }));
        break;
      case Load.Guild:
        params.push(await get<GuildProfile>({ id: interaction.guildId, table: "guilds" }));
        break;
      case Load.UserAndGuild:
        params.push(await get<UserProfile>({ id: interaction.user.id, table: "users" }));
        params.push(await get<GuildProfile>({ id: interaction.guildId, table: "guilds" }));
        break;
    }

    interaction.isContextMenuCommand() && params.push(true);

    // Check Cooldown
    let cooldown = Pasta.cooldowns.get(interaction.user.id);
    if (!cooldown) {
      Pasta.cooldowns.set(interaction.user.id, new Map());
      cooldown = Pasta.cooldowns.get(interaction.user.id);
    }

    const remaining = cooldown?.get(command.name);
    const now = Date.now();
    const cd = 1000 * (command.cooldown || 3);
    if (remaining) {
      const expire = remaining + cd;

      if (expire > now) {
        return await interaction.reply({
          ephemeral: true,
          content: "Please wait " + ((expire - now) / 1000).toString(10) + " more seconds before reusing this command.",
        });
      }
    }

    cooldown?.set(command.name, now);
    const timeout = setTimeout(() => {
      cooldown?.delete(command.name);
      clearTimeout(timeout);
    }, cd);

    // Check Permissions
    if (command.permissions) {
      if (interaction.memberPermissions?.has(command.permissions, true)) {
        return await interaction.reply({
          ephemeral: true,
          content: `This command requires the following permission(s): ${command.permissions
            .map((p) => `\`${p}\``)
            .join(" ")}`,
        });
      }
    }

    // Check Games

    await execution(`${command.name}`, command.execute, interaction, ...params).catch((err) => {
      handleError(err, interaction);
    });
  }
};

export default {
  handleAutocomplete,
  handleCommand,
  handleModalSubmit,
  handleSelectMenu,
};
