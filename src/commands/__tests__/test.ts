import type { Command } from "../../types";

export default {
 name: "test",
 categories: ["Miscellaneous"],
 cooldown: 10,
 execute: async (interaction) => {
  await interaction.editReply("No tests");
 },
} as Command;
