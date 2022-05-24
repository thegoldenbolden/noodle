import { ButtonStyle } from "discord-api-types/v10";
import { ButtonInteraction, ChatInputCommandInteraction, ComponentType, InteractionCollector } from "discord.js";
import { shuffle } from "lodash";
import { WYR } from "../../utils/constants/collections";
import wyr from "../../utils/constants/wyr.json";

export const run = async (interaction: ChatInputCommandInteraction) => {
 let user = WYR.get(`${interaction.user.id}`);

 if (!user) {
  WYR.set(`${interaction.user.id}`, new Map());
  user = WYR.get(`${interaction.user.id}`);
  const timeout = setTimeout(() => {
   WYR.delete(`${interaction.user.id}`);
   clearTimeout(timeout);
  }, 60000 * 60 * 3);
 }

 let shuffled = shuffle(wyr.data);
 let display = shuffled.find((question) => !user?.has(question.id));
 if (!display) {
  user?.clear();
  display = shuffled[0];
 }

 user?.set(display.id, true);
 await interaction.editReply({
  content: `Would you rather ${display.question}`,
  components: [
   {
    type: ComponentType.ActionRow,
    components: [
     {
      type: ComponentType.Button,
      customId: `WYR-${interaction.user.id}`,
      style: ButtonStyle.Primary,
      label: "New Question",
     },
    ],
   },
  ],
 });

 const collector = new InteractionCollector(interaction.client, {
  idle: 60000 * 3,
  max: 50,
  filter: (i: ButtonInteraction) => i.user.id === interaction.user.id && `WYR-${interaction.user.id}` === i.customId,
 });

 collector.on("collect", async (i: ButtonInteraction) => {
  if (collector.ended) return;
  await i.deferUpdate();

  shuffled = shuffle(wyr.data);
  display = shuffled.find((question) => !user?.has(question.id));
  if (!display) {
   user?.clear();
   display = shuffled[0];
  }

  user?.set(display.id, true);
  await i.editReply(`Would you rather ${display.question}`);
 });

 collector.on("end", (i, r) => {
  if (["messageDelete", "channelDelete", "threadDelete", "guildDelete"].includes(r)) return;

  interaction.editReply({
   components: [
    {
     type: ComponentType.ActionRow,
     components: [
      {
       type: ComponentType.Button,
       customId: `WYR-${interaction.user.id}`,
       style: ButtonStyle.Primary,
       label: "New Question",
       disabled: true,
      },
     ],
    },
   ],
  });
 });
};
