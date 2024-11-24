import InsertStaticCodeCommand from "./StaticCodeCommand.js";

const {Plugin} = window.CKEDITOR;
const {Widget} = window.CKEDITOR;
const {toWidget} = window.CKEDITOR;
const {toWidgetEditable} = window.CKEDITOR;
const {enablePlaceholder} = window.CKEDITOR;


export default class StaticCodeEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();

    this.editor.commands.add(
      "insertStaticCode",
      new InsertStaticCodeCommand(this.editor),
    );
  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register("StaticCode", {
      // Behaves like a self-contained block object (e.g. a block image)
      // allowed in places where other blocks are allowed (e.g. directly in the root).
      inheritAllFrom: "$blockObject",
    });

    schema.register("StaticCodeAttributes", {
      isLimit: true,
      allowIn: "StaticCode",
      allowChildren: "$text", // $text attributes disallowed by PlainText plugin.
    });

    schema.register("StaticCodeContent", {
      isLimit: true,
      allowIn: "StaticCode",
      allowChildren: ["hljsCodeBlock"],
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    // StaticCode converters
    conversion.for("upcast").elementToElement({
      model: "StaticCode",
      view: {
        name: "section",
        classes: "StaticCode",
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "StaticCode",
      view: {
        name: "section",
        classes: "StaticCode",
      },
    });
    conversion.for("editingDowncast").elementToElement({
      model: "StaticCode",
      view: (modelElement, { writer: viewWriter }) => {
        const section = viewWriter.createContainerElement("section", {
          class: "StaticCode",
        });

        return toWidget(section, viewWriter, { label: "staticCode widget" });
      },
    });

    // StaticCodeAttributes converters
    conversion.for("upcast").elementToElement({
      model: "StaticCodeAttributes",
      view: {
        name: "p",
        classes: "StaticCodeAttributes",
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "StaticCodeAttributes",
      view: {
        name: "p",
        classes: "StaticCodeAttributes",
      },
    });
    conversion.for("editingDowncast").elementToElement({
      model: "StaticCodeAttributes",
      view: (modelElement, { writer: viewWriter }) => {
        // Note: You use a more specialized createEditableElement() method here.
        const p = viewWriter.createEditableElement("p");
        enablePlaceholder({
          view: this.editor.editing.view,
          element: p,
          text: "Attributes",
        });

        return toWidgetEditable(p, viewWriter);
      },
    });

    // StaticCodeContent converters
    conversion.for("upcast").elementToElement({
      model: "StaticCodeContent",
      view: {
        name: "div",
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "StaticCodeContent",
      view: {
        name: "div",
      },
    });
    conversion.for("editingDowncast").elementToElement({
      model: "StaticCodeContent",
      view: (modelElement, { writer: viewWriter }) => {
        // Note: You use a more specialized createEditableElement() method here.
        const div = viewWriter.createEditableElement("div");

        return toWidgetEditable(div, viewWriter);
      },
    });
  }
}
