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
 StringSelectMenuComponentData,
 Message,
 APIStringSelectComponent,
} from "discord.js";

import { Bot, client } from "../..";
import BotError from "../../lib/classes/Error";
import { checkSend } from "../../lib/discord/permissions";

export default {
 name: "autorole",
 categories: ["Moderation"],
 async execute(interaction: ChatInputCommandInteraction) {
  const command = interaction.options.getSubcommand(true);
  let roles = interaction.options.resolved?.roles;

  switch (command) {
   case "edit":
    const [postTo, postContent] = await fetchMessage(interaction);
    await showModal(interaction, command);
    Bot.modals.set(`${interaction.user.id}-AUTOROLE-EDIT`, { channel: postTo, message: postContent });
    return;
   case "create":
    roles = filterRoles(interaction, roles);

    const menu: StringSelectMenuComponentData = {
     type: ComponentType.StringSelect,
     customId: "AUTOROLE",
     minValues: 0,
     maxValues: roles?.size,
     placeholder: "Please select a role(s)",
     options: roles
      ?.sort((a, z) => (z as Role)?.position - (a as Role)?.position)
      .map((role) => ({
       label: role?.name ?? "Nameless Role",
       value: role?.id ?? "No role id",
       emoji: role?.icon ?? undefined,
      })),
    };

    await showModal(interaction, command);
    Bot.modals.set(`${interaction.user.id}-AUTOROLE-CREATE`, menu);
    return;
   default:
    await interaction.deferReply({ ephemeral: true });
    const [channel, message] = await fetchMessage(interaction);
    const component = message.components[0].components[0] as StringSelectMenuComponentData;
    roles = roles && filterRoles(interaction, roles, component, command);
    const existing: number = (message.components[0].components[0] as StringSelectMenuComponentData)?.options?.length ?? 0;
    roles && messageLimit(roles, existing);
    await editAutorole(interaction, channel, message, roles);
    return;
  }
 },
};

type Roles = Collection<string, Role | APIRole | null> | undefined;
type Interaction = ChatInputCommandInteraction;
type Component = StringSelectMenuComponentData;

function filterRoles(interaction: Interaction, roles: Roles, component?: Component, command?: string) {
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

function messageLimit(roles: Roles, existing?: number) {
 let amount = (existing ?? 0) + (roles?.size ?? 0);
 if (amount < 1) throw new BotError({ message: "Menus need at least one role." });
 if (amount > 25) throw new BotError({ message: "Menus can only have 25 roles per message." });
}

async function showModal(interaction: Interaction, command: string) {
 const modal: ModalComponentData = {
  customId: command == "create" ? "AUTOROLE" : "AUTOROLE-EDIT",
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

 await interaction.showModal(modal);
}

async function editAutorole(interaction: Interaction, channel: TextChannel, message: Message<boolean>, roles: Roles) {
 if (!roles) {
  throw new BotError({
   message: "We couldn't find the roles provided",
   log: true,
   info: "No discord roles from a required argument.",
  });
 }

 const component = message.resolveComponent("AUTOROLE")?.data as Readonly<APIStringSelectComponent>;
 if (!component) {
  throw new BotError({
   message: "We were unable to find the menu.",
   log: true,
   command: "Autorole Add",
   info: "Unable to find menu",
  });
 }

 let options: any = {};
 const command = interaction.options.getSubcommand(true);

 let opts: StringSelectMenuComponentData["options"] =
  command === "remove"
   ? component.options?.filter((opt) => !roles.has(opt.value)) ?? []
   : [
      ...(component.options ?? []),
      ...roles.map((role) => {
       return {
        label: role?.name ?? "Unknown Role Name",
        value: role?.id ?? "Unknown Role Id",
       };
      }),
     ];

 if (opts.length === 0) throw new BotError({ message: "Menu needs at least one role" });

 options.components = [
  {
   type: ComponentType.ActionRow,
   components: [
    {
     ...component,
     max_values: opts.length,
     options: opts,
    },
   ],
  },
 ];

 checkSend(interaction, channel);
 await message.edit(options);
 const msg = `Successfully ${command === "remove" ? "removed" : "added"} ${roles.map((role) => role).join(" ")}.`;
 await interaction.editReply(`${msg}\n${message.url}`);
}

async function fetchMessage(interaction: ChatInputCommandInteraction): Promise<[TextChannel, Message<true>]> {
 const messageLink = interaction.options.getString("message_link", true);
 const ids = messageLink.match(/([0-9])\w+/g);
 if (!ids || ids.length !== 3) throw new BotError({ message: `We were unable to find the ids from that link.` });
 const [guildId, channelId, messageId] = ids;

 let channel = interaction.guild?.channels.cache.get(channelId);
 if (!channel) throw new BotError({ message: "We were unable to find the channel the message is in." });
 if (channel.type !== ChannelType.GuildText) throw new BotError({ message: "Autoroles can only be in text channels." });

 checkSend(interaction, channel);
 let message = channel.messages.cache.get(messageId);
 if (!message) {
  const fetchMessage = await channel.messages.fetch({ cache: true, message: messageId });
  if (!fetchMessage) throw new BotError({ message: "We couldn't find the message.", log: true, info: fetchMessage });
  message = fetchMessage;
 }

 if (message.author.id !== client.user?.id) throw new BotError({ message: "I can only edit messages my own messages." });
 return [channel, message];
}
