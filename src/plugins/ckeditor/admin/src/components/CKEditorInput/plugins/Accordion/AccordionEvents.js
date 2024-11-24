import AccordionEditing from "./AccordionEditing";

const {Plugin} = window.CKEDITOR;

/**
 * Listens for events that affect a selected Accordion widget.
 */
export default class AccordionEvents extends Plugin {
  /**
   * The plugin's name in the PluginCollection.
   */
  static get pluginName() {
    return "AccordionEvents";
  }

  /**
   * The plugin's dependencies.
   */
  static get requires() {
    return [AccordionEditing];
  }

  /**
   * @inheritdoc
   */
  init() {
    const commands = this.editor.commands;
    const AccordionFirstItemOpen = commands.get("AccordionFirstItemOpen");
    const AccordionItemsStayOpen = commands.get("AccordionItemsStayOpen");
    const AccordionOpenAll = commands.get("AccordionOpenAll");
    const AccordionCollapseAll = commands.get("AccordionCollapseAll");
    const insertAccordionItem = commands.get("insertAccordionItem");
    const removeAccordionItem = commands.get("removeAccordionItem");

    this.on("accordion", (_eventInfo, type) => {
      if (type === "toggleFirstItemOpen") {
        AccordionFirstItemOpen.execute({
          value: !AccordionFirstItemOpen.value,
        });
      } else if (type === "toggleItemsStayOpen") {
        const oldValue = AccordionItemsStayOpen.value;
        AccordionItemsStayOpen.execute({
          value: oldValue === "false" ? "true" : "false",
        });
        if (oldValue === "true") {
          AccordionCollapseAll.execute({ omitFirst: true });
        }
      } else if (type === "openAll") {
        AccordionOpenAll.execute();
      } else if (type === "collapseAll") {
        AccordionCollapseAll.execute();
      }
    });

    this.on("accordionItem", (_eventInfo, type) => {
      if (type === "insertAbove") {
        insertAccordionItem.execute({ value: "before" });
      } else if (type === "insertBelow") {
        insertAccordionItem.execute({ value: "after" });
      } else if (type === "remove") {
        removeAccordionItem.execute();
      }
    });
  }
}
