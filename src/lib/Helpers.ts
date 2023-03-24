import { type APIGuildMember, type GuildMember, Collection } from "discord.js";
import BotError from "./classes/Error";

export const convertMinutes = (time: number) => {
 return {
  days: ~~(time / 24 / 60),
  hours: +((time / 60) % 24).toFixed(0),
  minutes: time % 60,
 };
};

export const ordinal = (number: number): string => {
 const [x, y] = [number % 10, number % 100];
 return x == 1 && y !== 11 ? `st` : x == 2 && y != 12 ? `nd` : x == 3 && y != 13 ? `rd` : `th`;
};

export const truncate = (string: string, limit: number) => {
 if (string.length < limit) return string;
 return string.slice(0, limit) + "...";
};

export const getColor = (member: APIGuildMember | GuildMember | null | undefined) => {
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

export const getInt = (num: string | number) => {
 if (typeof num === "number") return num;
 let int = parseInt(num);
 if (isNaN(int)) throw new BotError({ message: "Oops", log: true, info: `Couldn't convert ${num} to integer` });
 return int;
};

export const createCustomId = (command: string, options: { args?: string; user?: string }) => {
 let id = `${command}-`;
 options.user && id + `${options.user}-`;
 options.args && id + `${options.args}`;
 return id;
};

export const createPagination = (data: any[], elements: number = 1, transform: (e: any, idx: number) => any): any[] => {
 let array = [...data];

 if (data instanceof Collection) {
  array = data.map((e) => e);
 }

 const length = array.length;
 let replace: any[] = [];
 for (let i = 0; i < length; i += elements) {
  let spliced = array.splice(0, elements);

  if (transform) {
   spliced = spliced.map((element, index) => transform(element, index));
  }

  replace = [...replace, spliced];
 }

 return replace;
};

export const isPropValuesEqual = (subject: any[], target: any[], propNames: any[]) => {
 return propNames.every((propName) => subject[propName] === target[propName]);
};

export const getUniqueItemsByProperties = (items: any[], propNames: string[]) => {
 return items.filter((i, idx, a) => idx === a.findIndex((found) => isPropValuesEqual(found, i, Array.from(propNames))));
};
