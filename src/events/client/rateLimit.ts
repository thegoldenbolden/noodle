import { error } from "../../index";

export default {
  name: "rateLimit",
  async execute(timeout: number, limit: number, method: string, path: string, route: string, global: boolean) {
    error.send({
      embeds: [
        {
          title: "RATE LIMIT",
          fields: [
            { name: "TIMEOUT", value: `${timeout}`, inline: true },
            { name: "LIMIT", value: `${limit}`, inline: true },
            { name: "METHOD", value: `${method}`, inline: true },
            { name: "PATH", value: `${path}`, inline: true },
            { name: "ROUTE", value: `${route}`, inline: true },
            { name: "GLOBAL", value: `${global}`, inline: true },
          ],
        },
      ],
    });
  },
};
