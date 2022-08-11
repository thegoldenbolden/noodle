import { ModalSubmitInteraction } from "discord.js";
import { Submissions } from "../../..";
import BotError from "../../../lib/classes/Error";
import prisma from "../../../lib/prisma";
import { InteractionIds, SubmissionType } from "../../../types";

export default async (interaction: ModalSubmitInteraction) => {
 // Currently only for versus submissions.
 if (!interaction.guild) return;
 if (interaction.customId.startsWith(InteractionIds.Review)) return;

 if (interaction.customId.startsWith(InteractionIds.Submissions)) {
  const type = interaction.customId.split("-")[1] as SubmissionType;
  await handleSubmission(interaction, type);
  return;
 }
};

async function handleSubmission(interaction: ModalSubmitInteraction, type: SubmissionType) {
 let response = "Thanks for your submission! Noodle will eventually review if it is Noodle worthy. :D";

 switch (type) {
  default:
   throw new BotError({ message: "There was an error submitting your data." });
  case "versus":
   const title = interaction.fields.getTextInputValue("title");
   const phrases = [interaction.fields.getTextInputValue("o1"), interaction.fields.getTextInputValue("o2")];
   const description = interaction.fields.getTextInputValue("description");

   // Will support when select menus are enable on modals.
   // const categories = interaction.fields.getField("categories");

   await interaction.reply({ ephemeral: true, content: response });
   await prisma.submission.create({
    data: {
     type: "VERSUS",
     discordId: interaction.user.id,
     data: {
      phrases,
      title,
      description: description.length < 5 ? null : description,
      // categories: categories Will support when select menus are enabled on modals.
     },
    },
   });

   Submissions.send(`There's a new ${type}!`);
   return;
 }
}
