import { getNormalizedAndLocalizedLanguageDefinitions } from "./utils";

const {Command} = window.CKEDITOR;
const {first} = window.CKEDITOR;

export default class HLJSCodeBlockCommand extends Command {
  refresh() {
    this.value = this._getValue();
    this.isEnabled = this._checkEnabled();
  }

  execute(options = {}) {
    const editor = this.editor;
    const model = editor.model;
    const selection = model.document.selection;
    const normalizedLanguagesDefs =
      getNormalizedAndLocalizedLanguageDefinitions(editor);
    const firstLanguageInConfig = normalizedLanguagesDefs[0];

    const blocks = Array.from(selection.getSelectedBlocks());
    const value =
      options.forceValue === undefined ? !this.value : options.forceValue;
    const language = options.language || firstLanguageInConfig.language;

    model.change((writer) => {
      if (value) {
        this._applyCodeBlock(writer, blocks, language);
      } else {
        this._removeCodeBlock(writer, blocks);
      }
    });
  }

  _getValue() {
    const selection = this.editor.model.document.selection;
    const firstBlock = first(selection.getSelectedBlocks());
    const isCodeBlock = !!(
      firstBlock && firstBlock.is("element", "hljsCodeBlock")
    );

    return isCodeBlock ? firstBlock.getAttribute("language") : false;
  }

  _checkEnabled() {
    if (this.value) {
      return true;
    }

    const selection = this.editor.model.document.selection;
    const schema = this.editor.model.schema;

    const firstBlock = first(selection.getSelectedBlocks());

    if (!firstBlock) {
      return false;
    }

    return canBeCodeBlock(schema, firstBlock);
  }

  _applyCodeBlock(writer, blocks, language) {
    const schema = this.editor.model.schema;
    const allowedBlocks = blocks.filter((block) =>
      canBeCodeBlock(schema, block),
    );

    for (const block of allowedBlocks) {
      writer.rename(block, "hljsCodeBlock");
      writer.setAttribute("language", language, block);
      schema.removeDisallowedAttributes([block], writer);
    }

    allowedBlocks.reverse().forEach((currentBlock, i) => {
      const nextBlock = allowedBlocks[i + 1];

      if (currentBlock.previousSibling === nextBlock) {
        writer.appendElement("softBreak", nextBlock);
        writer.merge(writer.createPositionBefore(currentBlock));
      }
    });
  }

  _removeCodeBlock(writer, blocks) {
    const codeBlocks = blocks.filter((block) =>
      block.is("element", "hsjsCodeBlock"),
    );

    for (const block of codeBlocks) {
      const range = writer.createRangeOn(block);

      for (const item of Array.from(range.getItems()).reverse()) {
        if (
          item.is("element", "softBreak") &&
          item.parent.is("element", "hsjsCodeBlock")
        ) {
          const { position } = writer.split(writer.createPositionBefore(item));

          writer.rename(position.nodeAfter, "paragraph");
          writer.removeAttribute("language", position.nodeAfter);
          writer.remove(item);
        }
      }

      writer.rename(block, "paragraph");
      writer.removeAttribute("language", block);
    }
  }
}

function canBeCodeBlock(schema, element) {
  if (element.is("rootElement") || schema.isLimit(element)) {
    return false;
  }

  return schema.checkChild(element.parent, "hsjsCodeBlock");
}
