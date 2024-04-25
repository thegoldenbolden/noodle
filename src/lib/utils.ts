import { type APIGuildMember, type GuildMember, Collection } from "discord.js";
import { BotError } from "./error";
import type { TODO } from "../types";

export function convertMinutes(time: number) {
  return {
    days: ~~(time / 24 / 60),
    hours: +((time / 60) % 24).toFixed(0),
    minutes: time % 60,
  };
}

export function ordinal(number: number): string {
  const [x, y] = [number % 10, number % 100];
  return x === 1 && y !== 11
    ? "st"
    : x === 2 && y !== 12
    ? "nd"
    : x === 3 && y !== 13
    ? "rd"
    : "th";
}

export function truncate(string: string, limit: number) {
  if (string.length < limit) return string;
  return `${string.slice(0, limit)}...`;
}

export function getColor(
  member: APIGuildMember | GuildMember | null | undefined
) {
  return (member as GuildMember)?.displayColor ?? randomColor();
}

// Get a random decimal / hexadecimal color.
export function randomColor(type?: "hex") {
  if (!type) return ~~(Math.random() * 16777215) + 1;
  const r = () => ~~(Math.random() * 256);
  return convertRGBToHex(r(), r(), r());
}

export function convertRGBToHex(...args: number[] | string[]) {
  const values = !args ? [0, 0, 0] : args;
  let hex = "";
  const keys: { [key: string]: string } = {
    "10": "A",
    "11": "B",
    "12": "C",
    "13": "D",
    "14": "E",
    "15": "F",
  };

  function lookup(key: number) {
    const value: string = `${Math.floor(key)}`;
    return keys[value] ?? value;
  }

  for (const code of values) {
    const value = Number(code) / 16;
    const remainder = value % (~~value < 1 ? 1 : ~~value);
    hex += lookup(value);
    hex += lookup(remainder * 16);
  }
  return hex;
}

export function getInt(num: string | number) {
  if (typeof num === "number") return num;
  const int = Number.parseInt(num);
  if (Number.isNaN(int))
    throw new BotError({
      message: "Oops",
      log: true,
      info: `Couldn't convert ${num} to integer`,
    });
  return int;
}

export function createCustomId(
  command: string,
  options: { args?: string; user?: string }
) {
  const id = [command];
  const args = Object.values(options);
  for (const arg of args) {
    id.push(arg);
  }

  return id.join("-");
}

export function createPagination(
  data: TODO[],
  transform: (e: TODO, idx: number) => TODO,
  elements = 1
): TODO[] {
  let array = [...data];

  if (data instanceof Collection) {
    array = data.map((e) => e);
  }

  const length = array.length;
  let replace: TODO[] = [];
  for (let i = 0; i < length; i += elements) {
    let spliced = array.splice(0, elements);

    if (transform) {
      spliced = spliced.map((element, index) => transform(element, index));
    }

    replace = [...replace, spliced];
  }

  return replace;
}

export function isPropValuesEqual(
  subject: TODO[],
  target: TODO[],
  propNames: TODO[]
) {
  return propNames.every((propName) => subject[propName] === target[propName]);
}

export function getUniqueItemsByProperties(items: TODO[], propNames: string[]) {
  return items.filter(
    (i, idx, a) =>
      idx ===
      a.findIndex((found) => isPropValuesEqual(found, i, Array.from(propNames)))
  );
}

// lodash
function copyArray<T extends TODO[]>(source: T, copy?: T) {
  let index = -1;
  const length = source.length;
  const array = copy || new Array(length);

  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

// lodash
export function shuffle(array: TODO[]) {
  const length = array == null ? 0 : array.length;
  if (!length) return [];
  let index = -1;
  const lastIndex = length - 1;
  const result = copyArray(array);
  while (++index < length) {
    const rand = index + Math.floor(Math.random() * (lastIndex - index + 1));
    const value = result[rand];
    result[rand] = result[index];
    result[index] = value;
  }
  return result;
}
