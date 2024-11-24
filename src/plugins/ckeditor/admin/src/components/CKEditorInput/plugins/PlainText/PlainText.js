const {Plugin} = window.CKEDITOR;

export class PlainText extends Plugin {
  static get pluginName() {
    return "PlainText";
  }

  init() {
    // Prevent text formatting on specific elements
    // We disallow formatting on $text nodes that are direct descendants of these elements.
    const no_format_elements = [
      "InfoTitle",
      "AccordionItemButton",
      "StaticCodeAttributes",
    ];

    const schema = this.editor.model.schema;

    // This has a performance impact, so we use one attribute check for all elements.
    schema.addAttributeCheck((context, attributeName) => {
      const parent = context.getItem(context.length - 2);
      const isFormatting =
        schema.getAttributeProperties(attributeName).isFormatting;
      if (isFormatting && parent && no_format_elements.includes(parent.name)) {
        return false;
      }
    });
  }
}
