import { User } from "@prisma/client";
import { ButtonStyle, ComponentType, ModalComponentData, TextInputStyle } from "discord.js";
import { Bot } from "../..";
import BotError from "../../lib/classes/Error";
import error from "../../lib/error";
import prisma from "../../lib/prisma";
import { Command, InteractionIds, SubmissionType } from "../../types";

export default {
 name: "review",
 categories: ["Utility"],
 database: "User",
 execute: async (interaction, user: User) => {
  await interaction.deferReply({ ephemeral: true });
  if (!user) throw new BotError({ message: "Unable to find user." });
  if (user.roles.includes("EDITOR") || user.discordId !== process.env.NOODLE_OWNER) {
   throw new BotError({ message: "You do not have permissions to review bot master tings." });
  }

  const subcommand = interaction.options.getSubcommand(true);

  switch (subcommand) {
   case "submissions":
    let type: string = interaction.options.getString("category", true) as SubmissionType;
    async function createEmbed() {
     const submission = await prisma.submission.findFirst({ where: { pending: "PENDING" } });
     if (!submission) throw new BotError({ message: `There are currently no ${type} submissions.` });
     if (!submission.data) throw new BotError({ message: "No data was found for submission." });
     return {
      submission,
      embeds: [
       {
        author: { name: `${type}` },
        fields: Object.entries(submission).map((a) => ({ name: `${a[0]}`, value: `${JSON.stringify(a[1])}` })),
       },
      ],
     };
    }

    let { embeds, submission } = await createEmbed();

    const ids = [
     `${InteractionIds.Submissions}-APPROVE-${interaction.id}`,
     `${InteractionIds.Submissions}-REJECT-${interaction.id}`,
     `${InteractionIds.Submissions}-NEXT-${interaction.id}`,
    ];

    const message = await interaction.editReply({
     embeds: embeds,
     components: [
      {
       type: ComponentType.ActionRow,
       components: [
        {
         type: ComponentType.Button,
         label: "Approve",
         customId: ids[0],
         style: ButtonStyle.Success,
        },
        {
         type: ComponentType.Button,
         label: "Reject",
         customId: ids[1],
         style: ButtonStyle.Success,
        },
        {
         type: ComponentType.Button,
         label: "Next",
         customId: ids[2],
         style: ButtonStyle.Secondary,
        },
       ],
      },
     ],
    });

    const collector = message.createMessageComponentCollector({
     filter: (i) => i.user.id === interaction.user.id && ids.includes(i.customId),
     idle: 60000,
    });

    collector.on("collect", async (i) => {
     try {
      if (submission === null) return;
      if (i.customId === ids[1]) {
       const modalId = `${InteractionIds.Review}-${type}-${i.id}`;
       const modal: ModalComponentData = {
        title: `Reviewing ${type}`,
        customId: modalId,
        components: [
         {
          type: ComponentType.ActionRow,
          components: [
           {
            style: TextInputStyle.Paragraph,
            label: "Reason",
            customId: "reason",
            placeholder: "Reason for reject",
            type: ComponentType.TextInput,
           },
          ],
         },
        ],
       };

       await i.showModal(modal);
       const response = await i.awaitModalSubmit({
        filter: (int) => int.user.id === i.user.id && int.customId === modalId,
        time: 120000,
       });
       if (!response) throw new BotError({ message: "Unable to get rejected reason." });
       const reason = response.fields.getTextInputValue("reason");
       await prisma.submission.update({
        where: { id: submission.id },
        data: { rejectedReason: reason, pending: "REJECTED" },
       });

       await i.editReply({ content: "Successfully rejected submission.", components: [] });
       return;
      }

      await i.deferReply();
      if (i.customId === ids[0]) {
       await prisma.submission.update({
        where: { id: submission.id },
        data: { pending: "APPROVED" },
       });

       let data;
       if (typeof submission.data === "string") {
        data = JSON.parse(submission.data);
       } else {
        data = submission.data;
       }
       type Keys = "versus";
       const k = await prisma.versus.create({
        data: {
         ...data,
         user: {
          connect: {
           id: submission.userId,
          },
         },
        },
       });

       Bot.games.versus.set(k.id, k);
       let x = await createEmbed();
       submission = x.submission;
       embeds = x.embeds;
       await i.editReply({ embeds: embeds });
       return;
      }

      if (i.customId === ids[2]) {
       let x = await createEmbed();
       submission = x.submission;
       embeds = x.embeds;
       await i.editReply({ embeds: embeds });
      }
     } catch (err: any) {
      error(err, i);
     }
    });
    return;
  }
 },
} as Command;
