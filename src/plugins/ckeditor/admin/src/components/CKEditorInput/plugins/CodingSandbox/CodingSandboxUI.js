import "./CodingSandbox.css";
import { CodingSandboxIcon } from "./CodingSandboxIcon";

const {Plugin} = window.CKEDITOR;
const {createDropdown} = window.CKEDITOR;
const {addListToDropdown} = window.CKEDITOR;
const {Collection} = window.CKEDITOR;

export default class CodingSandboxUI extends Plugin {
  init() {
    const editor = this.editor;
    const t = editor.t;
    const items = new Collection();
    items.add({
      type: "button",
      model: {
        withText: true,
        label: t("Python"),
        class: undefined,
      },
    });

    items.add({
      type: "button",
      model: {
        withText: true,
        label: t("JavaScript"),
        class: undefined,
      },
    });

    // to be displayed in the toolbar.
    editor.ui.componentFactory.add("CodingSandbox", (locale) => {
      const dropdownView = createDropdown(locale);
      const command = editor.commands.get("insertCodingSandbox");

      dropdownView.buttonView.set({
        label: t("Coding Sandbox"),
        icon: CodingSandboxIcon,
        tooltip: true,
        withText: false,
      });

      dropdownView.on("execute", (evt) => {
        editor.execute("insertCodingSandbox", evt.source.label);
      });

      dropdownView.class = "ck-code-block-dropdown";
      dropdownView.bind("isEnabled").to(command);

      addListToDropdown(dropdownView, items);

      return dropdownView;
    });
  }
}
