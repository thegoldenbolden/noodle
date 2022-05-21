import { Client } from "discord.js";
// import { useLog } from "../../utils/functions/helpers";

export default {
  name: "ready",
  once: true,
  async execute(client: Client) {
    const { commands } = await import("../../ignore/commands");

    await createGlobalCommand(commands.find((c) => c.name === "games"));

    process.exit();

    async function createGlobalCommand(command: any) {
      client.application?.commands
        .create(command)
        .then((c) => console.log(c))
        .catch((e) => console.log(e));
    }

    // await client.application?.commands.set([]).catch((e) => console.log(e));
    // const buds = client.guilds.cache.get(process.env.BUDS);
    // await buds?.commands.set(commands).catch((e) => console.log(e));
  },
};

// const old = {
//   type: 3,
//   custom_id: "roles.613986453634023424.876354376938180688",
//   min_values: 0,
//   max_values: 11,
//   placeholder: "Please select the role(s) you want.",
//   options: [
//     {
//       label: "Master Package",
//       value: "613587334146949121",
//       description: "Select to add this role.",
//     },
//     {
//       label: "Dan-Ball Package",
//       value: "613586021820399627",
//       description: "Select to add this role.",
//     },
//     {
//       label: "Modding Package",
//       value: "613586330844135443",
//       description: "Select to add this role.",
//     },
//     {
//       label: "Bot Package",
//       value: "613586385739186176",
//       description: "Select to add this role.",
//     },
//     {
//       label: "Shitposting Package ...",
//       value: "613587048380629013",
//       description: "Select to add this role.",
//     },
//     {
//       label: "NSFW Package",
//       value: "613943979280695296",
//       description: "Select to add this role.",
//     },
//     {
//       label: "Miscellaneous Package",
//       value: "613586876263170055",
//       description: "Select to add this role.",
//     },
//     {
//       label: "he/him",
//       value: "756403708518203433",
//       description: "Select to add this role.",
//     },
//     {
//       label: "she/her",
//       value: "756403825367318649",
//       description: "Select to add this role.",
//     },
//     {
//       label: "they/them",
//       value: "756404109392871434",
//       description: "Select to add this role.",
//     },
//     {
//       label: "other pronouns",
//       value: "780883223340122132",
//       description: "Select to add this role.",
//     },
//   ],
// };

// Update danballs autorole
// const danball = client.guilds.cache.get("250066523346042881");
// const p = danball?.channels.cache.get("613986453634023424") as TextChannel;
// if (!p) process.exit(0);
// const message = await p.messages.fetch("876354376938180688");
// const component = message.components[0].components[0].data as APISelectMenuComponent;
// const a = {
//   type: ComponentType.SelectMenu,
//   customId: `AUTOROLE`,
//   placeholder: `Please select a role(s)`,
//   maxValues: component.options.length ?? 25,
//   minValues: 0,
//   options: component.options.map((options) => {
//     return {
//       label: options.label,
//       value: options.value,
//       description: undefined,
//       emoji: (danball!.roles.cache.get(options.value) as Role).unicodeEmoji ?? undefined,
//     };
//   }),
// } as SelectMenuComponentData;
// await message.edit({
//   components: [
//     {
//       type: ComponentType.ActionRow,
//       components: [a],
//     },
//   ],
// });
