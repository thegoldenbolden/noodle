import {
 APISelectMenuComponent,
 Collection,
 ComponentType,
 escapeMarkdown,
 InteractionReplyOptions,
 Message,
 ModalSubmitInteraction,
 Options,
 StringSelectMenuComponentData,
 TextChannel,
 WebhookEditMessageOptions,
} from "discord.js";

import { Bot, client } from "..";
import BotError from "../lib/classes/Error";
import { checkSend } from "../lib/discord/permissions";
import getColor from "../lib/color";
import path from "path";

export default async (interaction: ModalSubmitInteraction) => {
 if (!interaction.guild) return;
 const userId = interaction.user.id;

 switch (interaction.customId) {
  default:
   return;
  case "AUTOROLE-EDIT":
   type ModalEdit = Collection<string, { channel: TextChannel; message: Message<true> }>;
   const patch = (Bot.modals as ModalEdit).get(`${userId}-AUTOROLE-EDIT`);
   if (!patch || !patch.message) throw new BotError({ message: "We couldn't update the message" });

   checkSend(interaction, patch.channel);
   const edit = editData(interaction, patch.message);

   if (edit.placeholder.length > 0) {
    edit.options.components = [
     {
      type: ComponentType.ActionRow,
      components: [
       {
        ...(patch.message.resolveComponent("AUTOROLE")?.data as Readonly<APISelectMenuComponent>),
        placeholder: edit.placeholder,
       },
      ],
     },
    ];
   }

   await patch.message.edit(edit.options);
   await interaction.reply({
    ephemeral: true,
    content: `Successfully edited autorole. Below is an escaped version of your message in case you decide to edit the autorole later.\n\n${edit.escaped}`,
   });
   Bot.modals.delete(`${interaction.user.id}-AUTOROLE-CREATE`);
   return;
  case "AUTOROLE":
   let autorole = Bot.modals.get(`${userId}-AUTOROLE-CREATE`);
   if (!autorole) throw new Error("We couldn't send the roles");

   const create = editData(interaction);

   if (create.placeholder.length > 0) autorole.placeholder = create.placeholder;
   create.options.components = [{ type: ComponentType.ActionRow, components: [autorole] }];

   await interaction.reply(create.options as InteractionReplyOptions);
   await interaction.followUp({
    ephemeral: true,
    content: `Successfully created autorole. Below is an escaped version of your message in case you decide to edit.\n\n${create.escaped}`,
   });

   Bot.modals.delete(`${interaction.user.id}-AUTOROLE-CREATE`);
   return;
 }
};

type EditData = { options: WebhookEditMessageOptions; placeholder: string; escaped: string };
function editData(interaction: ModalSubmitInteraction, patch?: Message<true>): EditData {
 const message = interaction.fields.getTextInputValue("message");
 const placeholder = interaction.fields.getTextInputValue("placeholder");
 const embed = interaction.fields.getTextInputValue("embed");
 const title = interaction.fields.getTextInputValue("title");
 const options: WebhookEditMessageOptions | InteractionReplyOptions = { embeds: [] };

 options.content = message.length > 0 ? message : patch?.content ?? null;
 options.embeds = patch?.embeds ?? [];

 if (options.embeds.length > 0) {
  options.content = null;
  options.embeds[0] = {
   ...patch?.embeds[0],
   description: message.length > 0 ? message : patch?.embeds[0].description ?? "Please select a role(s)",
   author: {
    name: title.length > 0 ? title : patch?.embeds[0].author?.name ?? "Role Select Menu",
    icon_url: interaction.guild?.iconURL() ?? "",
   },
   color: getColor(interaction.guild?.members.me),
  };
 }

 switch (embed) {
  case "no":
   options.embeds = [];
   break;
  case "yes":
   options.embeds?.push({
    author: { name: title.length > 0 ? title : "Role Select Menu", icon_url: interaction.guild?.iconURL() ?? "" },
    description: message.length > 0 ? message : patch?.content ?? "Please select a role(s)",
    color: getColor(interaction.guild?.members?.me),
   });
   options.content = null;
 }

 return { placeholder, options, escaped: escapeMarkdown(message) };
}
