import StaticCodeEditing from "./StaticCodeEditing.js";
import StaticCodeUI from "./StaticCodeUI.js";

const {Plugin} = window.CKEDITOR;
export class StaticCode extends Plugin {
  static get requires() {
    return [StaticCodeEditing, StaticCodeUI];
  }

  static get pluginName() {
    return "StaticCode";
  }
}
