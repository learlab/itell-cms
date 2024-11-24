import {
  getIndentOutdentPositions,
  isModelSelectionInHLJSCodeBlock,
} from "./utils";

const {Command} = window.CKEDITOR;

export default class IndentHLJSCodeBlockCommand extends Command {
  constructor(editor) {
    super(editor);

    this._indentSequence = editor.config.get("hljsCodeBlock.indentSequence");
  }

  refresh() {
    this.isEnabled = this._checkEnabled();
  }

  execute() {
    const editor = this.editor;
    const model = editor.model;

    model.change((writer) => {
      const positions = getIndentOutdentPositions(model);

      for (const position of positions) {
        writer.insertText(this._indentSequence, position);
      }
    });
  }

  _checkEnabled() {
    if (!this._indentSequence) {
      return false;
    }

    // Indent (forward) command is always enabled when there's any code block in the selection
    // because you can always indent code lines.
    return isModelSelectionInHLJSCodeBlock(
      this.editor.model.document.selection,
    );
  }
}
