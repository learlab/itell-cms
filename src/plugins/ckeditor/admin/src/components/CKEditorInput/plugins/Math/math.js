import MathUI from './mathui';
import MathEditing from './mathediting';
import AutoMath from './automath';

const {Plugin} = window.CKEDITOR;
const {Widget} = window.CKEDITOR;
export class Math extends Plugin {
  static get requires() {
		return [ MathEditing, MathUI, AutoMath, Widget ];
	}

	static get pluginName() {
		return 'Math';
	}
}
