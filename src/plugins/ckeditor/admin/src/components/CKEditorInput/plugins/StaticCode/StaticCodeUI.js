import "./StaticCode.css";
import { StaticCodeIcon } from "./StaticCodeIcon";
const {Plugin} = window.CKEDITOR;
const {createDropdown} = window.CKEDITOR;
const {addListToDropdown} = window.CKEDITOR;
const {Collection} = window.CKEDITOR;

export default class StaticCodeUI extends Plugin {
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
    editor.ui.componentFactory.add("StaticCode", (locale) => {
      const dropdownView = createDropdown(locale);
      const command = editor.commands.get("insertStaticCode");

      dropdownView.set({
        label: "Static Code",
        tooltip: true,
        withText: true,
      });

      dropdownView.buttonView.set({
        label: t("CodeBlock"),
        tooltip: true,
        icon: StaticCodeIcon,
        isToggleable: true,
        withText: false,
      });

      dropdownView.on("execute", (evt) => {
        editor.execute("insertStaticCode", evt.source.label);
      });

      dropdownView.class = "ck-code-block-dropdown";
      dropdownView.bind("isEnabled").to(command);

      addListToDropdown(dropdownView, items);

      return dropdownView;
    });
  }
}
