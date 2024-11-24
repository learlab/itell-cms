import CalloutEditing from "./CalloutEditing.js";
import CalloutUI from "./CalloutUI.js";

const { Plugin } = window.CKEDITOR;
export class Callout extends Plugin {
  static get requires() {
    return [CalloutEditing, CalloutUI];
  }

  static get pluginName() {
    return "Callout";
  }
}
