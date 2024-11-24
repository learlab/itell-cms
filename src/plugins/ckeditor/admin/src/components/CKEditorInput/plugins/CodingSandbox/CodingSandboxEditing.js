import InsertCodingSandboxCommand from "./CodingSandboxCommand.js";

const {Plugin} = window.CKEDITOR;
const {Widget} = window.CKEDITOR;
const {toWidget} = window.CKEDITOR;
const {toWidgetEditable} = window.CKEDITOR;

export default class CodingSandboxEditing extends Plugin {
  static get requires() {
    return [Widget];
  }
  init() {
    this._defineSchema();
    this._defineConverters();
    this.editor.commands.add(
      "insertCodingSandbox",
      new InsertCodingSandboxCommand(this.editor),
    );
  }
  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register("CodingSandbox", {
      // Behaves like a self-contained block object (e.g. a block image)
      // allowed in places where other blocks are allowed (e.g. directly in the root).
      inheritAllFrom: "$blockObject",
      allowChildren: ["CodingSandboxContent"],
    });

    schema.register("CodingSandboxContent", {
      // Cannot be split or left by the caret.
      isLimit: true,
      allowIn: "CodingSandbox",
      allowChildren: ["hljsCodeBlock"],
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    conversion.for("dataDowncast").elementToElement({
      model: {
        name: "CodingSandbox",
      },
      view: {
        name: "section",
        classes: "CodingSandbox",
      },
    });
    conversion.for("editingDowncast").elementToElement({
      model: {
        name: "CodingSandbox",
      },
      view: (modelElement, { writer }) => {
        const section = writer.createContainerElement("section", {
          class: "CodingSandbox",
        });

        return toWidget(section, writer, { label: "CodingSandbox widget" });
      },
    });

    conversion.for("upcast").elementToElement({
      view: {
        name: "section",
        classes: "CodingSandbox",
      },
      model: (viewElement, { writer }) => {
        return writer.createElement("CodingSandbox");
      },
    });

    conversion.for("upcast").elementToElement({
      model: "CodingSandboxContent",
      view: {
        name: "div",
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "CodingSandboxContent",
      view: {
        name: "div",
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "CodingSandboxContent",
      view: (modelElement, { writer: writer }) => {
        const div = writer.createEditableElement("div");
        return toWidgetEditable(div, writer);
      },
    });
  }
}
