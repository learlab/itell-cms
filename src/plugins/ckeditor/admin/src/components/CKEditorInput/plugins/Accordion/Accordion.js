import AccordionEditing from "./AccordionEditing.js";
import AccordionUI from "./AccordionUI.js";

const { Plugin } = window.CKEDITOR;

export class Accordion extends Plugin {
  static get requires() {
    return [AccordionEditing, AccordionUI];
  }

  static get pluginName() {
    return "Accordion";
  }
}
