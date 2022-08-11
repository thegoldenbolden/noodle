import { APIEmbed, ButtonComponentData, ButtonStyle, ComponentType } from "discord.js";
import getColor from "../color";

export function createEmbed(data: APIEmbed): APIEmbed {
 return {
  ...data,
  color: getColor((data.color as any) ?? null),
 };
}

type ButtonProps = {
 style?: "Danger" | "Primary" | "Secondary" | "Success";
 label: string;
 customId: string;
 emoji?: string | "The emoji id";
};

export function createButtons(btns: ButtonProps[] = []) {
 const buttons: ButtonComponentData[] = [];
 btns.forEach((btn) => {
  buttons.push({
   type: ComponentType.Button,
   customId: btn.customId,
   label: btn.label,
   style: btn.style ? ButtonStyle[btn.style] : ButtonStyle["Primary"],
   emoji: btn.emoji ?? undefined,
  });
 });
 return buttons;
}
