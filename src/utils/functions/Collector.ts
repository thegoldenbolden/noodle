// import { MessageButton } from "discord.js";
import { APIButtonComponentWithCustomId, ButtonStyle, ComponentType } from "discord-api-types/v10";
import { getEmoji } from "../discord";

export function createButtons(interaction: any, ids: string[] = []) {
  let buttons: APIButtonComponentWithCustomId[] = [];
  let emojis: any = getEmoji(ids);

  ids.forEach((id, i) => {
    let e: any = emojis.find((emoji: any) => emoji.name == id);
    buttons.push({
      type: ComponentType.Button,
      custom_id: `${id}.${interaction.id}`,
      style: ButtonStyle.Success,
      label: `${id[0].toUpperCase() + id.substring(1)}`,
      emoji: { id: e?.id, name: e?.name ?? undefined, animated: e?.animated ?? false },
      disabled: ids[0] === "first" && ids[1] === "back" ? i < 2 : false,
    });
  });

  return { buttons, emojis };
}

// function toggleComponents(components: any[], page: [any, number, number], API_PAGE: any) {
//   const [pages, current, index] = page;
//   const [buttons, menu, allButtons] = components;

//   switch (index) {
//     default:
//       buttons.forEach((button: any) => (button.disabled = false));
//       changeButtons("first", buttons, allButtons);
//       changeButtons("last", buttons, allButtons);
//       break;
//     case 0:
//       buttons[0].disabled = current === 0;
//       buttons[1].disabled = true;
//       buttons[2].disabled = false;
//       buttons[3].disabled = false;
//       changeButtons("previous", buttons, allButtons);
//       changeButtons("last", buttons, allButtons);
//       break;
//     case pages.embeds[current].length - 1:
//       buttons[0].disabled = current === 0;
//       buttons[1].disabled = false;
//       buttons[2].disabled = true;
//       buttons[3].disabled = current === pages.embeds.length || API_PAGE?.LAST_PAGE === pages.embeds.length;
//       changeButtons("load", buttons, allButtons);
//       changeButtons("first", buttons, allButtons);
//       break;
//   }
// }

// type Buttons = "first" | "back" | "next" | "last" | "previous" | "load";
// function changeButtons(key: Buttons, buttons: any[], all: any[]) {
//   let idx = key == "first" || key == "previous" ? 0 : key == "back" ? 1 : key == "next" ? 2 : 3;
//   buttons[idx] = key == "previous" ? all[4] : key == "load" ? all[5] : all[idx];
// }
