import AccordionEvents from "./AccordionEvents";
import { getSelectedAccordionWidget } from "./AccordionUtils";
import "./Accordion.css";
import {
  AccordionIcon,
  AccordionItemIcon,
  AccordionOpenCollapseIcon,
} from "./AccordionIcons";

const {Plugin} = window.CKEDITOR;

const {ButtonView} = window.CKEDITOR;
const {Model} = window.CKEDITOR;
const {addListToDropdown} = window.CKEDITOR;
const {createDropdown} = window.CKEDITOR;
const {Collection} = window.CKEDITOR;
const {WidgetToolbarRepository} = window.CKEDITOR;

/**
 * Defines the user interface for editing Accordion widgets.
 */
export default class AccordionUI extends Plugin {
  /**
   * The plugin's name in the PluginCollection.
   */
  static get pluginName() {
    return "AccordionUI";
  }

  /**
   * The plugin's dependencies.
   */
  static get requires() {
    return [AccordionEvents, WidgetToolbarRepository];
  }

  init() {
    this.commands = this.editor.commands;
    const { plugins, ui } = this.editor;
    this.events = plugins.get("AccordionEvents");
    const componentFactory = ui.componentFactory;
    const command = this.commands.get("insertAccordion");

    // Creates button components that can be added to the main editor toolbar
    // through the config, or to the contextual balloon toolbar.
    componentFactory.add("Accordion", (locale) => {
      const buttonView = new ButtonView(locale);
      buttonView.set({
        label: locale.t("Accordion"),
        icon: AccordionIcon,
        tooltip: true,
        withText: false,
      });
      // Disables the button if the command is disabled.
      buttonView.bind("isEnabled").to(command);
      // Executes the command with the button's value on click.
      buttonView.on("execute", () => {
        command.execute({ command });
        this.editor.editing.view.focus();
      });

      return buttonView;
    });

    componentFactory.add("AccordionItem", (locale) =>
      this._buildAccordionItemToolbarDropdown(locale, this.events),
    );

    componentFactory.add("AccordionOpenCollapse", (locale) =>
      this._buildAccordionOpenCollapseToolbarDropdown(locale, this.events),
    );
  }

  afterInit() {
    const plugins = this.editor.plugins;
    const widgetToolbarRepository = plugins.get(WidgetToolbarRepository);

    // Creates contextual balloon for the accordion widget.
    // Could populate items using editor.config.
    widgetToolbarRepository.register("Accordion", {
      items: ["AccordionItem", "AccordionOpenCollapse"],
      getRelatedElement: getSelectedAccordionWidget,
    });
  }

  /**
   * Builds the dropdown with options for the selected accordion item.
   */
  _buildAccordionItemToolbarDropdown(locale, events) {
    const dropdownView = createDropdown(locale);
    const buttonView = dropdownView.buttonView;
    const list = new Collection();

    list.add({
      type: "button",
      model: createModel(
        this.commands.get("insertAccordionItem"),
        null,
        "insertAbove",
        locale.t("Insert item above"),
      ),
    });
    list.add({
      type: "button",
      model: createModel(
        this.commands.get("insertAccordionItem"),
        null,
        "insertBelow",
        locale.t("Insert item below"),
      ),
    });
    list.add({
      type: "button",
      model: createModel(
        this.commands.get("removeAccordionItem"),
        null,
        "remove",
        locale.t("Delete item"),
      ),
    });

    addListToDropdown(dropdownView, list);

    dropdownView.on("execute", (eventInfo) =>
      events.fire("accordionItem", eventInfo.source.name),
    );

    buttonView.set({
      label: locale.t("Accordion item"),
      icon: AccordionItemIcon,
      tooltip: true,
      class: "ck-dropdown__button_label-width_auto",
      withText: false,
    });

    return dropdownView;
  }

  /**
   * Builds the dropdown with open/collapse options for the selected accordion.
   */
  _buildAccordionOpenCollapseToolbarDropdown(locale, events) {
    const dropdownView = createDropdown(locale);
    const buttonView = dropdownView.buttonView;
    const list = new Collection();

    list.add({
      type: "switchbutton",
      model: createModel(
        this.commands.get("AccordionFirstItemOpen"),
        true,
        "toggleFirstItemOpen",
        locale.t("Open first item"),
      ),
    });
    list.add({
      type: "switchbutton",
      model: createModel(
        this.commands.get("AccordionItemsStayOpen"),
        "true",
        "toggleItemsStayOpen",
        locale.t("Allow opening multiple items"),
      ),
    });
    list.add({ type: "separator" });
    list.add({
      type: "button",
      model: createModel(
        this.commands.get("AccordionOpenAll"),
        "true",
        "openAll",
        locale.t("Open all items"),
      ),
    });
    list.add({
      type: "button",
      model: createModel(
        this.commands.get("AccordionCollapseAll"),
        "true",
        "collapseAll",
        locale.t("Collapse all items"),
      ),
    });

    addListToDropdown(dropdownView, list);

    dropdownView.on("execute", (eventInfo) =>
      events.fire("accordion", eventInfo.source.name),
    );

    buttonView.set({
      label: locale.t("Accordion open / collapse"),
      icon: AccordionOpenCollapseIcon,
      tooltip: locale.t("Accordion open / collapse"),
      class: "ck-dropdown__button_label-width_auto",
      withText: false,
    });

    return dropdownView;
  }
}

/**
 * Creates a model for dropdown items.
 */
function createModel(command, value, name, label, icon, className, withText) {
  const model = new Model({
    name,
    label: typeof withText === "string" ? withText : label,
    icon,
    tooltip: icon ? label : false,
    withText: withText || !icon,
    class: className,
  });

  model.bind("isEnabled").to(command);
  if (value !== null) {
    model
      .bind("isOn")
      .to(command, "value", (commandValue) => commandValue === value);
  }

  return model;
}
