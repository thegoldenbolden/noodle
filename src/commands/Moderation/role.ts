import { ChatInputCommandInteraction, GuildMember, GuildMemberRoleManager, Role } from "discord.js";
import BotError from "../../lib/classes/Error";
import { Command } from "../../types";

const command: Command = {
 name: "role",
 categories: ["Moderation"],
 permissions: ["ManageRoles"],
 cooldown: 5,
 async execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const subcommand = interaction.options.getSubcommand(true);
  let message: string | null = null;
  const highest = interaction.guild?.members?.me?.roles?.highest;

  switch (subcommand) {
   case "create":
   case "edit":
    message = (await createOrEdit(subcommand)) ?? null;
    break;
   case "remove":
   case "add":
    message = (await addOrRemove(subcommand)) ?? null;
    break;
   case "delete":
    message = (await deleteRoles()) ?? null;
    break;
  }

  if (!message) throw new BotError({ message: `Error occurred sending message.` });
  await interaction.editReply(message);

  async function createOrEdit(type: "create" | "edit") {
   const role = interaction.options.getRole("role") ?? null;
   if (type == "edit" && !role) throw new BotError({ message: "No role to edit was provided." });

   const user = interaction.options.getMember("user") ?? null;
   const name = interaction.options.getString("name") ?? role?.name;
   const hoist = interaction.options.getBoolean("hoist") ?? false;
   const reason = interaction.options.getString("reason") ?? "Noodle Command";
   const position = interaction.options.getRole("position");
   const color = interaction.options.getString("color");
   const mentionable = interaction.options.getBoolean("mentionable") ?? true;
   const options: any = { name, hoist, reason, mentionable };
   if (!options.name) throw new BotError({ message: `We messed up with the role name.` });
   let msg: string | null = null;

   if (color) {
    if (color?.match(/(#?([A-Fa-f0-9]{6}))/g)) {
     options.color = color;
    } else {
     throw new BotError({ message: `${color} isn't an acceptable color.` });
    }
   }

   if (position && highest) {
    if (highest?.comparePositionTo(position.id) <= 0) {
     throw new BotError({ message: `We cannot set the role at this position because it is higher than mine.` });
    } else {
     options.position = position.position;
    }
   }

   if (type == "create") {
    options.position += 1;
    const created = await interaction.guild?.roles.create(options).catch((err: any) => err);
    if (!created) throw new BotError({ message: `We failed to create the role: Reason: ${created.message}` });
    msg = `Created role ${created} `;
    if (user) {
     msg += await (user.roles as GuildMemberRoleManager)
      .add(created)
      .then(() => `and added to ${(user as GuildMember).displayName}`)
      .catch((e) => `and failed to add to ${(user as GuildMember).displayName}.`);
    }
   } else {
    if (!role) throw new BotError({ message: "A role wasn't provided. " });
    if (role.position > options.position) {
     options.position += 1;
    }

    msg = await (role as Role)
     .edit(options)
     .then((e) => `Edited ${role.name}`)
     .catch((e) => `We couldn't edit the role. Reason: ${e.message}`);
   }
   return msg;
  }

  async function addOrRemove(type: "add" | "remove") {
   if (!highest) throw new BotError({ message: "We were unable to find my highest role." });
   const role = interaction.options.getRole("role", true);
   const members = interaction.options.resolved?.members;
   if (highest.comparePositionTo(role.id) < 0) throw new BotError({ message: `We are unable to add ${role.name}` });

   const fail: string[] = [];
   members?.forEach((member: any) => {
    if (type === "add") {
     (member?.roles as GuildMemberRoleManager).add(`${role.id}`).catch((err) => {
      fail.push(`I was unable to add the role to ${(member as any)?.displayName}. Reason: \*\*${err.message}\*\*`);
     });
    } else {
     (member?.roles as GuildMemberRoleManager).remove(`${role.id}`).catch((err) => {
      fail.push(`I was unable to remove the role from ${(member as any)?.displayName}. Reason: \*\*${err.message}\*\*`);
     });
    }
   });

   if (fail.length === members?.size) return `I was unable to ${type} the role ${type == "add" ? "to" : "from"} everyone`;
   return (
    `${type === "remove" ? "Removed" : "Added"} roles.` +
    (fail.length > 0
     ? `\n❗I couldn't ${type} the role ${type == "add" ? "to" : "remove"} the following members:\n${fail.join("\n")}`
     : "")
   );
  }

  async function deleteRoles() {
   const roles = interaction.options.resolved?.roles;
   const reason = interaction.options.getString("reason");
   const invalid: string[] = [];

   roles?.forEach(async (role: any) => {
    await (role as Role)
     .delete(`${reason ?? ""}`)
     .catch((err) => invalid.push(`Failed to delete ${role}. \*\*${err.message}\*\*`));
   });

   return invalid.length === roles?.size ? "I was unable to delete any role." : `Succesfully deleted roles. ${invalid?.join("")}`;
  }
 },
};

export default command;
