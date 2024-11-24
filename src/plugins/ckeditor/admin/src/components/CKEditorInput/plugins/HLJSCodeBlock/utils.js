const {first} = window.CKEDITOR;

export function getNormalizedAndLocalizedLanguageDefinitions(editor) {
  const t = editor.t;
  const languageDefs = editor.config.get("hljsCodeBlock.languages");

  for (const def of languageDefs) {
    if (def.label === "Plain text") {
      def.label = t("Plain text");
    }

    if (def.class === undefined) {
      def.class = `language-${def.language}`;
    }
  }

  return languageDefs;
}

export function getPropertyAssociation(languageDefs, key, value) {
  const association = {};

  for (const def of languageDefs) {
    if (key === "class") {
      // Only the first class is considered.
      association[def[key].split(" ").shift()] = def[value];
    } else {
      association[def[key]] = def[value];
    }
  }

  return association;
}

export function getLeadingWhiteSpaces(textNode) {
  return textNode.data.match(/^(\s*)/)[0];
}

export function rawSnippetTextToModelDocumentFragment(writer, text) {
  const fragment = writer.createDocumentFragment();
  const textLines = text.split("\n").map((data) => writer.createText(data));
  const lastLine = textLines[textLines.length - 1];

  for (const node of textLines) {
    writer.append(node, fragment);

    if (node !== lastLine) {
      writer.appendElement("softBreak", fragment);
    }
  }

  return fragment;
}
/*

*/

export function domCodeToModel(dom, writer) {
  const fragment = writer.createDocumentFragment();
  if (!dom.children[0]) return fragment;
  const models = Array.prototype.map.call(
    dom.children[0].childNodes,
    (node) => {
      if (node.nodeName === "span") {
        return writer.createText(node.textContent, { hljs: node.className });
      } else if (node.nodeName === "#text") {
        return writer.createText(node.textContent);
      }
    },
  );

  models.forEach((model) => {
    writer.append(model, fragment);
  });
  return fragment;
}

export function getIndentOutdentPositions(model) {
  const selection = model.document.selection;
  const positions = [];

  // When the selection is collapsed, there's only one position we can indent or outdent.
  if (selection.isCollapsed) {
    positions.push(selection.anchor);
  }

  // When the selection is NOT collapsed, collect all positions starting before text nodes
  // (code lines) in any <codeBlock> within the selection.
  else {
    // Walk backward so positions we're about to collect here do not get outdated when
    // inserting or deleting using the writer.
    const walker = selection.getFirstRange().getWalker({
      ignoreElementEnd: true,
      direction: "backward",
    });

    for (const { item } of walker) {
      if (item.is("$textProxy") && item.parent.is("element", "hljsCodeBlock")) {
        const leadingWhiteSpaces = getLeadingWhiteSpaces(item.textNode);
        const { parent, startOffset } = item.textNode;

        // Make sure the position is after all leading whitespaces in the text node.
        const position = model.createPositionAt(
          parent,
          startOffset + leadingWhiteSpaces.length,
        );

        positions.push(position);
      }
    }
  }

  return positions;
}

export function isModelSelectionInHLJSCodeBlock(selection) {
  const firstBlock = first(selection.getSelectedBlocks());

  return firstBlock && firstBlock.is("element", "hljsCodeBlock");
}
