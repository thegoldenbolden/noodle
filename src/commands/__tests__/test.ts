import { APIEmbed } from "discord.js";
import Kitsu from "kitsu";
import BotError from "../../lib/classes/Error";
import getColor from "../../lib/color";
import { convertMinutes } from "../../lib/ordinal";
import { Command } from "../../types";

const api = new Kitsu();
let API_Timeout: number | null = null;

export default {
 name: "anime",
 categories: ["Miscellaneous"],
 cooldown: 10,
 execute: async (interaction) => {
  console.log(interaction);
 },
} as Command;
