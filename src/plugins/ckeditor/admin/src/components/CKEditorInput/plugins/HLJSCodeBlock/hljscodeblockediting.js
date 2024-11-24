import HLJSCodeBlockCommand from "./hljscodeblockcommand";
import IndentHLJSCodeBlockCommand from "./indenthljscodeblockcommand";
import OutdentHLJSCodeBlockCommand from "./outdenthljscodeblockcommand";
import {
  getNormalizedAndLocalizedLanguageDefinitions,
  getLeadingWhiteSpaces,
  rawSnippetTextToModelDocumentFragment,
} from "./utils";
import {
  modelToViewCodeBlockInsertion,
  modelToDataViewSoftBreakInsertion,
  dataViewToModelCodeBlockInsertion,
} from "./converters";
import hljs from "highlight.js";
const {Plugin} = window.CKEDITOR;
const {ShiftEnter} = window.CKEDITOR;

export default class HLJSCodeBlockEditing extends Plugin {
  static get pluginName() {
    return "HLJSCodeBlockEditing";
  }

  static get requires() {
    return [ShiftEnter];
  }

  constructor(editor) {
    super(editor);

    editor.config.define("hljsCodeBlock", {
      languages: [
        {
          language: "javascript",
          label: "JavaScript",
        },
        {
          language: "python",
          label: "Python",
        },
      ],
      // A single tab.
      indentSequence: "\t",
    });
  }

  init() {
    const editor = this.editor;
    const schema = editor.model.schema;
    const model = editor.model;

    const normalizedLanguagesDefs =
      getNormalizedAndLocalizedLanguageDefinitions(editor);

    // The main command.
    editor.commands.add("hljsCodeBlock", new HLJSCodeBlockCommand(editor));

    // Commands that change the indentation.
    editor.commands.add(
      "indentHLJSCodeBlock",
      new IndentHLJSCodeBlockCommand(editor),
    );
    editor.commands.add(
      "outdentHLJSCodeBlock",
      new OutdentHLJSCodeBlockCommand(editor),
    );

    const getCommandExecuter = (commandName) => {
      return (data, cancel) => {
        const command = this.editor.commands.get(commandName);

        if (command.isEnabled) {
          this.editor.execute(commandName);
          cancel();
        }
      };
    };

    editor.keystrokes.set("Tab", getCommandExecuter("indentHLJSCodeBlock"));
    editor.keystrokes.set(
      "Shift+Tab",
      getCommandExecuter("outdentHLJSCodeBlock"),
    );

    schema.register("hljsCodeBlock", {
      allowWhere: "$block",
      isBlock: true,
      allowAttributes: ["language"],
    });

    schema.extend("$text", {
      allowIn: "hljsCodeBlock",
    });

    // Disallow all attributes on $text inside `codeBlock`.
    schema.addAttributeCheck((context, attributeName) => {
      if (context.endsWith("hljsCodeBlock $text") && attributeName !== "hljs") {
        return false;
      }
    });

    // Conversion.
    editor.editing.downcastDispatcher.on(
      "insert:hljsCodeBlock",
      modelToViewCodeBlockInsertion(model, normalizedLanguagesDefs, true),
    );
    editor.data.downcastDispatcher.on(
      "insert:hljsCodeBlock",
      modelToViewCodeBlockInsertion(model, normalizedLanguagesDefs),
    );
    editor.data.downcastDispatcher.on(
      "insert:softBreak",
      modelToDataViewSoftBreakInsertion(model),
      {
        priority: "high",
      },
    );
    editor.data.upcastDispatcher.on(
      "element:pre",
      dataViewToModelCodeBlockInsertion(
        editor.editing.view,
        normalizedLanguagesDefs,
      ),
    );

    // Intercept the clipboard input (paste) when the selection is anchored in the code block and force the clipboard
    // data to be pasted as a single plain text. Otherwise, the code lines will split the code block and
    // "spill out" as separate paragraphs.
    this.listenTo(
      editor.editing.view.document,
      "clipboardInput",
      (evt, data) => {
        const modelSelection = model.document.selection;

        if (!modelSelection.anchor.parent.is("element", "hljsCodeBlock")) {
          return;
        }

        const text = data.dataTransfer.getData("text/plain");

        model.change((writer) => {
          model.insertContent(
            rawSnippetTextToModelDocumentFragment(writer, text),
            modelSelection,
          );
          evt.stop();
        });
      },
    );

    // Make sure multi–line selection is always wrapped in a code block when `getSelectedContent()`
    // is used (e.g. clipboard copy). Otherwise, only the raw text will be copied to the clipboard and,
    // upon next paste, this bare text will not be inserted as a code block, which is not the best UX.
    // Similarly, when the selection in a single line, the selected content should be an inline code
    // so it can be pasted later on and retain it's preformatted nature.
    this.listenTo(model, "getSelectedContent", (evt, [selection]) => {
      const anchor = selection.anchor;

      if (
        selection.isCollapsed ||
        !anchor.parent.is("element", "hljsCodeBlock") ||
        !anchor.hasSameParentAs(selection.focus)
      ) {
        return;
      }

      model.change((writer) => {
        const docFragment = evt.return;

        if (
          docFragment.childCount > 1 ||
          selection.containsEntireContent(anchor.parent)
        ) {
          const codeBlock = writer.createElement(
            "hljsCodeBlock",
            anchor.parent.getAttributes(),
          );
          writer.append(docFragment, codeBlock);

          const newDocumentFragment = writer.createDocumentFragment();
          writer.append(codeBlock, newDocumentFragment);

          evt.return = newDocumentFragment;
        } else {
          const textNode = docFragment.getChild(0);

          if (schema.checkAttribute(textNode, "code")) {
            writer.setAttribute("code", true, textNode);
          }
        }
      });
    });
  }

  /**
   * @inheritDoc
   */
  afterInit() {
    const editor = this.editor;
    const commands = editor.commands;
    const indent = commands.get("indent");
    const outdent = commands.get("outdent");

    if (indent) {
      indent.registerChildCommand(commands.get("indentHLJSCodeBlock"));
    }

    if (outdent) {
      outdent.registerChildCommand(commands.get("outdentHLJSCodeBlock"));
    }

    // Customize the response to the <kbd>Enter</kbd> and <kbd>Shift</kbd>+<kbd>Enter</kbd>
    // key press when the selection is in the code block. Upon enter key press we can either
    // leave the block if it's "two enters" in a row or create a new code block line, preserving
    // previous line's indentation.
    this.listenTo(editor.editing.view.document, "enter", (evt, data) => {
      const positionParent =
        editor.model.document.selection.getLastPosition().parent;

      if (!positionParent.is("element", "hljsCodeBlock")) {
        return;
      }

      breakLineOnEnter(editor);

      data.preventDefault();
      evt.stop();
    });

    editor.model.document.on("change:data", (eventInfo, batch) => {
      const positionParent =
        editor.model.document.selection.getLastPosition().parent;
      window.eventInfo = eventInfo;
      window.batch = batch;

      if (!positionParent.is("element", "hljsCodeBlock")) {
        return;
      }

      const nodes = batch.operations[0].nodes;
      if (nodes) {
        // enter is pressed
        if (nodes.getNode(0).name === "softBreak") return;
        // tab is pressed
        if (nodes.getNode(0).data === "\t") return;
      }

      let textData = "";
      for (let node of positionParent.getChildren()) {
        let str;
        if (node.name === "softBreak") str = "\n";
        else str = node.data;
        textData += str;
      }
      const res = hljs.highlight(
        positionParent.getAttribute("language"),
        textData,
      );
      const dom = new DOMParser().parseFromString(
        "<div>" + res.value + "</div>",
        "text/xml",
      );

      editor.model.change((writer) => {
        const curPath = editor.model.document.selection.getFirstPosition().path;
        writer.remove(writer.createRangeIn(positionParent));
        for (let node of dom.children[0].childNodes) {
          if (node.nodeName === "span") {
            writer.appendText(
              node.textContent,
              {
                hljs: node.className,
              },
              positionParent,
            );
          } else if (node.nodeName === "#text") {
            writer.appendText(node.textContent, positionParent);
          }
        }

        const position = writer.createPositionFromPath(
          editor.model.document.getRoot(),
          [...curPath],
        );
        writer.setSelection(position);
      });
    });
  }
}

function breakLineOnEnter(editor) {
  const model = editor.model;
  const modelDoc = model.document;
  const lastSelectionPosition = modelDoc.selection.getLastPosition();
  const node =
    lastSelectionPosition.nodeBefore || lastSelectionPosition.textNode;
  let leadingWhiteSpaces;

  // Figure out the indentation (white space chars) at the beginning of the line.
  if (node && node.is("$text")) {
    leadingWhiteSpaces = getLeadingWhiteSpaces(node);
  }

  // Keeping everything in a change block for a single undo step.
  editor.model.change((writer) => {
    editor.execute("shiftEnter");
  });
}
