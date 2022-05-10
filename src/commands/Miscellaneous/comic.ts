import { ComponentType } from "discord-api-types/v10";
import { ChatInputCommandInteraction } from "discord.js";
import { BotError } from "../../utils/classes/BotError";
import { basicCollector } from "../../utils/discord";
import { randomColor, useAxios } from "../../utils/functions";
import { createButtons } from "../../utils/functions/Collector";
import { Category, Command } from "../../utils/typings/discord";

export default <Command>{
  name: "comic",
  category: Category.Miscellaneous,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const data: any = await useAxios(`https://xkcd.com/info.0.json`, interaction);
    if (!data) throw new BotError(`Trix are indeed for kids because I encountered a problem.`);

    const number = data?.num ?? 1;
    const random = ~~(Math.random() * (number - 1)) + 1;
    let comic: any = await useAxios(`https://xkcd.com/${random}/info.0.json`, interaction);
    if (!comic) throw new BotError(`Trix are indeed for kids because I encountered a problem.`);

    const shuffle = createButtons(interaction, ["shuffle"])?.buttons;
    shuffle[0].label = "New Comic";
    shuffle[0].custom_id = `comic.${interaction.id}`;

    await basicCollector({
      interaction,
      ephemeral: false,
      ids: [`comic.${interaction.id}`],
      options: {
        embeds: [
          {
            color: randomColor(),
            author: {
              name: `${comic.safe_title} • ${comic.year}-${comic.month}-${comic.day}`,
              icon_url: "https://xkcd.com/s/0b7742.png",
              url: `https://xkcd.com/${random}/`,
            },
            image: {
              url: `${comic.img}`,
            },
            footer: { text: `${comic.alt}` },
          },
        ],
        components: [{ type: ComponentType.ActionRow, components: shuffle }],
      },
      collect: async (i) => {
        const random = ~~(Math.random() * (number - 1)) + 1;
        let comic: any = await useAxios(`https://xkcd.com/${random}/info.0.json`, interaction);
        if (!comic) throw new BotError(`Trix are indeed for kids because I encountered a problem.`);

        return {
          embeds: [
            {
              color: randomColor(),
              author: {
                name: `${comic.safe_title} • ${comic.year}-${comic.month}-${comic.day}`,
                icon_url: "https://xkcd.com/s/0b7742.png",
                url: `https://xkcd.com/${random}/`,
              },
              image: {
                url: `${comic.img}`,
              },
              footer: { text: `${comic.alt}` },
            },
          ],
        };
      },
    });
  },
};
