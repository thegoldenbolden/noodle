import { createCanvas } from "canvas";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import useAxios from "../../lib/axios";
import BotError from "../../lib/classes/Error";
import { Colors } from "../../lib/cache";
import { convertRGBToHex, randomColor } from "../../lib/color";
import { Command } from "../../types";
type CurvedRect = {
 x: number;
 y: number;
 width: number;
 height: number;
 rounded: number;
 ctx: any;
};

export default {
 name: "color",
 categories: ["Miscellaneous"],
 execute: async (interaction) => {
  await interaction.deferReply();
  const baseUrl = "https://api.color.pizza/v1";
  let color: string | null = null;
  let options = interaction.options.data?.[0] as { name: string; value?: string };
  if (!options) options = { name: "random" };

  switch (options.name) {
   default:
    color = `${randomColor("hex")}`;
    break;
   case "name":
    color = `${options?.value}`;
    break;
   case "hex":
   case "rgb":
    let v: any = options.value?.match(/(#?([A-Fa-f0-9]{0,6}))|(\d{1,3}[^,]?\S*?)/g);
    color = getColor(v);
  }

  if (color === null || color === "") {
   throw new BotError({ message: "An invalid color was provided." });
  }

  const canvas = createCanvas(600, 150);
  const ctx = canvas.getContext("2d");
  const data = await drawColor(color);
  await interaction.editReply({ ...data });

  function curvedRect({ x, y, width, height, rounded, ctx }: CurvedRect) {
   const halfRadians = (2 * Math.PI) / 2;
   const quarterRadians = (2 * Math.PI) / 4;
   ctx.arc(rounded + x, rounded + y, rounded, -quarterRadians, halfRadians, true);
   ctx.lineTo(x, y + height - rounded);
   ctx.arc(rounded + x, height - rounded + y, rounded, halfRadians, quarterRadians, true);
   ctx.lineTo(x + width - rounded, y + height);
   ctx.arc(x + width - rounded, y + height - rounded, rounded, quarterRadians, 0, true);
   ctx.lineTo(x + width, y + rounded);
   ctx.arc(x + width - rounded, y + rounded, rounded, 0, -quarterRadians, true);
   ctx.lineTo(x + rounded, y);
  }

  function getColor(params: string[] | undefined | null): string | null {
   if (params == null) return null;
   params = params.filter((p) => p.trim().length !== 0);
   if (params.length === 3) {
    const inRangeLength = params.every((e) => e.replace(/\s+/g, "").length <= 3 && e.replace(/\s+/g, "").length >= 1);
    const inRangeSize = params.every((e) => ~~+e.trim() >= 0 && ~~+e.trim() <= 255);
    if (!inRangeLength || !inRangeSize) return null;
    return convertRGBToHex(params[0], params[1], params[2]);
   }

   if (params[0]) {
    if (params[0].startsWith("#")) {
     params[0] = params[0].slice(1);
    }

    params[0] = params[0].slice(0, 6);
    params[0] = params[0].trim();
    params[0] = params[0].padStart(6, "0");
    return `${params[0]}`;
   }

   return null;
  }

  async function drawColor(color: string) {
   let d: any = Colors.get(`${color}`);
   if (!d) {
    const { colors } = await useAxios({
     name: "Color",
     url: `${baseUrl}/${options.name == "name" ? `names/${color}` : `${color}`}`,
    });

    if (colors.length == 0) throw new BotError({ message: "No colors were found." });
    const { hex, name, hsl, rgb } = colors[0];
    const embed: EmbedBuilder = new EmbedBuilder().setColor(hex);

    curvedRect({
     x: 0,
     y: 0,
     width: 600,
     height: 150,
     rounded: 10,
     ctx,
    });

    const hexWithoutPound = hex.substring(1);

    ctx.clip();
    ctx.fillStyle = `#${options.name == "name" ? hexWithoutPound : color}`;
    ctx.fill("nonzero");
    const contrast = getContrast(rgb);
    ctx.fillStyle = contrast;
    ctx.textAlign = "center";

    if (options.name == "name" || hexWithoutPound.toLowerCase() === color.toLowerCase()) {
     ctx.font = "32px sans-serif";
     ctx.fillText(`${name}`, 290, 85);
     embed.setAuthor({ name });
     embed.setColor(hex);
     embed.setFields([
      { name: "Hex", value: `${hex}`, inline: true },
      {
       name: "HSL",
       value: `${hsl.h.toFixed(0)}%, ${hsl.s.toFixed(0)}%, ${hsl.l.toFixed(0)}%`,
       inline: true,
      },
      {
       name: "RGB",
       value: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
       inline: true,
      },
     ]);
    } else {
     ctx.font = "20px sans-serif";
     ctx.fillText(`#${color}`, 160, 80);
     ctx.lineWidth = 6;
     ctx.strokeStyle = contrast;
     ctx.beginPath();
     ctx.moveTo(325, 0);
     ctx.lineTo(325, 150);
     ctx.stroke();
     ctx.fillStyle = `${hex}`;
     ctx.fillRect(325, 0, 275, 175);
     ctx.font = "bold 16px sans-serif";
     ctx.fillStyle = contrast;
     ctx.fillText(`Closest Named Hex`, 458, 45);
     ctx.fillText(`${hex}`, 458, 80);
     ctx.fillText(`${name}`, 458, 115);
    }
    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "color.png" });
    embed.setImage(`attachment://color.png`);
    Colors.set(`${color}`, { embed, attachment });
    d = Colors.get(`${color}`);

    const timeout = setTimeout(() => {
     Colors.delete(`${color}`);
     clearTimeout(timeout);
    }, 1000 * 10);
   }

   return {
    content: !d?.embed && !d?.attachment ? "An oopsie happened.." : undefined,
    embeds: d?.embed ? [d.embed] : [],
    files: d?.attachment ? [d.attachment] : [],
   };

   function getContrast({ r, g, b }: { r: number; g: number; b: number }) {
    if (r * 0.299 + g * 0.587 + b * 0.114 > 186) return "black";
    return "white";
   }
  }
 },
} as Command;
