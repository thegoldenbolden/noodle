import { ComponentType, ModalComponentData, TextInputStyle } from "discord.js";
import BotError from "../../lib/classes/Error";
import { Command, InteractionIds, SubmissionType } from "../../types";

export default {
 name: "submissions",
 categories: ["Utility"],
 database: "User",
 execute: async (interaction, user) => {
  if (!user) return;
  const type = interaction.options.getString("category", true) as SubmissionType;
  const modal = await createModal(type);
  await interaction.showModal(modal);

  async function createModal(type: SubmissionType): Promise<ModalComponentData> {
   const ids = [`${InteractionIds.Submissions}-${type}-${interaction.id}`];
   switch (type) {
    default:
     throw new BotError({ message: "Invalid Submission Category" });
    case "versus":
     return {
      title: "Versus",
      customId: ids[0],
      components: [
       {
        type: ComponentType.ActionRow,
        components: [
         {
          type: ComponentType.TextInput,
          customId: `title`,
          label: "Title",
          placeholder: "Enter a title",
          minLength: 2,
          maxLength: 100,
          required: true,
          style: TextInputStyle.Short,
         },
        ],
       },
       {
        type: ComponentType.ActionRow,
        components: [
         {
          type: ComponentType.TextInput,
          customId: `o1`,
          label: "Opponent 1",
          placeholder: "Enter the first opponent",
          minLength: 2,
          maxLength: 100,
          required: true,
          style: TextInputStyle.Short,
         },
        ],
       },
       {
        type: ComponentType.ActionRow,
        components: [
         {
          type: ComponentType.TextInput,
          customId: `o2`,
          label: "Opponent 2",
          placeholder: "Enter the second opponent",
          minLength: 2,
          maxLength: 100,
          required: true,
          style: TextInputStyle.Short,
         },
        ],
       },
       {
        type: ComponentType.ActionRow,
        components: [
         {
          type: ComponentType.TextInput,
          customId: `description`,
          label: "Description",
          required: false,
          placeholder: "Enter a description",
          minLength: 5,
          style: TextInputStyle.Short,
         },
        ],
       },
      ],
     };
   }
  }
 },
} as Command;

// Modal Select Menu for Versus
/**
	* 
	       type: ComponentType.SelectMenu,
          customId: "categories",
          options: [
           {
            label: `Movies & Shows`,
            value: `MoviesAndShow`,
           },
           {
            label: "Games & Comics",
            value: "GamesAndComics",
           },
           {
            label: "Food & Drink",
            value: "FoodAndDrink",
           },
           {
            label: "Music & Art",
            value: "MusicAndArt",
           },
           {
            label: "Science & Nature",
            value: "ScienceAndNature",
           },
           {
            label: "Animals",
            value: "Animals",
           },
           {
            label: "Lifestyle",
            value: "Lifestyle",
           },
           {
            label: "Pain",
            value: "Pain",
           },
           {
            label: "Worldwide",
            value: "Worldwide",
           },
           {
            label: "Celebrities",
            value: "Celebrities",
           },
           {
            label: "Historical",
            value: "Historical",
           },
           {
            label: "Fashion",
            value: "Fashion",
           },
           {
            label: "Sports",
            value: "Sports",
           },
           {
            label: "Fantasy",
            value: "Fantasy",
           },
           {
            label: "Religion",
            value: "Religion",
           },
          ],
          placeholder: "Choose categories",
          minValues: 0,
          maxValues: 15,
 */
