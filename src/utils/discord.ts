import {
  APIActionRowComponent,
  APIButtonComponent,
  APIEmbed,
  APIMessageActionRowComponent,
  ButtonStyle,
} from "discord-api-types/v10";
import {
  ButtonInteraction,
  Collection,
  ComponentType,
  GuildEmoji,
  InteractionCollector,
  SelectMenuInteraction,
} from "discord.js";
import { client } from "../bot";
import { handleError } from "./functions";
import { Pagination } from "./types/discord";

type PartialEmoji = {
  name: string | undefined;
  id: string | undefined;
};

enum Label {
  first = "First",
  back = "Back",
  next = "Next",
  last = "Last",
  load = "Load",
  previous = "Previous",
}

export const pagination = async ({ ...args }: Pagination) => {
  let emojis = getEmoji(["first", "back", "next", "last", "previous", "load"]);
  if (emojis) {
    emojis = emojis?.mapValues((e) => ({ id: e.id, name: e.name ?? undefined })) as Collection<string, GuildEmoji>;
  }

  const buttons = createPaginationButtons(emojis);
  // const components: ActionRowData<MessageActionRowComponentData>[] = [];
  const components: APIActionRowComponent<APIMessageActionRowComponent>[] = [];
  let page = 0;

  const { interaction, ephemeral } = args;

  // Defer interaction if needed
  if (!interaction.deferred) {
    await interaction.deferReply({ ephemeral: ephemeral });
  }

  const { pagination, initial } = args;

  if (!pagination[page]) {
    return await interaction.editReply({
      content: "I found nothing but an endless wave of pasta.",
    });
  }

  // Add menu if needed.
  if (pagination[page].menus[0]) {
    components.push({
      type: ComponentType.ActionRow,
      components: [pagination[page].menus[0]],
    });
  }

  // Add buttons
  components.push({
    type: ComponentType.ActionRow,
    components: [...buttons],
  });

  const message = await interaction
    .editReply({
      embeds: [pagination[page]["fullview"][pagination[page].current_item]],
      components: components,
    })
    .catch((e) => {
      console.log(e);
      return null;
    });

  const { options } = args;
  options.filter = (i: any) => {
    return i.user.id === interaction.user.id && ["pagination", "first", "back", "next", "last"].includes(i.customId);
  };

  options.message = message;
  const collector = new InteractionCollector(interaction.client, options);
  collector.on("collect", async (i: ButtonInteraction | SelectMenuInteraction) => {
    try {
      if (collector.ended) return;

      let view: "preview" | "fullview" = args.initial;

      switch (i.customId) {
        case "first":
          // Disable if only 1 page.
          buttons[0].disabled = pagination.length === 1;

          // Always disable
          buttons[1].disabled = true;
          buttons[3].disabled = !pagination[page].next_page;

          // Enable always
          buttons[2].disabled = false;

          if (buttons[0].label === "Previous") {
            page -= 1;

            if (!pagination[page]) {
              i.deferUpdate();
              collector.stop();
              return;
            }

            changeButton("first");
            changeButton("load");

            buttons[2].disabled = false;
            buttons[0].disabled = page === 0 && pagination[page].current_item === 0;
            buttons[1].disabled = false;
            buttons[3].disabled = false;

            pagination[page].current_item = pagination[page].max - 1;
          } else {
            page === 0 ? changeButton("first") : changeButton("previous");
            changeButton("last");

            pagination[page].current_item = 0;
          }

          break;
        case "back":
          if (!(buttons[1].disabled && !buttons[0].disabled && !buttons[2].disabled && !buttons[3].disabled)) {
            pagination[page].current_item -= pagination[page].current_item - 1 < 0 ? 0 : 1;
          }

          // Disable if one pagination or at beginning of the page.
          buttons[0].disabled = pagination[page].current_item === 0 && pagination.length === 1;

          // Disable if at beginning of the page;
          buttons[1].disabled = pagination[page].current_item === 0;

          // Always enable
          buttons[2].disabled = false;
          buttons[3].disabled = false;

          // If multiple pagination and at the beginning of a page set emoji to previous;
          if (pagination.length > 1 && pagination[page].current_item === 0) {
            changeButton("previous");
          }

          if ((buttons[3].emoji as GuildEmoji).name === "load") {
            changeButton("load");
            changeButton("load");
          }

          break;
        case "next":
          pagination[page].current_item += pagination[page].current_item + 1 >= pagination[page].max ? 0 : 1;

          // Always enable
          buttons[0].disabled = false;
          buttons[1].disabled = false;

          // If at end of page
          buttons[2].disabled = pagination[page].current_item === pagination[page].max - 1;

          // Disable if all pages are queried
          if (pagination[page].next_page) {
            buttons[3].disabled = false;
          } else {
            buttons[3].disabled = pagination[page].current_item === pagination[page].max - 1;
          }

          pagination[page].current_item === pagination[page].max - 1 ? changeButton("load") : changeButton("last");

          if ((buttons[0].emoji as GuildEmoji).name === "previous") {
            changeButton("first");
          }

          break;
        case "last":
          // Always enable
          buttons[0].disabled = false;
          buttons[1].disabled = false;

          // Always disable
          buttons[2].disabled = true;

          // Disable if all pages are queried
          buttons[3].disabled = !pagination[page].next_page;

          if ((buttons[3].emoji as GuildEmoji).name === "load") {
            changeButton("last");

            buttons[2].disabled = false;
            buttons[0].disabled = false;
            buttons[1].disabled = true;

            if ((buttons[0].emoji as GuildEmoji).name === "first") {
              changeButton("load");
            }

            // If the page does not exist fetch it
            if (!pagination[page + 1]) {
              page += 1;
              const { getData } = args;
              pagination.push(await getData(page + 1, collector));
              pagination[page].current_item = 0;
              changeButton("last");
              changeButton("previous");
            } else {
              pagination[page].current_item = 0;
              changeButton("previous");
              buttons[3].disabled = false;
            }
          } else {
            pagination[page].next_page ? changeButton("load") : changeButton("last");
            pagination[page].current_item = pagination[page].max - 1;
            if ((buttons[0].emoji as GuildEmoji).name === "previous") {
              changeButton("first");
            }
          }

          break;
        case "pagination":
          view = "fullview";

          // For an advanced pagination
          // buttons.forEach((b, i) => (b.disabled = i !== 1));
          pagination[page].current_item = parseInt((i as SelectMenuInteraction).values[0]);
          break;
      }

      // Set buttons
      components[components.length - 1].components = [...buttons];
      components[0].components = [pagination[page].menus[0]];

      let e: APIEmbed;
      if (i.customId === "pagination") {
        e = pagination[page].fullview[+(i as SelectMenuInteraction).values?.[0]];
      } else {
        e = pagination[page].fullview[pagination[page].current_item];
      }

      let options = {
        embeds: view === "preview" ? undefined : [e],
        components: [...components],
      };

      if (options.embeds?.length === 0) {
        await i.update(`I couldn't get any more data.`);
        return;
      }
      await i.update(options);
    } catch (err) {
      console.log(err);
      await handleError(err, i);
    }
  });

  collector.on("end", async (i) => {
    try {
      if (!interaction.channel?.messages.cache.get(`${collector.messageId}`)) {
        return;
      }

      components.forEach((c) => {
        c.components.forEach((x) => (x.disabled = true));
      });
      components[components.length - 1].components = [...buttons];
      if (components.length > 1) {
        components[0].components = [...buttons];
      }

      await interaction.editReply({ components }).catch((e) => console.log(e));
    } catch (err) {
      handleError(err, interaction);
    }
  });

  function changeButton(key: "first" | "back" | "next" | "last" | "previous" | "load") {
    let index: number =
      key === "first" || key === "previous"
        ? 0
        : key === "back"
        ? 1
        : key === "next"
        ? 2
        : key === "last" || key === "load"
        ? 3
        : -1;
    if (index === -1) throw new Error("Button Index Out of Range");

    buttons[index].emoji = emojis?.find((e) => e.name === key) as PartialEmoji;
    buttons[index].label = Label[key];
  }
};

export const createPaginationButtons = (emojis?: Collection<string, GuildEmoji>, ids?: string[]) => {
  ids = ids ?? ["first", "back", "next", "last"];

  const buttons: APIButtonComponent[] = [];
  ids.forEach((id, i) => {
    const emoji = emojis?.find((e) => e.name === id);
    buttons.push({
      type: ComponentType.Button,
      custom_id: `${id}`,
      style: ButtonStyle.Success,
      emoji: { id: emoji?.id, name: emoji?.name ?? undefined },
      label: !emoji ? undefined : `${id[0].toUpperCase() + id.substring(1)}`,
      disabled: i < 2,
    });
  });

  return buttons;
};

export const getEmoji = (emoji: string[]): Collection<string, GuildEmoji> | undefined => {
  const guilds = [
    "891401581650661456",
    "891401535605575781",
    "891819421507674112",
    "891722774593290280",
    "909896674401472532",
    `${process.env.BUDS}`,
  ];

  let emojis: Collection<string, GuildEmoji> | undefined = undefined;

  emojis = client.emojis.cache.filter((e) => {
    return guilds.includes(e.guild.id) && emoji.includes(e.name!);
  });

  return emojis;
};

export const getGuild = (id: string) => {};
