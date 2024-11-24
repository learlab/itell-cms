import {
  InsertAccordionCommand,
  InsertAccordionItemCommand,
  RemoveAccordionItemCommand,
  AccordionFirstItemOpenCommand,
  ModifyAccordionCommand,
  AccordionOpenAllCommand,
  AccordionCollapseAllCommand,
} from "./AccordionCommands";

const {Plugin} = window.CKEDITOR;
const {Widget} = window.CKEDITOR;
const {toWidget} = window.CKEDITOR;
const {toWidgetEditable} = window.CKEDITOR;
const {uid} = window.CKEDITOR;
const {enablePlaceholder} = window.CKEDITOR;

export default class AccordionEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();
    this._defineCommands();
  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register("AccordionBlock", {
      isObject: true,
      allowWhere: "$block",
      allowAttributes: ["AccordionId", "AccordionItemsStayOpen"],
      allowChildren: ["AccordionItem"],
    });
    schema.register("AccordionItem", {
      // Behaves like a self-contained block object (e.g. a block image)
      // allowed in places where other blocks are allowed (e.g. directly in the root).
      inheritAllFrom: "$Object",
      isObject: true,
      allowIn: "AccordionBlock",
      allowChildren: ["AccordionItemHeader", "AccordionItemContent"],
    });
    schema.register("AccordionItemHeader", {
      // Cannot be split or left by the caret.
      allowIn: "AccordionItem",
      allowChildren: "AccordionItemButton",
    });
    schema.register("AccordionItemButton", {
      // Limits commands like "select all" to its contents when the cursor is inside.
      isLimit: true,
      // Allows only text and text-like elements (like icons) inside.
      allowContentOf: "$block", // $text attributes disallowed by PlainText plugin.
      allowAttributes: ["AccordionItemButtonCollapsed"],
      allowIn: "AccordionItemHeader",
    });
    schema.register("AccordionCollapse", {
      allowIn: "AccordionItem",
      allowAttributes: ["AccordionCollapseShow"],
    });
    schema.register("AccordionItemContent", {
      // Limits commands like "select all" to its contents when the cursor is inside.
      isLimit: true,
      allowChildren: ["paragraph", "listItem"],
      allowIn: "AccordionCollapse",
    });
    schema.addAttributeCheck((context, attributeName) => {
      if (
        ["linkHref", "anchorId"].includes(attributeName) &&
        [...context.getNames()].includes("AccordionItemButton")
      ) {
        // Disallows links and anchors inside accordion buttons.
        return false;
      }
      return;
    });
  }

  _defineConverters() {
    const { conversion, editing, t } = this.editor;

    // Defines conversion for Accordion Attributes
    conversion.attributeToAttribute({
      model: "AccordionId",
      view: "data-accordion-id",
    });
    conversion.attributeToAttribute({
      model: {
        key: "AccordionItemsStayOpen",
        values: ["true"],
      },
      view: {
        true: { key: "class", value: "accordion-items-stay-open" },
      },
    });
    conversion.attributeToAttribute({
      model: {
        key: "AccordionItemButtonCollapsed",
        values: ["true"],
      },
      view: {
        true: { key: "class", value: "collapsed" },
      },
    });
    conversion.attributeToAttribute({
      model: {
        key: "AccordionCollapseShow",
        values: ["true"],
      },
      view: {
        true: { key: "class", value: "show" },
      },
    });

    // Defines conversion for AccordionBlock.
    conversion.for("upcast").add((dispatcher) => {
      dispatcher.on("element:div", (_evt, data, conversionApi) => {
        const viewItem = data.viewItem;
        if (
          conversionApi.consumable.consume(viewItem, {
            name: true,
            classes: "accordion",
          })
        ) {
          const modelElement = conversionApi.writer.createElement(
            "AccordionBlock",
            {
              // Enforces a default for accordion id.
              AccordionId:
                viewItem.getAttribute("data-accordion-id") ||
                viewItem.getAttribute("id") ||
                uid(),
            },
          );
          // Forces insertion and conversion of a clean `Accordion`
          // model element.
          if (conversionApi.safeInsert(modelElement, data.modelCursor)) {
            conversionApi.convertChildren(viewItem, modelElement);
            conversionApi.updateConversionResult(modelElement, data);
          }
        }
      });
    });
    conversion.for("editingDowncast").elementToElement({
      model: "AccordionBlock",
      view: (_modelElement, { writer }) =>
        toWidget(
          writer.createContainerElement("div", {
            class: "ckeditor5-accordion__widget",
          }),
          writer,
          { label: t("Accordion widget"), hasSelectionHandle: true },
        ),
    });
    conversion.for("dataDowncast").elementToElement({
      model: "AccordionBlock",
      view: {
        name: "div",
        classes: "accordion",
      },
    });

    // Defines conversion for AccordionItem.
    conversion.for("upcast").elementToElement({
      model: "AccordionItem",
      view: {
        name: "div",
        classes: "accordion-item",
      },
    });
    conversion.for("editingDowncast").elementToElement({
      model: "AccordionItem",
      view: {
        name: "div",
        classes: "ckeditor5-accordion-item",
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "AccordionItem",
      view: {
        name: "div",
        classes: "accordion-item",
      },
    });
    // Defines conversion for AccordionItemHeader.
    conversion.for("upcast").add((dispatcher) => {
      dispatcher.on("element", (_evt, data, conversionApi) => {
        if (
          conversionApi.consumable.consume(data.viewItem, {
            name: true,
            classes: "accordion-header",
          })
        ) {
          const modelElement = conversionApi.writer.createElement(
            "AccordionItemHeader",
          );
          // Forces insertion and conversion of a clean
          // `AccordionItemHeader` model element.
          if (conversionApi.safeInsert(modelElement, data.modelCursor)) {
            conversionApi.convertChildren(data.viewItem, modelElement);
            conversionApi.updateConversionResult(modelElement, data);
          }
        }
      });
    });
    conversion.for("editingDowncast").elementToElement({
      model: "AccordionItemHeader",
      view: {
        name: "div",
        classes: "ckeditor5-accordion-header",
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "AccordionItemHeader",
      view: {
        name: "div",
        classes: "accordion-header",
      },
    });

    // Defines conversion for AccordionItemButton.
    conversion.for("upcast").add((dispatcher) => {
      dispatcher.on("element:a", (_evt, data, conversionApi) => {
        if (
          conversionApi.consumable.consume(data.viewItem, {
            name: true,
            classes: "accordion-button",
            attributes: ["href"],
          }) ||
          conversionApi.consumable.consume(data.viewItem, {
            name: true,
            classes: "accordion-button",
          })
        ) {
          const modelElement = conversionApi.writer.createElement(
            "AccordionItemButton",
          );
          // Forces insertion and conversion of a clean
          // `AccordionItemButton` model element.
          if (conversionApi.safeInsert(modelElement, data.modelCursor)) {
            conversionApi.convertChildren(data.viewItem, modelElement);
            conversionApi.updateConversionResult(modelElement, data);
          }
        }
      });
      dispatcher.on("element:button", (_evt, data, conversionApi) => {
        if (
          conversionApi.consumable.consume(data.viewItem, {
            name: true,
            classes: "accordion-button",
          })
        ) {
          const modelElement = conversionApi.writer.createElement(
            "AccordionItemButton",
          );
          // Forces insertion and conversion of a clean
          // `AccordionItemButton` model element.
          if (!conversionApi.safeInsert(modelElement, data.modelCursor)) {
            conversionApi.convertChildren(data.viewItem, modelElement);
            conversionApi.updateConversionResult(modelElement, data);
          }
        }
      });
    });
    conversion.for("editingDowncast").elementToElement({
      model: "AccordionItemButton",
      view: (_modelElement, { writer }) => {
        const element = writer.createEditableElement("a", {
          class: "ckeditor5-accordion-button",
          href: "#",
        });
        element.placeholder = t("Accordion item");
        enablePlaceholder({
          view: editing.view,
          element,
          keepOnFocus: true,
        });
        const widget = toWidgetEditable(element, writer, {
          label: t("Accordion item header"),
        });
        return widget;
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "AccordionItemButton",
      view: {
        name: "a",
        classes: "accordion-button",
        attributes: {
          href: "#",
        },
      },
    });

    // Defines conversion for AccordionCollapse.
    conversion.for("upcast").elementToElement({
      model: "AccordionCollapse",
      view: {
        name: "div",
        classes: "accordion-collapse",
      },
    });
    conversion.for("editingDowncast").elementToElement({
      model: "AccordionCollapse",
      view: {
        name: "div",
        classes: "ckeditor5-accordion-collapse",
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "AccordionCollapse",
      view: {
        name: "div",
        classes: ["accordion-collapse", "collapse"],
      },
    });

    // Defines conversion for AccordionItemContent.
    conversion.for("upcast").elementToElement({
      model: "AccordionItemContent",
      view: {
        name: "div",
        classes: "accordion-body",
      },
    });
    conversion.for("editingDowncast").elementToElement({
      model: "AccordionItemContent",
      view: (_modelElement, { writer }) => {
        const element = writer.createEditableElement("div", {
          class: "ckeditor5-accordion-body",
        });
        element.placeholder = t("Accordion item body");
        enablePlaceholder({
          view: editing.view,
          element,
          isDirectHost: false,
          keepOnFocus: true,
        });
        return toWidgetEditable(element, writer, {
          label: t("Accordion item body"),
        });
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "AccordionItemContent",
      view: {
        name: "div",
        classes: "accordion-body",
      },
    });
  }

  /**
   * Defines the commands for inserting or modifying the accordion.
   */
  _defineCommands() {
    const editor = this.editor;
    const commands = editor.commands;
    commands.add("insertAccordion", new InsertAccordionCommand(editor));
    commands.add("insertAccordionItem", new InsertAccordionItemCommand(editor));
    commands.add("removeAccordionItem", new RemoveAccordionItemCommand(editor));
    commands.add(
      "AccordionFirstItemOpen",
      new AccordionFirstItemOpenCommand(editor),
    );
    commands.add(
      "AccordionItemsStayOpen",
      new ModifyAccordionCommand(
        editor,
        "AccordionItemsStayOpen",
        true, // Default value for AccordionItemsStayOpen
      ),
    );
    commands.add("AccordionOpenAll", new AccordionOpenAllCommand(editor));
    commands.add(
      "AccordionCollapseAll",
      new AccordionCollapseAllCommand(editor),
    );
  }
}
