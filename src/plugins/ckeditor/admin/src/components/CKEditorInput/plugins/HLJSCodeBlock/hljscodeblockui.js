import { getNormalizedAndLocalizedLanguageDefinitions } from "./utils";

import codeBlockIcon from "./codeblock.svg";
import "./codeblock.css";
import "highlight.js/styles/atom-one-dark.css";

const {Plugin} = window.CKEDITOR;
const {Collection} = window.CKEDITOR;
const {Model} = window.CKEDITOR;
const {SplitButtonView} = window.CKEDITOR;
const {dropdownUtils} = window.CKEDITOR;

export default class HLJSCodeBlockUI extends Plugin {
  init() {
    const editor = this.editor;
    const t = editor.t;
    const componentFactory = editor.ui.componentFactory;
    const normalizedLanguageDefs =
      getNormalizedAndLocalizedLanguageDefinitions(editor);
    const defaultLanguageDefinition = normalizedLanguageDefs[0];

    componentFactory.add("codeBlock", (locale) => {
      const command = editor.commands.get("hljsCodeBlock");
      const dropdownView = dropdownUtils.createDropdown(
        locale,
        SplitButtonView,
      );
      const splitButtonView = dropdownView.buttonView;

      splitButtonView.set({
        label: t("Insert code block"),
        tooltip: true,
        icon: codeBlockIcon,
        isToggleable: true,
      });

      splitButtonView.bind("isOn").to(command, "value", (value) => !!value);

      splitButtonView.on("execute", () => {
        editor.execute("hljsCodeBlock", {
          language: defaultLanguageDefinition.language,
        });

        editor.editing.view.focus();
      });

      dropdownView.on("execute", (evt) => {
        editor.execute("hljsCodeBlock", {
          language: evt.source._codeBlockLanguage,
          forceValue: true,
        });

        editor.editing.view.focus();
      });

      dropdownView.class = "ck-code-block-dropdown";
      dropdownView.bind("isEnabled").to(command);

      dropdownUtils.addListToDropdown(
        dropdownView,
        this._getLanguageListItemDefinitions(normalizedLanguageDefs),
      );

      return dropdownView;
    });
  }

  _getLanguageListItemDefinitions(normalizedLanguageDefs) {
    const editor = this.editor;
    const command = editor.commands.get("hljsCodeBlock");
    const itemDefinitions = new Collection();

    for (const languageDef of normalizedLanguageDefs) {
      const definition = {
        type: "button",
        model: new Model({
          _codeBlockLanguage: languageDef.language,
          label: languageDef.label,
          withText: true,
        }),
      };

      definition.model.bind("isOn").to(command, "value", (value) => {
        return value === definition.model._codeBlockLanguage;
      });

      itemDefinitions.add(definition);
    }

    return itemDefinitions;
  }
}
