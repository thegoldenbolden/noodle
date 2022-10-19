import { APIGuildMember, GuildMember } from "discord.js";

// Get guild member's displayed role color or a random color.
export default (member: APIGuildMember | GuildMember | null | undefined) => {
 return (member as GuildMember)?.displayColor ?? randomColor();
};

// Get a random decimal / hexadecimal color.
export const randomColor = (type?: "hex") => {
 if (!type) return ~~(Math.random() * 16777215) + 1;
 const r = () => ~~(Math.random() * 256);
 return convertRGBToHex(r(), r(), r());
};

export const convertRGBToHex = (...args: number[] | string[]) => {
 if (!args) args = [0, 0, 0];
 let hex = "";
 const keys: { [key: string]: string } = {
  "10": "A",
  "11": "B",
  "12": "C",
  "13": "D",
  "14": "E",
  "15": "F",
 };

 const lookup = (key: number) => {
  const value: string = `${Math.floor(key)}`;
  return keys[value] ?? value;
 };

 args.forEach((arg) => {
  const value = Number(arg) / 16;
  const remainder = value % (~~value < 1 ? 1 : ~~value);
  hex += lookup(value);
  hex += lookup(remainder * 16);
 });

 return hex;
};
