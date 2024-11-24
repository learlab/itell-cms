import { renderEquation } from '../utils';

const {View} = window.CKEDITOR

export default class MathView extends View {
  value;
  display;
  previewUid;
  previewClassName;
  katexRenderOptions;
  engine;
  lazyLoad;

	constructor(
		engine,
		lazyLoad,
		locale,
		previewUid,
		previewClassName,
		katexRenderOptions,
	) {
		super( locale );

		this.engine = engine;
		this.lazyLoad = lazyLoad;
		this.previewUid = previewUid;
		this.katexRenderOptions = katexRenderOptions;
		this.previewClassName = previewClassName;

		this.set( 'value', '' );
		this.value = '';
		this.set( 'display', false );
		this.display = false;

		this.on( 'change', () => {
			if ( this.isRendered ) {
				this.updateMath();
			}
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-math-preview' ]
			}
		} );
	}

  updateMath() {
		if ( this.element ) {
			void renderEquation(
				this.value,
				this.element,
				this.engine,
				this.lazyLoad,
				this.display,
				true,
				this.previewUid,
				this.previewClassName,
				this.katexRenderOptions
			);
		}
	}

  render() {
		super.render();
		this.updateMath();
	}
}
