import { type APIEmbed, EmbedBuilder } from "discord.js";
import { randomColor } from "./utils";
import { BotError } from "./error";
import { Logs } from "..";
import type { TODO } from "../types";

type Params = {
  name: string;
  callback: (...x: TODO[]) => Promise<TODO>;
  params?: TODO[];
};

export const time = async ({ name, callback, params = [] }: Params) => {
  const start = Date.now();
  const data = await callback(...params);
  const end = Date.now();
  const duration = (end - start) / 1000;

  const embed = new EmbedBuilder({
    title: name,
    color: randomColor() as number,
  });

  embed.setTimestamp();

  if (duration > 1) {
    embed.addFields({
      name: "Duration",
      value: `${((end - start) / 1000).toFixed(2)} seconds..`,
      inline: true,
    });
  }

  embed.data.fields && Logs.send({ embeds: [embed] });
  return data || null;
};

export const log = async (err: TODO, interaction?: TODO) => {
  const message =
    err instanceof BotError ? err.message : "D: A noodle was burned...";

  if (interaction) {
    !interaction.deferred &&
      (await interaction.deferReply({ ephemeral: true }));
    await interaction.editReply(message);
  }

  if ((err instanceof BotError && err.log) || !(err instanceof BotError)) {
    const embed: APIEmbed = {
      color: 0xff0000,
      title: `${
        (err as BotError).command ?? interaction
          ? interaction.commandName
          : "No command name"
      }`,
      author: {
        name: `${interaction?.user.username}`,
        icon_url: `${interaction?.user.displayAvatarURL() || ""}`,
      },
      description: `${err?.name ?? "no name"}:\n\`\`\`js\n${err?.stack}\`\`\``,
    };

    console.log(err);
    Logs.send({ embeds: [embed] });
  }
};
