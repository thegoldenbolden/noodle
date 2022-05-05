import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { useAxios } from "../../utils/functions";
import { Category, Command } from "../../utils/types/discord";

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
        comic = await useAxios(`https://xkcd.com/info.0.json`);
        comic = comic.num ?? 1;
        const random = ~~(Math.random() * (comic - 1)) + 1;
        comic = await useAxios(`https://xkcd.com/${random}/info.0.json`);

        comic = new EmbedBuilder()
          .setColor("Random")
          .setAuthor({
            name: `${comic.safe_title} • ${comic.year}-${comic.month}-${comic.day}`,
            iconURL: "https://xkcd.com/s/0b7742.png",
            url: `https://xkcd.com/${random}/`,
          })
          .setImage(`${comic.img}`)
          .setFooter({ text: `${comic.alt}` });
    }

    const options =
      comic instanceof EmbedBuilder
        ? { embeds: [comic] }
        : { content: `${comic}` };

    await interaction.editReply(options);
  },
  name: "comic",
  category: Category.Miscellaneous,
};
