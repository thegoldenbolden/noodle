import {
 ComponentType,
 MentionableSelectMenuComponentData,
 RoleSelectMenuBuilder,
 RoleSelectMenuComponentData,
} from "discord.js";
import { Command } from "../../types";

export default {
 name: "test",
 categories: ["Miscellaneous"],
 cooldown: 10,
 execute: async (interaction) => {
  await interaction.deferReply();

  const roleSelectMenu: MentionableSelectMenuComponentData = {
   customId: "AUTOROLE",
   placeholder: "Select a role",
   type: ComponentType.MentionableSelect,
   maxValues: 25,
  };

  await interaction.editReply({});
 },
} as Command;
