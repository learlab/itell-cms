import InfoEditing from "./InfoEditing.js";
import InfoUI from "./InfoUI.js";

const { Plugin } = window.CKEDITOR;

export class Info extends Plugin {
  static get requires() {
    return [InfoEditing, InfoUI];
  }

  static get pluginName() {
    return "Info";
  }
}
