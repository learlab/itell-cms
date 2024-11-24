import {
  getLeadingWhiteSpaces,
  getIndentOutdentPositions,
  isModelSelectionInHLJSCodeBlock,
} from "./utils";
const {Command} = window.CKEDITOR;

export default class OutdentHLJSCodeBlockCommand extends Command {
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
        const range = getLastOutdentableSequenceRange(
          this.editor.model,
          position,
          this._indentSequence,
        );

        if (range) {
          writer.remove(range);
        }
      }
    });
  }

  _checkEnabled() {
    if (!this._indentSequence) {
      return false;
    }

    const model = this.editor.model;

    if (!isModelSelectionInHLJSCodeBlock(model.document.selection)) {
      return false;
    }

    // Outdent command can execute only when there is an indent character sequence
    // in some of the lines.
    return getIndentOutdentPositions(model).some((position) => {
      return getLastOutdentableSequenceRange(
        model,
        position,
        this._indentSequence,
      );
    });
  }
}

function getLastOutdentableSequenceRange(model, position, sequence) {
  // Positions start before each text node (code line). Get the node corresponding to the position.
  const nodeAtPosition = getCodeLineTextNodeAtPosition(position);

  if (!nodeAtPosition) {
    return null;
  }

  const leadingWhiteSpaces = getLeadingWhiteSpaces(nodeAtPosition);
  const lastIndexOfSequence = leadingWhiteSpaces.lastIndexOf(sequence);

  if (lastIndexOfSequence + sequence.length !== leadingWhiteSpaces.length) {
    return null;
  }

  if (lastIndexOfSequence === -1) {
    return null;
  }

  const { parent, startOffset } = nodeAtPosition;
  return model.createRange(
    model.createPositionAt(parent, startOffset + lastIndexOfSequence),
    model.createPositionAt(
      parent,
      startOffset + lastIndexOfSequence + sequence.length,
    ),
  );
}

function getCodeLineTextNodeAtPosition(position) {
  // Positions start before each text node (code line). Get the node corresponding to the position.
  let nodeAtPosition = position.parent.getChild(position.index);

  if (!nodeAtPosition || nodeAtPosition.is("element", "softBreak")) {
    nodeAtPosition = position.nodeBefore;
  }

  if (!nodeAtPosition || nodeAtPosition.is("element", "softBreak")) {
    return null;
  }

  return nodeAtPosition;
}
