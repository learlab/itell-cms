import {
  getSelectedAccordionItemModelElement,
  getSelectedAccordionModelElement,
  createAccordionItem,
  isAccordionItemOpen,
  setAccordionItemIsOpen,
} from "./AccordionUtils";

const { Command } = window.CKEDITOR;
const { findOptimalInsertionRange } = window.CKEDITOR;
const { uid } = window.CKEDITOR;

/**
 * Represents a command which is executed when the accordion toolbar button is
 * pressed to insert an accordion.
 */
export class InsertAccordionCommand extends Command {
  refresh() {
    const model = this.editor.model;
    const { document, schema } = model;

    // Determine if the cursor (selection) is in a position where adding an
    // accordion is permitted. This is based on the schema of the model(s)
    // currently containing the cursor.
    this.isEnabled = schema.checkChild(
      getParentElement(document.selection, model),
      "AccordionBlock",
    );
  }

  execute() {
    const { editing, model } = this.editor;

    model.change((writer) => {
      // Insert <Accordion></Accordion> at the current
      // selection position in a way that will result in creating a valid model
      // structure.
      const accordion = writer.createElement("AccordionBlock", {
        AccordionId: uid(),
        AccordionItemsStayOpen: "true",
      });
      const { accordionItem } = createAccordionItem(writer);
      writer.append(accordionItem, accordion);
      model.insertObject(accordion);
      editing.view.focus();
      writer.setSelection(accordion, "on");
    });
  }
}

/**
 * Represents a command which is executed when the insert item above or insert
 * item below button is pressed with an accordion item selected.
 */
export class InsertAccordionItemCommand extends Command {
  refresh() {
    const selection = this.editor.model.document.selection;
    this.accordionItem = getSelectedAccordionItemModelElement(selection);
    this.isEnabled = !!this.accordionItem;
  }

  execute(options) {
    const { commands, model } = this.editor;
    const accordionItem = this.accordionItem;
    const value = options ? options.value : "after";
    model.change((writer) => {
      const newAccordionItem = createAccordionItem(
        writer,
        true, // isOpen
      ).accordionItem;
      writer.insert(newAccordionItem, accordionItem, value);
    });
  }
}

/**
 * Represents a command which is executed when the delete item button is
 * pressed with an accordion item selected.
 */
export class RemoveAccordionItemCommand extends Command {
  constructor(editor) {
    super(editor);
    this.accordionItem = null;
  }

  refresh() {
    const selection = this.editor.model.document.selection;
    this.accordionItem = getSelectedAccordionItemModelElement(selection);
    // Disables the remove command if the accordion has only one item.
    this.isEnabled = this.accordionItem
      ? 1 < Array.from(this.accordionItem?.parent?.getChildren()).length
      : false;
  }

  execute() {
    const editor = this.editor;
    const { commands, model } = editor;
    const accordionItem = this.accordionItem;
    model.change((writer) => {
      if (commands.get("AccordionFirstItemOpen")?.value) {
        const accordion = accordionItem.parent;
        // The accordion item being removed is the first item, and the "open
        // first item" setting is on. Opens the item below it as it will now be
        // the first item.
        if (accordion.getChildIndex(accordionItem) === 0) {
          setAccordionItemIsOpen(accordion.getChild(1), writer, true);
        }
      }
      writer.remove(accordionItem);
    });
  }
}

/**
 * Represents a command which is executed to modify attributes of the accordion
 * from the widget toolbar.
 */
export class AccordionFirstItemOpenCommand extends Command {
  constructor(editor) {
    super(editor);
    this.accordionWidget = null;
    this.value = true;
  }

  refresh() {
    const model = this.editor.model;
    this.accordionWidget = getSelectedAccordionModelElement(
      model.document.selection,
    );
    // Disables any AccordionFirstItemOpenCommand if there is no
    // selected accordion.
    this.isEnabled = !!this.accordionWidget;
    this.value =
      this.isEnabled && isAccordionItemOpen(this.accordionWidget?.getChild(0));
  }

  execute(options = { value: false }) {
    this.editor.model.change((writer) =>
      setAccordionItemIsOpen(
        this.accordionWidget?.getChild(0),
        writer,
        options.value,
      ),
    );
  }
}

/**
 * Represents a command which is executed to open all items in an accordion.
 */
export class AccordionOpenAllCommand extends Command {
  constructor(editor) {
    super(editor);
    this.accordionWidget = null;
  }

  refresh() {
    const model = this.editor.model;
    this.accordionWidget = getSelectedAccordionModelElement(
      model.document.selection,
    );
    // Disables any AccordionOpenAllCommand if there is no selected
    // accordion or only one item can be open at once.
    this.isEnabled =
      !!this.accordionWidget &&
      this.accordionWidget.getAttribute("AccordionItemsStayOpen") === "true";
  }

  execute() {
    this.editor.model.change((writer) => {
      if (this.accordionWidget) {
        [...this.accordionWidget.getChildren()].forEach((accordionItem) =>
          setAccordionItemIsOpen(accordionItem, writer, true),
        );
      }
    });
  }
}

/**
 * Represents a command which is executed to collapse all items in an
 * accordion.
 */
export class AccordionCollapseAllCommand extends Command {
  constructor(editor) {
    super(editor);
    this.accordionWidget = null;
  }

  refresh() {
    this.accordionWidget = getSelectedAccordionModelElement(
      this.editor.model.document.selection,
    );
    // Disables any AccordionOpenAllCommand if there is no selected
    // accordion or only one item can be open at once.
    this.isEnabled = !!this.accordionWidget;
  }

  execute(options = { omitFirst: false }) {
    const accordionItemIterator = this.accordionWidget?.getChildren();
    if (options.omitFirst) {
      accordionItemIterator.next();
    }
    this.editor.model.change((writer) =>
      [...accordionItemIterator].forEach((accordionItem) =>
        setAccordionItemIsOpen(accordionItem, writer, false),
      ),
    );
  }
}

/**
 * Represents a command which is executed to modify attributes of the accordion
 * from the widget toolbar.
 */
export class ModifyAccordionCommand extends Command {
  constructor(editor, attributeName, defaultValue) {
    super(editor);
    this.attributeName = attributeName;
    this.defaultValue = defaultValue;
    this.value = defaultValue;
  }

  refresh() {
    const model = this.editor.model;
    const attributeName = this.attributeName;
    const defaultValue = this.defaultValue;
    this.accordionWidget = getSelectedAccordionModelElement(
      model.document.selection,
    );
    // Disables any ModifyAccordionCommand if there is no selected
    // accordion.
    this.isEnabled = !!this.accordionWidget;
    this.value = defaultValue;
    if (this.isEnabled && this.accordionWidget.hasAttribute(attributeName)) {
      // Sets the `value` of this ModifyAccordionCommand to the
      // attribute of the selected accordion.
      this.value = this.accordionWidget.getAttribute(attributeName);
    }
  }

  execute(options = { value: this.defaultValue }) {
    const model = this.editor.model;
    const accordionWidget = this.accordionWidget;
    // Sets the attribute of the selected accordion to a new value upon
    // execution of this command.
    model.change((writer) =>
      writer.setAttribute(this.attributeName, options.value, accordionWidget),
    );
  }
}

/**
 * Gets the parent element of the document selection.
 */
function getParentElement(selection, model) {
  const parent = findOptimalInsertionRange(selection, model).start.parent;
  if (parent.isEmpty && !parent.is("element", "$root")) return parent.parent;
  return parent;
}
