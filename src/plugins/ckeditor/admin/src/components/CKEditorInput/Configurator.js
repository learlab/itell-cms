import { StrapiMediaLib } from "./plugins/StrapiMediaLib";
import MaximumLength from "../../vendor/ckeditor5-maximum-length/index";
import "../../vendor/ckeditor5-maximum-length/index-editor.css";
import {Info} from "./plugins/Info/Info";
import {Callout} from "./plugins/Callout/Callout";
import {Warning} from "./plugins/Warning/Warning";
import {Accordion} from "./plugins/Accordion/Accordion";
import {CodingSandbox} from "./plugins/CodingSandbox/CodingSandbox";
import {StaticCode} from "./plugins/StaticCode/StaticCode";
import { HLJSCodeBlock } from "./plugins/HLJSCodeBlock/hljscodeblock";

const {
  Alignment,
  Autoformat,
  Bold,
  Italic,
  // Underline,
  Strikethrough,
  Code,
  Subscript,
  Superscript,
  BlockQuote,
  CodeBlock,
  Essentials,
  FontSize,
  FontFamily,
  FontColor,
  FontBackgroundColor,
  FindAndReplace,
  Heading,
  HorizontalLine,
  HtmlEmbed,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  ImageResize,
  Indent,
  IndentBlock,
  Link,
  LinkImage,
  List,
  ListProperties,
  TodoList,
  Markdown,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SpecialCharacters,
  SpecialCharactersEssentials,
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  TableColumnResize,
  TableCaption,
  WordCount,
  Highlight,
  SourceEditing,
} = window.CKEDITOR;

const CKEDITOR_BASE_CONFIG_FOR_PRESETS = {
  standard: {
    plugins: [
      Autoformat,
      Bold,
      Italic,
      BlockQuote,
      CodeBlock,
      Essentials,
      Heading,
      Image,
      ImageCaption,
      ImageStyle,
      ImageToolbar,
      ImageUpload,
      Indent,
      Link,
      LinkImage,
      List,
      MediaEmbed,
      Paragraph,
      PasteFromOffice,
      Table,
      TableToolbar,
      TableColumnResize,
      TableCaption,
      WordCount,
      StrapiMediaLib,
      SourceEditing,
      HtmlEmbed,
      // Underline,
      Strikethrough,
      SpecialCharacters,
      Info,
      Callout,
      Warning,
      Accordion,
      CodingSandbox,
      StaticCode,
      HLJSCodeBlock
    ],

    toolbar: {
      items: [
        'undo', 'redo',
        '|',
        'heading',
        '|',
        'bold', 'italic', 'strikethrough',
        '|',
        'link', 'strapiMediaLib', 'mediaEmbed', 'blockQuote', 'insertTable',
        '|',
        'bulletedList', 'numberedList', 'outdent', 'indent',
        '-',
        'Info', 'Callout', 'Warning', 'Accordion', 'CodingSandbox', 'StaticCode',
        '|',
        'sourceEditing', 'htmlEmbed'
      ],
      shouldNotGroupWhenFull: true
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
        { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
      ]
    },
    image: {
      toolbar: [
        'imageStyle:inline',
        'imageStyle:block',
        'imageStyle:side',
        '|',
        'toggleImageCaption',
        'imageTextAlternative',
        '|',
        'linkImage'
      ]
    },
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        '|',
        'toggleTableCaption'
      ]
    },
    link: {
      decorators: {
        openInNewTab: {
          mode: 'manual',
          label: 'Open in a new tab',
          attributes: {
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        }
      }
    },
  },
};

export default class Configurator {
  constructor ( fieldConfig ) {
    this.fieldConfig = fieldConfig;
  }

  getEditorConfig() {
    const config = this._getBaseConfig();

    const maxLength = this.fieldConfig.maxLength;
    const outputOption = this.fieldConfig.options.output;

    if ( outputOption === 'Markdown' ) {
      config.plugins.push( Markdown );
    }

    if ( maxLength ) {
      config.plugins.push( MaximumLength );

      config.maximumLength = {
        characters: maxLength
      };
    }

    return config;
  }

  _getBaseConfig() {
    const presetName = this.fieldConfig.options.preset;

    switch ( presetName ) {
      case 'light':
        return CKEDITOR_BASE_CONFIG_FOR_PRESETS.light;
      case 'standard':
        return CKEDITOR_BASE_CONFIG_FOR_PRESETS.standard;
      case 'rich':
        return CKEDITOR_BASE_CONFIG_FOR_PRESETS.rich;
      default:
        throw new Error('Invalid preset name ' + presetName);
    }
  }
}
