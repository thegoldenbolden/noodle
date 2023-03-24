import { Logs } from "..";
import { randomColor } from "./Helpers";
import { APIEmbed, EmbedBuilder } from "discord.js";
import { Errors } from "..";
import BotError from "./classes/Error";

type Params = { name: string; callback: (...x: any[]) => Promise<any>; params?: any[] };
export const useLog = async ({ name, callback, params = [] }: Params) => {
 const start = Date.now();
 const data = await callback(...params);
 const end = Date.now();
 const duration = (end - start) / 1000;
 const usage = process.memoryUsage().heapUsed / 1024 / 1024;

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

 if (usage >= 20) {
  embed.addFields({
   name: "Memory",
   value: `${usage}`,
  });
 }

 embed.data.fields && Logs.send({ embeds: [embed] });
 return data || null;
};

export const useError = async (err: any, interaction?: any) => {
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
   description: `${err?.name ?? "no name"}:\n\`\`\`js\n${err?.stack}\`\`\``,
  };

  console.log(err);
  Errors.send({ embeds: [embed] });
 }
};
