import InsertCalloutCommand from "./CalloutCommand.js";

const { Plugin } = window.CKEDITOR;
const { Widget } = window.CKEDITOR;
const { toWidget } = window.CKEDITOR;
const { toWidgetEditable } = window.CKEDITOR;

export default class CalloutEditing extends Plugin {
  static get requires() {
    return [Widget];
  }
  init() {
    this._defineSchema();
    this._defineConverters();
    this.editor.commands.add(
      "insertCallout",
      new InsertCalloutCommand(this.editor),
    );
  }
  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register("Callout", {
      // Behaves like a self-contained block object (e.g. a block image)
      // allowed in places where other blocks are allowed (e.g. directly in the root).
      inheritAllFrom: "$blockObject",
      allowChildren: ["CalloutContent"],
    });

    schema.register("CalloutContent", {
      // Cannot be split or left by the caret.
      isLimit: true,
      allowIn: ["Callout"],
      allowChildren: ["paragraph", "listItem"],
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    conversion.for("dataDowncast").elementToElement({
      model: {
        name: "Callout",
      },
      view: {
        name: "section",
        classes: "Callout",
      },
    });
    conversion.for("editingDowncast").elementToElement({
      model: {
        name: "Callout",
      },
      view: (modelElement, { writer }) => {
        const section = writer.createContainerElement("section", {
          class: "Callout",
        });

        return toWidget(section, writer, { label: "Callout widget" });
      },
    });

    conversion.for("upcast").elementToElement({
      view: {
        name: "section",
        classes: "Callout",
      },
      model: (viewElement, { writer }) => {
        return writer.createElement("Callout");
      },
    });

    conversion.for("upcast").elementToElement({
      model: "CalloutContent",
      view: {
        name: "div",
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "CalloutContent",
      view: {
        name: "div",
      },
    });
    conversion.for("editingDowncast").elementToElement({
      model: "CalloutContent",
      view: (modelElement, { writer: writer }) => {
        // Note: You use a more specialized createEditableElement() method here.
        const div = writer.createEditableElement("div");

        return toWidgetEditable(div, writer);
      },
    });
  }
}
