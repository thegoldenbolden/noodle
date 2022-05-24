// import {
// 	APIActionRowComponent,
// 	APIButtonComponentWithCustomId, ButtonStyle,
// 	ComponentType
// } from "discord-api-types/v10";
// import {
// 	ButtonInteraction,
// 	CacheType, Collection,
// 	Interaction,
// 	InteractionCollector, SelectMenuInteraction
// } from "discord.js";
// import { createButtons } from "../functions/discord";
// import { handleError } from "../functions/helpers";
// import { ButtonIds, Keys, PaginateConstructor } from "../typings/classes/Paginate";
// import PastaError from "./Error";

// export class Paginate extends InteractionCollector<Interaction> {
//  interaction;
//  pages;
//  page;
//  page_index;
//  items_per_page;
//  is_last_page;
//  buttons;
//  menus;
//  loading;
//  message;
//  fetch;
//  format;

//  constructor(data: PaginateConstructor) {
//   super(data.interaction.client, data.options);
//   this.interaction = data.interaction;
//   this.pages = data.pages ?? [];
//   this.page = data.page ?? 0;
//   this.page_index = data.page_index ?? 0;
//   this.items_per_page = data.items_per_page ?? this.pages[this.page].length;
//   this.is_last_page = data.is_last_page ?? false;
//   this.menus = data.menus ?? [];
//   this.fetch = data.fetch;
//   this.format = data.format;
//   this.loading = false;
//   this.buttons = createButtons(data.interaction, ["first", "back", "next", "last", "previous", "load"], true, ButtonStyle.Primary).buttons;
//   this.message = { content: "There is no content to display.", embeds: [], components: []};
//  }

//  change(key: "page" | "page_index", amount: number, end: boolean = false) {
//   if (key === "page") return end ? this.page : this.page + amount;
//   const max = this.pages[this.page].length - 1;
//   return this.page_index === max ? max : this.page_index === 0 && amount < 0 ? 0 : this.page_index + amount;
//  }

//  toggle() {
//   if (this.message.components!.length === 0) throw new PastaError({ message: "No components were found.", me: true });
//   if (this.loading) {
//    return this.message.components!.forEach((row: any) => row.components.forEach((component: any) => (component.disabled = true)));
//   }

//   let idx = this.menus.length > 0 ? 1 : 0;
//   const btns = (this.message.components as APIActionRowComponent<APIButtonComponentWithCustomId>[])![idx].components;
//   if (this.page_index === 0) {
//    (btns[0] = this.page > 0 ? this.buttons[4] : this.buttons[0]), (btns[3] = this.buttons[3]); // Change buttons
//    (btns[0].disabled = this.page === 0), (btns[1].disabled = true), (btns[2].disabled = false), (btns[3].disabled = false); // Toggle disable
//    return;
//   }
//   if (this.page_index === this.pages[this.page].length - 1) {
//    (btns[0] = this.buttons[0]), (btns[3] = !this.is_last_page ? this.buttons[5] : this.buttons[3]); // Change buttons
//    (btns[0].disabled = false), (btns[1].disabled = false), (btns[2].disabled = true), (btns[3].disabled = this.is_last_page); // Toggle disable
//    return;
//   }
//   if (btns[0].custom_id !== this.buttons[0].custom_id) btns[0] = this.buttons[0]; // Change buttons
//   if (btns[3].custom_id !== this.buttons[3].custom_id) btns[3] = this.buttons[3]; // Change buttons
//   this.message.components!.forEach((row: any) => row.components.forEach((component: any) => (component.disabled = false))); // Set to enable
//  }

//  async interacted(i: SelectMenuInteraction | ButtonInteraction) {
//   try {
//    await i.deferUpdate();
//    if (this.loading) return;

//    const key = i.customId.split("-")[0] as ButtonIds;
//    if (!(key in Keys)) {
//     throw new PastaError({
//      message: "D: We forgot the water 😭",
//      me: true,
//      info: `${key} does not match pagination buttons.`,
//     });
//    }

//    if (i.isButton()) {
//     this.handleButton(i, key);
//     this.toggle();
//    }

//    if (i.isSelectMenu()) {
//     this.handleMenu(i, key);
//     this.toggle();
//    }

//    if (this.loading) {
//     const timeout = setTimeout(async () => {
//      const items = this.pages.reduce((a, b) => a + b?.length, 0);
//      const data = await this.fetch(this.page + 1, items).catch((e: any) => {
//       handleError(e, null);
//       return e;
//      });

//      this.loading = false;
//      if (!data) {
//       this.message.content = "We couldn't find any more data.";
//       this.message.embeds = [];
//      } else {
//       this.pages.push(data);
//       this.page += 1;
//       this.page_index = 0;
//       this.message = this.format(this.pages, this.page, this.page_index);
//      }

//      await i.editReply(this.message);
//      clearTimeout(timeout);
//     }, 1000);
//     return;
//    }

//    if (!this.pages[this.page][this.page_index]) {
//     (this.message.embeds = []), (this.message.content = "This page does not exist.");
//    } else {
//     this.message = this.format(this.pages, this.page, this.page_index);
//    }

//    await i.editReply(this.message);
//   } catch (err: any) {
//    super.stop("pastaError");
//    handleError(err, i);
//   }
//  }

//  async finish(i: Collection<string, Interaction<CacheType>>, reason: string) {
//   if (["messageDelete", "channelDelete", "guildDelete", "threadDelete", "pastaError"].includes(reason)) return;
//   return console.log("fini");
//  }

//  async handleMenu(i: SelectMenuInteraction, key: string) {}

//  async handleButton(i: ButtonInteraction, key: ButtonIds) {
//   let amount =
//    0 === Keys[key] // If first or loading then set index to zero.
//     ? -this.page_index
//     : 1 === Keys[key] // If back then subtract one from index.
//     ? -1
//     : 2 === Keys[key] // If next then add one to index.
//     ? 1
//     : this.pages[this.page].length - 1; // If last or previous then set index to last item in page.

//   if (key === "LOAD") {
//    this.loading = true;
//    amount = 0;
//   }

//   this.page_index = this.change("page_index", amount);
//  }

//  async error(err: PastaError | Error, i: Interaction) {
//   handleError(err, i ?? null);
//  }

//  async send() {
//   if (this.pages?.[this.page]?.[this.page_index]) {
//    this.message.content = undefined;
//    this.message.embeds = [this.pages[this.page][this.page_index]];

//    if (this.menus[0] && !this.is_last_page) {
//     this.message.components!.push({
//      type: ComponentType.ActionRow,
//      components: this.menus,
//     });
//    }

//    if (this.buttons[0] && this.pages[this.page].length > 1) {
//     this.message.components!.push({
//      type: ComponentType.ActionRow,
//      components: this.buttons.slice(0, 4),
//     });
//    }
//   }
//   await this.interaction.editReply(this.message);
//  }
// }
