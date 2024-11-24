import InsertInfoCommand from "./InfoCommand.js";

const { Plugin } = window.CKEDITOR;
const { Widget } = window.CKEDITOR;
const { toWidget } = window.CKEDITOR;
const { toWidgetEditable } = window.CKEDITOR;

export default class InfoEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();

    this.editor.commands.add("insertInfo", new InsertInfoCommand(this.editor));
  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register("Info", {
      // Behaves like a self-contained block object (e.g. a block image)
      // allowed in places where other blocks are allowed (e.g. directly in the root).
      inheritAllFrom: "$blockObject",
    });

    schema.register("InfoTitle", {
      isLimit: true,
      isContent: true, // Preserve in data view even when empty.
      allowIn: "Info",
      // Allows only text and text-like elements (like icons) inside.
      allowContentOf: "$block", // $text attributes disallowed by PlainText plugin.
    });

    schema.register("InfoContent", {
      isLimit: true,
      allowIn: "Info",
      allowContentOf: "paragraph", // Behaves like a paragraph
    });
  }

  _defineConverters() {
    const { conversion, editing, t } = this.editor;

    // Info converters
    conversion.for("upcast").elementToElement({
      model: "Info",
      view: {
        name: "section",
        classes: "Info",
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "Info",
      view: {
        name: "section",
        classes: "Info",
      },
    });
    conversion.for("editingDowncast").elementToElement({
      model: "Info",
      view: (modelElement, { writer: viewWriter }) => {
        const section = viewWriter.createContainerElement("section", {
          class: "Info",
        });

        return toWidget(section, viewWriter, { label: "info widget" });
      },
    });

    // InfoTitle converters
    conversion.for("upcast").elementToElement({
      model: "InfoTitle",
      view: {
        name: "h3",
        classes: "InfoTitle",
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "InfoTitle",
      view: {
        name: "h3",
        classes: "InfoTitle",
      },
    });
    conversion.for("editingDowncast").elementToElement({
      model: "InfoTitle",
      view: (modelElement, { writer: viewWriter }) => {
        const h3 = viewWriter.createEditableElement("h3");

        return toWidgetEditable(h3, viewWriter);
      },
    });

    // InfoContent converters
    conversion.for("upcast").elementToElement({
      model: "InfoContent",
      view: {
        name: "p",
        classes: "InfoContent",
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "InfoContent",
      view: {
        name: "p",
        classes: "InfoContent",
      },
    });
    conversion.for("editingDowncast").elementToElement({
      model: "InfoContent",
      view: (_modelElement, { writer }) => {
        const p = writer.createEditableElement("p", { class: "InfoContent" });
        return toWidgetEditable(p, writer);
      },
    });
  }
}
