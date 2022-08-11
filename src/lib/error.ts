import { APIEmbed } from "discord.js";
import { Errors } from "../";
import BotError from "./classes/Error";

export default async (err: BotError | Error, interaction?: any) => {
 const message = err instanceof BotError ? err.message : "D: A noodle was burned...";
 if (interaction) {
  !interaction.deferred && (await interaction.deferReply({ ephemeral: true }));
  await interaction.editReply(message);
 }

 if ((err instanceof BotError && err.log) || !(err instanceof BotError)) {
  const embed: APIEmbed = {
   color: 0xff0000,
   title: `${(err as BotError).command ?? interaction ? interaction.commandName : "No command name"}`,
   author: {
    name: `${interaction?.user.username}`,
    icon_url: `${interaction?.user.displayAvatarURL()}`,
   },
   description: `\`\`\`js\n${err.stack}\`\`\``,
  };

  Errors.send({ embeds: [embed] });
 }
};
