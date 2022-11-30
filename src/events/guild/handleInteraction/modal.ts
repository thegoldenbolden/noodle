import {
 ChatInputCommandInteraction,
 Collection,
 ComponentType,
 escapeMarkdown,
 Message,
 ModalSubmitInteraction,
 TextChannel,
} from "discord.js";
import { Bot } from "../../..";
import BotError from "../../../lib/classes/Error";
import { checkSend } from "../../../lib/discord/permissions";

export default async (interaction: ModalSubmitInteraction) => {
 if (!interaction.guild) return;
 const userId = interaction.user.id;

 switch (interaction.customId) {
  default:
   return;
  case "AUTOROLE-EDIT":
   type ModalEdit = Collection<string, { channel: TextChannel; message: Message<true> }>;
   const edit = (Bot.modals as ModalEdit).get(`${userId}-AUTOROLE-EDIT`);
   if (!edit || !edit.message) throw new BotError({ message: "We couldn't update the message" });

   checkSend(interaction, edit.channel);

   const msg = interaction.fields.getTextInputValue("message");

   await edit.message.edit({ content: interaction.fields.getTextInputValue("message") });
   await interaction.reply({
    ephemeral: true,
    content:
     "Successfully created autorole. Below is an escaped version of your message in case you decide to edit the autorole later.\n\n" +
     escapeMarkdown(msg),
   });
   Bot.modals.delete(`${interaction.user.id}-AUTOROLE-CREATE`);
   return;
  case "AUTOROLE":
   let autorole = Bot.modals.get(`${userId}-AUTOROLE-CREATE`);
   if (!autorole) throw new Error("We couldn't send the roles");

   const create = interaction.fields.getTextInputValue("message");

   await interaction.reply({
    content:
     "Successfully created autorole. Below is an escaped version of your message in case you decided to edit.\n\n" +
     escapeMarkdown(create),
    components: [
     {
      type: ComponentType.ActionRow,
      components: [autorole],
     },
    ],
   });

   Bot.modals.delete(`${interaction.user.id}-AUTOROLE-CREATE`);
   return;
 }
};
