import type { Command } from "../../types";

import {
 AttachmentBuilder,
 ChatInputCommandInteraction,
 Collection,
 EmbedBuilder,
 MessageEditOptions,
} from "discord.js";

import { createCanvas } from "canvas";
import { fetcher } from "../../lib/fetcher";

type ColorMessage = { embed: any; attachment: any };
const Colors: Collection<string, ColorMessage> = new Collection();

const command: Command = {
 name: "color",
 categories: ["Miscellaneous"],
 async execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  let color = interaction.options.getString("value");
  const params = color?.match(/(#?([A-Fa-f0-9]{0,6}))|(\d{1,3}[^,]?\S*?)/g);
  color = getColor(params);

  if (!color) {
   await interaction.editReply({
    content: `Try typing a hex value: 6 characters consisting of (0-9,A-F) \`ex. #fa9c21\`\nTry typing a rgb value: 3 numbers from (0-255) \`20, 39, 231\`.`,
   });
   return;
  }

  const canvas = createCanvas(600, 150);
  const ctx = canvas.getContext("2d");
  const options: MessageEditOptions = {};
  color ??= `hex=${hexColor()}`;

  let d = Colors.get(`${color}`);

  if (!d) {
   const response = await fetcher({
    interaction,
    name: `Color ${color}`,
    url: `https://www.thecolorapi.com/id?${color}`,
   });

   const { hex, rgb, hsl, hsv, cmyk, XYZ, name, contrast } = response.data;

   const embed = new EmbedBuilder().setColor([rgb.r, rgb.g, rgb.b]).setFields([
    { name: "Hex", value: `${hex.value}`, inline: true },
    {
     name: "HSL",
     value: `${hsl.h}%, ${hsl.s}%, ${hsl.l}%`,
     inline: true,
    },
    {
     name: "HSV",
     value: `${hsv.h}, ${hsv.s}%, ${hsv.v}%`,
     inline: true,
    },
    {
     name: "RGB",
     value: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
     inline: true,
    },
    {
     name: "CMYK",
     value: `${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}`,
     inline: true,
    },
    {
     name: "XYZ",
     value: `${XYZ.X}, ${XYZ.Y}, ${XYZ.Z}`,
     inline: true,
    },
   ]);

   curvedRect({
    x: 0,
    y: 0,
    width: 600,
    height: 150,
    rounded: 10,
    ctx,
   });
   ctx.clip();

   ctx.fillStyle = hex.value;
   ctx.fill("nonzero");
   ctx.fillStyle = contrast.value;
   ctx.textAlign = "center";

   if (name.exact_match_name) {
    ctx.font = "32px sans-serif";
    ctx.fillText(`${name.value}`, 290, 85);
   } else {
    ctx.font = "20px sans-serif";
    ctx.fillText(`${hex.value}`, 160, 80);
    ctx.lineWidth = 6;
    ctx.strokeStyle = contrast.value;
    ctx.beginPath();
    ctx.moveTo(325, 0);
    ctx.lineTo(325, 150);
    ctx.stroke();
    ctx.fillStyle = name.closest_named_hex;
    ctx.fillRect(325, 0, 275, 175);
    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = contrast.value;
    ctx.fillText(`Closest Named Hex`, 458, 45);
    ctx.fillText(`${name.value}`, 458, 80);
    ctx.fillText(`${name.closest_named_hex}`, 458, 115);
   }

   const attachment = new AttachmentBuilder(canvas.toBuffer(), {
    name: "color.png",
    description: `image of the color ${color}`,
   });
   embed.setImage(`attachment://color.png`);
   Colors.set(`${color}`, { embed, attachment });
   d = Colors.get(`${color}`);

   const timeout = setTimeout(() => {
    Colors.delete(`${color}`);
    clearTimeout(timeout);
   }, 1000 * 10);
  }

  options.content =
   !d?.embed && !d?.attachment ? "An oopsie happened.." : undefined;
  options.embeds = d?.embed ? [d.embed] : [];
  options.files = d?.attachment ? [d.attachment] : [];

  await interaction.editReply({ ...options });
 },
};

type CurvedRect = {
 x: number;
 y: number;
 width: number;
 height: number;
 rounded: number;
 ctx: any;
};

function curvedRect({ x, y, width, height, rounded, ctx }: CurvedRect) {
 const halfRadians = (2 * Math.PI) / 2;
 const quarterRadians = (2 * Math.PI) / 4;

 ctx.arc(rounded + x, rounded + y, rounded, -quarterRadians, halfRadians, true);

 ctx.lineTo(x, y + height - rounded);
 ctx.arc(
  rounded + x,
  height - rounded + y,
  rounded,
  halfRadians,
  quarterRadians,
  true
 );

 ctx.lineTo(x + width - rounded, y + height);
 ctx.arc(
  x + width - rounded,
  y + height - rounded,
  rounded,
  quarterRadians,
  0,
  true
 );

 ctx.lineTo(x + width, y + rounded);
 ctx.arc(x + width - rounded, y + rounded, rounded, 0, -quarterRadians, true);

 ctx.lineTo(x + rounded, y);
}

function hexColor(): string {
 const code = "ABCDEF0123456789";
 let hex = "";
 for (let i = 0; hex.length < 6; i++) {
  let char = ~~(Math.random() * code.length);
  hex += `${code.charAt(char)}`;
 }
 return hex;
}

function getColor(params: string[] | undefined | null): string | null {
 if (params == null) return `hex=${hexColor()}`;
 params = params.filter((p) => p.trim().length !== 0);
 if (params.length === 3) {
  const inRange = params.every((e) => {
   return (
    e.replace(/\s+/g, "").length <= 3 && e.replace(/\s+/g, "").length >= 1
   );
  });

  if (inRange) {
   return params.every((e) => ~~+e.trim() >= 0 && ~~+e.trim() <= 255)
    ? `rgb=${params.map((c) => c.trim()).join(",")}`
    : null;
  }

  return null;
 }

 if (params[0]) {
  if (params[0].startsWith("#")) {
   params[0] = params[0].slice(1);
  }

  if (params[0].length >= 6) {
   params[0] = params[0].slice(0, 6);
   return `hex=${params[0]}`;
  }

  if (params[0].length == 3) {
   return `hex=${params[0]}`;
  }

  params[0] = params[0].trim();
  params[0] = params[0].padStart(6, "0");
  return `hex=${params[0]}`;
 }

 return null;
}

export default command;
