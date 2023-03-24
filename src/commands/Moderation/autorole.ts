import {
 ChannelType,
 ChatInputCommandInteraction,
 Collection,
 ComponentType,
 ModalComponentData,
 Role,
 TextInputStyle,
 APIRole,
 TextChannel,
 PermissionFlagsBits,
 Message,
 GuildMemberRoleManager,
 RoleManager,
 APIStringSelectComponent,
 StringSelectMenuComponentData,
 InteractionReplyOptions,
 ModalSubmitInteraction,
 escapeMarkdown,
 APISelectMenuComponent,
 ContextMenuCommandInteraction,
 MessageEditOptions,
 StringSelectMenuBuilder,
 TextBasedChannel,
 MessageContextMenuCommandInteraction,
} from "discord.js";

import { Bot, client } from "../..";
import BotError from "../../lib/classes/Error";
import { checkSend } from "../../lib/discord/CheckPermissions";
import { getColor } from "../../lib/Helpers";
import type { Command } from "../../types";

type Roles = Collection<string, Role | APIRole | null> | undefined;
type Component = StringSelectMenuComponentData;

const command: Command = {
 name: "autorole",
 contexts: ["Edit Autorole"],
 categories: ["Moderation"],
 async menu(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const guildRoles = interaction.guild?.roles;
  if (!guildRoles) throw new BotError({ message: "We couldn't find this server's roles." });
  const memberRoles = interaction.member?.roles as GuildMemberRoleManager | undefined;
  if (!memberRoles) throw new BotError({ message: "We couldn't find your current roles." });

  const selectedRoles = interaction.values;
  const menuRoles =
   (interaction.message.resolveComponent("autorole-menu")?.data as APIStringSelectComponent).options.map((o) => o.value) ?? [];
  if (menuRoles.length === 0) throw new BotError({ message: `We were unable to find the roles for this message."` });

  const unselectedRoles = menuRoles.filter((r) => !selectedRoles.includes(r)),
   invalidRoles: string[] = [];

  const botHighestRole = interaction.guild?.members?.me?.roles.highest;
  menuRoles.forEach((id) => {
   const role = guildRoles.resolve(id);
   if (!role) return;
   if (botHighestRole && role.comparePositionTo(botHighestRole) > 0) {
    invalidRoles.push(role.name);
   }
  });

  if (invalidRoles.length > 0) {
   throw new BotError({
    message: `The following roles are higher than mine, so I cannot add them.\n\`${invalidRoles.join(", ")}\``,
   });
  }

  const { invalid: existed, valid: added } = await updateUserRoles(unselectedRoles, memberRoles, guildRoles);
  const { invalid: missing, valid: removed } = await updateUserRoles(selectedRoles, memberRoles, guildRoles);

  await interaction.editReply({
   content:
    `${added.length > 0 ? `✅ You now have ${added.join(", ")}.\n` : ""}` +
    `${removed.length > 0 ? `❌ You no longer have ${removed.join(", ")}.\n` : ""}` +
    `${missing.length > 0 ? `❗ You never had ${missing.join(", ")}, so I cannot remove it.\n` : ""}` +
    `${existed.length > 0 ? `❕ You already have ${existed.join(", ")}, so I cannot add it.\n` : ""}`,
  });
 },
 async modals(interaction) {
  const userId = interaction.user.id;

  switch (interaction.customId) {
   default:
    throw new BotError({ log: true, info: "Modal has invalid id", message: "Oops." });
   case "autorole-edit":
    const patch = Bot.modals.get(`autorole-edit-${userId}`);
    if (!patch || !patch.message) throw new BotError({ message: "We couldn't update the message" });
    checkSend(patch.channel);
    const edit = editData(interaction, patch.message);

    if (edit.placeholder.length > 0) {
     edit.options.components = [
      {
       type: ComponentType.ActionRow,
       components: [
        {
         ...(patch.message.resolveComponent("autorole-menu")?.data as Readonly<APISelectMenuComponent>),
         placeholder: edit.placeholder,
        },
       ],
      },
     ];
    }

    await patch.message.edit(edit.options);
    await interaction.reply({
     ephemeral: true,
     content: `Successfully edited autorole. Below is an escaped version of your message in case you decide to edit the autorole later.\n\n${edit.escaped}`,
    });
    Bot.modals.delete(`${interaction.user.id}-AUTOROLE-CREATE`);
    return;
   case "autorole-create":
    let autorole = Bot.modals.get(`autorole-create-${userId}`);
    if (!autorole) throw new Error("We couldn't send the roles");
    const create = editData(interaction);

    if (create.placeholder.length > 0) autorole.placeholder = create.placeholder;
    create.options.components = [{ type: ComponentType.ActionRow, components: [autorole] }];

    await interaction.reply(create.options as InteractionReplyOptions);
    await interaction.followUp({
     ephemeral: true,
     content: `Successfully created autorole. Below is an escaped version of your message in case you decide to edit.\n\n${create.escaped}`,
    });

    Bot.modals.delete(`autorole-create-${interaction.user.id}`);
    return;
  }

  type EditData = { options: any; placeholder: string; escaped: string };
  function editData(interaction: ModalSubmitInteraction, patch?: Message<true>): EditData {
   const message = interaction.fields.getTextInputValue("message");
   const placeholder = interaction.fields.getTextInputValue("placeholder");
   const embed = interaction.fields.getTextInputValue("embed");
   const title = interaction.fields.getTextInputValue("title");
   const options: any | InteractionReplyOptions = { embeds: [] };

   options.content = message.length > 0 ? message : patch?.content ?? null;
   options.embeds = patch?.embeds ?? [];

   if (options.embeds.length > 0) {
    options.content = null;
    options.embeds[0] = {
     ...patch?.embeds[0],
     description: message.length > 0 ? message : patch?.embeds[0].description ?? "Please select a role(s)",
     author: {
      name: title.length > 0 ? title : patch?.embeds[0].author?.name ?? "Role Select Menu",
      icon_url: interaction.guild?.iconURL() ?? "",
     },
     color: getColor(interaction.guild?.members.me),
    };
   }

   switch (embed) {
    case "no":
     options.embeds = [];
     break;
    case "yes":
     options.embeds?.push({
      author: { name: title.length > 0 ? title : "Role Select Menu", icon_url: interaction.guild?.iconURL() ?? "" },
      description: message.length > 0 ? message : patch?.content ?? "Please select a role(s)",
      color: getColor(interaction.guild?.members?.me),
     });
     options.content = null;
   }

   return { placeholder, options, escaped: escapeMarkdown(message) };
  }
 },
 async execute(interaction: ChatInputCommandInteraction | MessageContextMenuCommandInteraction) {
  // Edit a autorole.
  if (interaction.isContextMenuCommand()) {
   await interaction.showModal(createModal("edit"));
   Bot.modals.set(`autorole-edit-${interaction.user.id}`, { channel: interaction.channel, message: interaction.targetMessage });
   return;
  }

  const command = interaction.options.getSubcommand(true);
  let roles = interaction.options.resolved?.roles;

  switch (command) {
   case "create":
    roles = filterRoles(interaction, roles);
    const menu: StringSelectMenuComponentData = {
     type: ComponentType.StringSelect,
     customId: "autorole-menu",
     minValues: 0,
     maxValues: roles?.size,
     placeholder: "Please select a role(s)",
     options: roles
      ?.sort((a, z) => (z as Role)?.position - (a as Role)?.position)
      .map((role) => ({
       label: role?.name ?? "Nameless Role",
       value: role?.id ?? "No role id",
      })),
    };

    await interaction.showModal(createModal("create"));
    Bot.modals.set(`autorole-create-${interaction.user.id}`, menu);
    return;
   default:
    await interaction.deferReply({ ephemeral: true });
    const messageLink = interaction.options.getString("message_link", true);
    const ids = messageLink.match(/([0-9])\w+/g);
    if (!ids || ids.length !== 3) throw new BotError({ message: `We were unable to find the ids from that link.` });
    const [, , messageId] = ids;

    const { message } = await fetchMessage(messageId, interaction.channel);
    const component = message.components[0].components[0] as StringSelectMenuComponentData;
    roles = roles && filterRoles(interaction, roles, component, command);
    const existing: number = (message.components[0].components[0] as StringSelectMenuComponentData)?.options?.length ?? 0;
    roles && menuOptionsLimit(roles, existing);
    await updateRoleMenu(interaction, message, roles);
    return;
  }
 },
};

function filterRoles(interaction: ChatInputCommandInteraction, roles: Roles, component?: Component, command?: string) {
 if (!roles || roles.size == 0) throw new BotError({ message: "We couldn't find any roles provided." });
 if (!interaction.guild?.members?.me?.permissions.has(PermissionFlagsBits.ManageRoles))
  throw new BotError({ message: "We need the Manage Roles permission to use this command." });

 let failed: (Role | APIRole | null)[] = [];
 const valid = roles?.filter((role) => {
  if (component) {
   const exists = component.options?.find((r) => r.value === role?.id);
   if (command === "add" && exists) return false;
   if (command === "remove" && !exists) return false;
  }

  if (!role || !(role as Role).editable) {
   failed.push(role);
   return false;
  }

  if (role.name == "@everyone") {
   failed.push(role);
   return false;
  }

  if (interaction.guild?.members?.me?.roles.highest.comparePositionTo(role.id)! < 0) {
   failed.push(role);
   return false;
  }
  return true;
 });

 if (failed.length > 0) throw new BotError({ message: `The following roles can not be used for autorole: ${failed.join(", ")}` });
 if (!valid || valid.size == 0) throw new BotError({ message: "We didn't receive any valid roles." });
 return valid;
}

function menuOptionsLimit(roles: Roles, existing?: number) {
 let amount = (existing ?? 0) + (roles?.size ?? 0);
 if (amount < 1) throw new BotError({ message: "Menus need at least one role." });
 if (amount > 25) throw new BotError({ message: "Menus can only have 25 roles per message." });
}

function createModal(command: string): ModalComponentData {
 return {
  customId: command == "create" ? "autorole-create" : "autorole-edit",
  title: "Autorole",
  components: [
   {
    type: ComponentType.ActionRow,
    components: [
     {
      type: ComponentType.TextInput,
      customId: "message",
      label: "What do you want the autorole message to be?",
      style: TextInputStyle.Paragraph,
      required: false,
     },
    ],
   },
   {
    type: ComponentType.ActionRow,
    components: [
     {
      type: ComponentType.TextInput,
      customId: "placeholder",
      label: "What do you want the placeholder to be?",
      placeholder: "Please select a role(s)",
      style: TextInputStyle.Short,
      maxLength: 150,
      required: false,
     },
    ],
   },
   {
    type: ComponentType.ActionRow,
    components: [
     {
      type: ComponentType.TextInput,
      customId: "embed",
      label: "Would you like the message to be an embed?",
      style: TextInputStyle.Short,
      placeholder: "'yes' or 'no', defaults to no",
      maxLength: 3,
      minLength: 2,
      required: false,
     },
    ],
   },
   {
    type: ComponentType.ActionRow,
    components: [
     {
      type: ComponentType.TextInput,
      customId: "title",
      label: "If yes, what would you like the title to be?",
      style: TextInputStyle.Short,
      maxLength: 128,
      required: false,
     },
    ],
   },
  ],
 };
}
async function updateRoleMenu(i: ChatInputCommandInteraction, message: Message<boolean>, roles: Roles) {
 if (!roles) {
  throw new BotError({
   message: "We couldn't find the roles provided",
   log: true,
   info: "No discord roles from a required argument.",
  });
 }

 const oldMenu = message.resolveComponent("autorole-menu")?.data as APIStringSelectComponent;
 if (!oldMenu) throw new BotError({ message: "We were unable to find the menu." });
 const newMenu = new StringSelectMenuBuilder(oldMenu);
 newMenu.setCustomId(oldMenu.custom_id);

 const editOptions: MessageEditOptions = {};
 const command = i.options.getSubcommand(true);
 if (command === "remove") {
  newMenu.setOptions(newMenu.options.filter((option) => !roles.has(option.data.value ?? ""))) ?? [];
 } else {
  newMenu.addOptions(roles.map((role) => ({ label: role?.name ?? "Unknown Role Name", value: role?.id ?? "Unknown Role Id" })));
 }

 newMenu.setMaxValues(newMenu.options.length);
 editOptions.components = [{ type: ComponentType.ActionRow, components: [newMenu] }];

 checkSend(i.channel);
 await message.edit(editOptions);
 const msg = `Successfully ${command === "remove" ? "removed" : "added"} ${roles.map((role) => role).join(" ")}.`;
 await i.editReply(`${msg}\n${message.url}`);
}

async function fetchMessage(
 messageId: string,
 channel: TextBasedChannel | null
): Promise<{ channel: TextChannel; message: Message }> {
 if (!channel) throw new BotError({ message: "We were unable to find the channel the message is in." });
 if (channel.type !== ChannelType.GuildText) throw new BotError({ message: "Autoroles can only be in text channels." });
 checkSend(channel);
 let message = channel.messages.cache.get(messageId);
 message ??= await channel.messages.fetch({ cache: true, message: messageId });
 if (!message)
  throw new BotError({
   message: "We couldn't find the message.",
   log: true,
   info: `Guild ${channel.guildId}, Channel: ${channel.id}, Args: ${messageId}`,
  });
 if (message.author.id !== client.user?.id) throw new BotError({ message: "I can only edit my my own messages." });
 return { channel, message };
}

async function updateUserRoles(
 roleNames: string[],
 memberRoles: GuildMemberRoleManager,
 guildRoles: RoleManager,
 isAddingRole: boolean = true
) {
 const invalidIds: string[] = [],
  validNames: string[] = [],
  validIds: string[] = [];

 if (roleNames.length > 0) {
  roleNames.forEach((r) => {
   const userContainsRole = memberRoles.cache.has(r);
   const role = guildRoles.cache.get(r)?.name ?? "Unknown Role";
   if (isAddingRole && userContainsRole) return invalidIds.push(role);
   if (!isAddingRole && !userContainsRole) return invalidIds.push(role);
   if (isAddingRole && !userContainsRole) return validNames.push(role), validIds.push(role);
   if (!isAddingRole && userContainsRole) return validNames.push(role), validIds.push(r);
  });
 }

 if (validIds.length > 0) await memberRoles.remove(validIds);
 return { invalid: invalidIds, valid: validNames };
}

export default command;
