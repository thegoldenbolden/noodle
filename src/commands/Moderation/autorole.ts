import { ActionRowBuilder, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { ChatInputCommandInteraction, Collection, TextInputStyle } from "discord.js";
import { BotError } from "../../utils/classes/BotError";
import { handleError } from "../../utils/functions";
import { Category, Command } from "../../utils/typings/discord";

export default <Command>{
  name: "autorole",
  permissions: [PermissionFlagsBits.ManageRoles],
  category: Category.Moderation,
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const subcommand = interaction.options.getSubcommand(true);

      switch (subcommand) {
        case "create":
          await create();
          break;
        case "add":
          break;
        case "remove":
          break;
        case "delete":
          break;
        case "edit":
          break;
      }

      async function create() {
        const type = interaction.options.getString("type", true) as "buttons" | "reactions" | "menu";
        const roles = interaction.options.resolved.roles;

        if (!roles) throw new BotError("The grass wasn't greener on the other side because something went wrong.");
        if (type === "menu" && (roles?.size as number) < 2) {
          throw new BotError(`There needs to be at least two roles for an autorole menu.`);
        }

        const names = roles.mapValues((role) => role?.name);
        if (!names || names?.size == 0) {
          throw new BotError(`We were unable to remember the role names, we are terrible teachers. :(`);
        }

        const modal = createModal(type, names);

        try {
          await interaction.showModal(modal);
          const input = await interaction.awaitModalSubmit({
            filter: (i: any) => i.user.id === interaction.user.id,
            time: 60000 * 10,
          });

          await input.deferReply({ ephemeral: true });
          console.log("hi");

          let title, message, emotes: any;
          title = input.fields.getTextInputValue(`ar-modal-ttl.${interaction.id}`);
          message = input.fields.getTextInputValue(`ar-modal-msg.${interaction.id}`);
          if (type === "buttons" || type === "reactions") {
            emotes = input.fields.getTextInputValue(`ar-modal-em.${interaction.id}`);
          }

          console.log({
            title,
            message,
            emotes,
          });

          await input.editReply({ content: message });
        } catch (err) {
          handleError(err, null);
        }
      }

      function createModal(type: "buttons" | "menu" | "reactions", names: Collection<string, any>): ModalBuilder {
        console.log(interaction.id);

        const modal = new ModalBuilder()
          .setTitle(`${type[0].toUpperCase() + type.substring(1)} Autorole`)
          .setCustomId(`ar-modal.${interaction.id}`);

        const title = new ActionRowBuilder<ModalActionRowComponentBuilder>();
        const message = new ActionRowBuilder<ModalActionRowComponentBuilder>();

        const ttl = new TextInputBuilder()
          .setCustomId(`ar-modal-ttl.${interaction.id}`)
          .setLabel(`Enter a title for the autorole`)
          .setStyle(TextInputStyle.Short);
        title.addComponents([ttl]);

        const text = new TextInputBuilder()
          .setCustomId(`ar-modal-msg.${interaction.id}`)
          .setLabel(`Enter the message for the autorole`)
          .setStyle(TextInputStyle.Paragraph);
        message.addComponents([text]);

        const components = [title, message];

        if (type === "reactions" || type === "buttons") {
          const emojis = new ActionRowBuilder<ModalActionRowComponentBuilder>();
          const emoji = new TextInputBuilder()
            .setCustomId(`ar-modal-em.${interaction.id}`)
            .setLabel(`Enter the name of the emojis for the roles`)
            .setPlaceholder(`${names.map((name) => name).join(", ")}`)
            .setStyle(TextInputStyle.Paragraph);
          emojis.addComponents([emoji]);
          components.push(emojis);
        }

        modal.addComponents(components);
        return modal;
      }
    } catch (err) {
      console.error(err);
    }
  },
};
