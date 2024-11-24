const { Command } = window.CKEDITOR;

export default class InsertCalloutCommand extends Command {
  execute() {
    this.editor.model.change((writer) => {
      // Insert <simpleBox>*</simpleBox> at the current selection position
      // in a way that will result in creating a valid model structure.
      this.editor.model.insertObject(createCallout(writer));
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

function createCallout(writer) {
  const Callout = writer.createElement("Callout");
  const CalloutContent = writer.createElement("CalloutContent");

  writer.append(CalloutContent, Callout);
  // There must be at least one paragraph for the description to be editable.
  // See https://github.com/ckeditor/ckeditor5/issues/1464.
  writer.appendElement("paragraph", CalloutContent);
  return Callout;
}
