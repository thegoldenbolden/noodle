import { Collection } from "discord.js";

export default (data: any[], elements = 1, transform: (e: any, idx: number) => any): any[] => {
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
