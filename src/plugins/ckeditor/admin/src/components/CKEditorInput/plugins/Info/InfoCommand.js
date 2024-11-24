const { Command } = window.CKEDITOR;

export default class InsertInfoCommand extends Command {
  execute() {
    this.editor.model.change((writer) => {
      this.editor.model.insertObject(createInfo(writer));
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

function createInfo(writer) {
  const Info = writer.createElement("Info");
  const InfoTitle = writer.createElement("InfoTitle");
  const InfoContent = writer.createElement("InfoContent");

  writer.append(InfoTitle, Info);
  writer.append(InfoContent, Info);

  return Info;
}
