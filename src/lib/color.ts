import { APIGuildMember, GuildMember } from "discord.js";

export default (member: APIGuildMember | GuildMember | null | undefined) => {
 return (member as GuildMember)?.displayColor ?? randomColor();
};

export const randomColor = (type?: "hex") => {
 if (!type) return ~~(Math.random() * 16777215) + 1;
 const r = () => ~~(Math.random() * 256);
 return convertRGBToHex(r(), r(), r());
};

export const convertRGBToHex = (...args: number[] | string[]) => {
 if (!args) args = [0, 0, 0];
 let hex = "";

 const lookup = (key: number) => {
  return key < 10
   ? `${Math.floor(key)}`
   : key < 11
   ? "A"
   : key < 12
   ? "B"
   : key < 13
   ? "C"
   : key < 14
   ? "D"
   : key < 15
   ? "E"
   : "F";
 };

 args.forEach((arg) => {
  const value = Number(arg) / 16;
  const remainder = value % (~~value < 1 ? 1 : ~~value);
  hex += lookup(value);
  hex += lookup(remainder * 16);
 });

 return hex;
};
