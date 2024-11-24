import CodingSandboxEditing from "./CodingSandboxEditing.js";
import CodingSandboxUI from "./CodingSandboxUI.js";

const {Plugin} = window.CKEDITOR;
export class CodingSandbox extends Plugin {
  static get requires() {
    return [CodingSandboxEditing, CodingSandboxUI];
  }

  static get pluginName() {
    return "CodingSandbox";
  }
}
