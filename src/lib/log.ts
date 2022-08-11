import { Logs } from "../";
import { randomColor } from "./color";

type Params = {
 name: string;
 callback: (...x: any[]) => Promise<any>;
 params?: any[];
};

export default async ({ name, callback, params = [] }: Params) => {
 const start = Date.now();
 const data = await callback(...params);
 const end = Date.now();
 const duration = (end - start) / 1000;
 const usage = process.memoryUsage().heapUsed / 1024 / 1024;

 if (duration > 1 || usage >= 20) {
  let embed = {
   title: `${name}`,
   color: randomColor() as number,
   fields: [
    {
     name: `Duration`,
     value: `${((end - start) / 1000).toFixed(2)} seconds..`,
    },
    {
     name: `Memory`,
     value: `${usage}`,
    },
   ],
  };

  Logs.send({ embeds: [embed] });
 }

 return data || null;
};
