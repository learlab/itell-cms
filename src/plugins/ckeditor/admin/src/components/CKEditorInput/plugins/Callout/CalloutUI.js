import "./Callout.css";

const { Plugin } = window.CKEDITOR;
const { ButtonView } = window.CKEDITOR;

export default class CalloutUI extends Plugin {
  init() {
    const editor = this.editor;
    const t = editor.t;

    // to be displayed in the toolbar.
    editor.ui.componentFactory.add("Callout", (locale) => {
      // The state of the button will be bound to the widget command.
      const command = editor.commands.get("insertCallout");

      // The button will be an instance of ButtonView.
      const buttonView = new ButtonView(locale);

      buttonView.set({
        // The t() function helps localize the editor. All strings enclosed in t() can be
        // translated and change when the language of the editor changes.
        label: t("Callout"),
        withText: true,
        tooltip: true,
      });

      // Bind the state of the button to the command.
      buttonView.bind("isOn", "isEnabled").to(command, "value", "isEnabled");

      // Execute the command when the button is clicked (executed).
      this.listenTo(buttonView, "execute", () =>
        editor.execute("insertCallout"),
      );

      return buttonView;
    });
  }
}
