const {Command} = window.CKEDITOR;

export default class InsertCodingSandboxCommand extends Command {
  execute(language) {
    this.editor.model.change((writer) => {
      // Insert <simpleBox>*</simpleBox> at the current selection position
      // in a way that will result in creating a valid model structure.
      this.editor.model.insertObject(createCodingSandbox(writer, language));
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

function createCodingSandbox(writer, language) {
  const CodingSandbox = writer.createElement("CodingSandbox");
  const CodingSandboxContent = writer.createElement("CodingSandboxContent");
  const HLJSCodeBlock = writer.createElement("hljsCodeBlock", {
    language: `${language.toLowerCase()}`,
  });

  writer.append(CodingSandboxContent, CodingSandbox);
  writer.append(HLJSCodeBlock, CodingSandboxContent);
  return CodingSandbox;
}
