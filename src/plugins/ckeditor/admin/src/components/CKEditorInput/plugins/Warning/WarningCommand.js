const { Command } = window.CKEDITOR;

export default class InsertWarningCommand extends Command {
  execute() {
    this.editor.model.change((writer) => {
      // Insert <simpleBox>*</simpleBox> at the current selection position
      // in a way that will result in creating a valid model structure.
      this.editor.model.insertObject(createWarning(writer));
    });
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const allowedIn = model.schema.findAllowedParent(
      selection.getFirstPosition(),
      "Info",
    );

    this.isEnabled = allowedIn !== null;
  }
}

function createWarning(writer) {
  const Warning = writer.createElement("Warning");
  const WarningContent = writer.createElement("WarningContent");

  writer.append(WarningContent, Warning);
  // There must be at least one paragraph for the description to be editable.
  // See https://github.com/ckeditor/ckeditor5/issues/1464.
  writer.appendElement("paragraph", WarningContent);
  return Warning;
}
