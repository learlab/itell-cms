import WarningEditing from "./WarningEditing.js";
import WarningUI from "./WarningUI.js";

const { Plugin } = window.CKEDITOR;
export class Warning extends Plugin {
  static get requires() {
    return [WarningEditing, WarningUI];
  }

  static get pluginName() {
    return "Warning";
  }
}
