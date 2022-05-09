import { APIEmbed } from "discord-api-types/v10";
import { ChatInputCommandInteraction } from "discord.js";
import { randomColor, useAxios } from "../../utils/functions";
import { Category, Command } from "../../utils/typings/discord";

export default <Command>{
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const choice = interaction.options.get("category", true).value;

    let comic;
    switch (choice) {
      case "explosm":
        comic = ~~(Math.random() * 5894 - 39) + 39;
        comic = `https://explosm.net/comics/${comic}/`;
        break;
      case "xkcd":
        comic = await useAxios(`https://xkcd.com/info.0.json`, interaction);
        comic = comic.num ?? 1;
        const random = ~~(Math.random() * (comic - 1)) + 1;
        comic = await useAxios(`https://xkcd.com/${random}/info.0.json`, interaction);

        comic = {
          color: randomColor(),
          author: {
            name: `${comic.safe_title} • ${comic.year}-${comic.month}-${comic.day}`,
            iconURL: "https://xkcd.com/s/0b7742.png",
            url: `https://xkcd.com/${random}/`,
          },
          image: {
            url: `${comic.img}`,
            footer: { text: `${comic.alt}` },
          },
        } as APIEmbed;
    }

    await interaction.editReply({
      content: choice === "explosm" ? `${comic}` : undefined,
      embeds: choice === "xkcd" ? [comic as APIEmbed] : [],
    });
  },
  name: "comic",
  category: Category.Miscellaneous,
};
