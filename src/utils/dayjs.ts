import dayjs, { Dayjs } from "dayjs";
import parse from "dayjs/plugin/customParseFormat";
import tz from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(tz);

type Options = {
  utc?: boolean;
  tz?: string;
  format?: string;
};

type Time = Date | string | null | number;

export function convert(time: Time, options?: Options) {
  if (!time) return undefined;

  let converted: Dayjs | string = dayjs(`${time}`);

  if (options) {
    converted =
      options.tz && dayjs.extend(tz) ? converted.tz(options.tz) : converted;
    converted =
      options.utc && dayjs.extend(utc) ? converted.utc(options.utc) : converted;
    converted =
      options.format && dayjs.extend(parse)
        ? converted.format(options.format)
        : converted;
  }

  return converted;
}

export function format(date: Date = new Date()) {
  return dayjs(`${date}`).toISOString();
}

export function isValid(string: string | null) {
  return dayjs(string).isValid();
}
