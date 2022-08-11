import { intlFormat } from "date-fns";
import { ComponentType } from "discord.js";
import { Bot } from "../../..";
import BotError from "../../../lib/classes/Error";
import { createButtons, createEmbed } from "../../../lib/discord";
import prisma from "../../../lib/prisma";
import { Subcommand } from "../../../types";

const Versus: Subcommand = async (interaction) => {
 const versus = Bot.games.versus.random();
 if (!versus) throw new BotError({ message: "We had trouble loading a matchup." });

 const buttons = createButtons(
  versus.matchups.map((matchup, i) => ({
   label: matchup,
   style: i == 0 ? "Danger" : "Success",
   customId: `${interaction.id}-${i}`,
  }))
 );

 const author = !versus.user?.name ? "Noodle" : versus.user.private ? "Private User" : versus.user.name;
 const btns = { type: ComponentType.ActionRow, components: buttons };

 const cats = `${(versus as any).categories
  .map((c: string) => `\*\*\`\`${c.split(/(?=[A-Z])/).join(" ")}\`\`\*\*`)
  .join(", ")}\n`;

 const embed = createEmbed({
  title: `${versus.title}`,
  description: cats.length == 0 && !versus.description ? undefined : `${cats}${versus.description ?? ""}`,
  color: interaction.guild?.members.me as any,
  fields: versus.matchups.map((matchup) => ({ inline: true, name: `${matchup}`, value: "Interact to See Votes" })),
  footer: {
   text: `${author} • ${intlFormat(versus.createdAt, { localeMatcher: "best fit" })}`,
  },
 });

 const send = await interaction.editReply({ embeds: [embed], components: [btns] });
 const response = send.createMessageComponentCollector({
  filter: (i) => i.customId.startsWith(interaction.id),
  time: 60000,
  idle: 20000,
 });

 const voted: string[] = [];
 response.on("collect", async (i) => {
  await i.deferReply({ ephemeral: true });
  if (i.user.id && voted.includes(i.user.id)) {
   await i.editReply("You already voted on this interaction.");
   return;
  }

  voted.push(i.user.id);
  if (i.customId.endsWith("0")) {
   versus.votes[0] += 1;
  } else {
   versus.votes[1] += 1;
  }

  await prisma.versus.update({
   where: { id: versus?.id },
   data: { votes: versus.votes },
  });

  const getPercentage = (x: number) => ((x / versus.votes.reduce((a, b) => a + b, 0)) * 100).toFixed(0);
  const { votes } = versus;

  await i.editReply({
   content: `${versus.matchups
    .map((matchup, i) => `(${getPercentage(votes[i])}% - ${votes[i]} ${votes[i] == 1 ? "user" : "users"}): \*\*${matchup}\*\*`)
    .join("\n")}`,
   components: [],
  });
 });

 response.on("end", (i, reason) => {
  if (reason != "time" && reason != "idle") return;
  interaction.editReply({
   components: [
    {
     type: ComponentType.ActionRow,
     components: buttons.map((b) => ({ ...b, disabled: true })),
    },
   ],
  });
 });
};

export default Versus;
