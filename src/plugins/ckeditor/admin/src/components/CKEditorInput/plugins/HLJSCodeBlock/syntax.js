import SyntaxEditing from "./syntaxEditing.js";

const {Plugin} = window.CKEDITOR;

export default class Syntax extends Plugin {
  static get requires() {
    return [SyntaxEditing];
  }

  init() {}
}
