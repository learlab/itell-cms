import HLJSCodeBlockEditing from "./hljscodeblockediting";
import HLJSCodeBlockUI from "./hljscodeblockui";
import Syntax from "./syntax";

const {Plugin} = window.CKEDITOR;

export class HLJSCodeBlock extends Plugin {
  static get requires() {
    return [Syntax, HLJSCodeBlockEditing, HLJSCodeBlockUI];
  }

  static get pluginName() {
    return "HLJSCodeBlock";
  }
}
