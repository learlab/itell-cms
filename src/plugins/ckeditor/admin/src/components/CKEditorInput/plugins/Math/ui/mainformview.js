import { extractDelimiters, hasDelimiters } from '../utils';
import MathView from './mathview';
import './mathform.css';


const {icons} = window.CKEDITOR;
const {ButtonView} = window.CKEDITOR;
const {createLabeledInputText} = window.CKEDITOR;
const {FocusCycler} = window.CKEDITOR;
const {LabelView} = window.CKEDITOR;
const {LabeledFieldView} = window.CKEDITOR;
const {submitHandler} = window.CKEDITOR;
const {SwitchButtonView} = window.CKEDITOR;
const {View} = window.CKEDITOR;
const {ViewCollection} = window.CKEDITOR;
const {KeystrokeHandler} = window.CKEDITOR;
const {FocusTracker} = window.CKEDITOR;
const {Locale} = window.CKEDITOR;

const { check: checkIcon, cancel: cancelIcon } = icons;



class MathInputView extends LabeledFieldView {
  value;
  isReadOnly = false;

	constructor( locale ) {
		super( locale, createLabeledInputText );
	}
}

export default class MainFormView extends View {
  lazyLoad;

	constructor(
		locale,
		engine,
		lazyLoad,
		previewEnabled = false,
		previewUid,
		previewClassName,
		popupClassName,
		katexRenderOptions,
	) {
		super( locale );

		const t = locale.t;

		// Submit button
		this.saveButtonView = this._createButton( t( 'Save' ), checkIcon, 'ck-button-save', null );
		this.saveButtonView.type = 'submit';

		// Equation input
		this.mathInputView = this._createMathInput();

		// Display button
		this.displayButtonView = this._createDisplayButton();

		// Cancel button
		this.cancelButtonView = this._createButton( t( 'Cancel' ), cancelIcon, 'ck-button-cancel', 'cancel' );

		this.previewEnabled = previewEnabled;

		let children = [];
		if ( this.previewEnabled ) {
			// Preview label
			this.previewLabel = new LabelView( locale );
			this.previewLabel.text = t( 'Equation preview' );

			// Math element
			this.mathView = new MathView( engine, lazyLoad, locale, previewUid, previewClassName, katexRenderOptions );
			this.mathView.bind( 'display' ).to( this.displayButtonView, 'isOn' );

			children = [
				this.mathInputView,
				this.displayButtonView,
				this.previewLabel,
				this.mathView
			];
		} else {
			children = [
				this.mathInputView,
				this.displayButtonView
			];
		}

		// Add UI elements to template
		this.setTemplate( {
			tag: 'form',
			attributes: {
				class: [
					'ck',
					'ck-math-form',
					...popupClassName
				],
				tabindex: '-1',
				spellcheck: 'false'
			},
			children: [
				{
					tag: 'div',
					attributes: {
						class: [
							'ck-math-view'
						]
					},
					children
				},
				this.saveButtonView,
				this.cancelButtonView
			]
		} );
	}

  render() {
		super.render();

		// Prevent default form submit event & trigger custom 'submit'
		submitHandler( {
			view: this
		} );

		// Register form elements to focusable elements
		const childViews = [
			this.mathInputView,
			this.displayButtonView,
			this.saveButtonView,
			this.cancelButtonView
		];

		childViews.forEach( v => {
			if ( v.element ) {
				this._focusables.add( v );
				this.focusTracker.add( v.element );
			}
		} );

		// Listen to keypresses inside form element
		if ( this.element ) {
			this.keystrokes.listenTo( this.element );
		}
	}

  focus() {
		this._focusCycler.focusFirst();
	}

  get equation() {
		return this.mathInputView.fieldView.element?.value ?? '';
	}

  set equation( equation ) {
		if ( this.mathInputView.fieldView.element ) {
			this.mathInputView.fieldView.element.value = equation;
		}
		if ( this.previewEnabled && this.mathView ) {
			this.mathView.value = equation;
		}
	}

  focusTracker = new FocusTracker();
  keystrokes = new KeystrokeHandler();
  _focusables = new ViewCollection();
  _focusCycler = new FocusCycler( {
		focusables: this._focusables,
		focusTracker: this.focusTracker,
		keystrokeHandler: this.keystrokes,
		actions: {
			focusPrevious: 'shift + tab',
			focusNext: 'tab'
		}
	} );

  _createMathInput() {
		const t = this.locale.t;

		// Create equation input
		const mathInput = new MathInputView( this.locale );
		const fieldView = mathInput.fieldView;
		mathInput.infoText = t( 'Insert equation in TeX format.' );

		const onInput = () => {
			if ( fieldView.element != null ) {
				let equationInput = fieldView.element.value.trim();

				// If input has delimiters
				if ( hasDelimiters( equationInput ) ) {
					// Get equation without delimiters
					const params = extractDelimiters( equationInput );

					// Remove delimiters from input field
					fieldView.element.value = params.equation;

					equationInput = params.equation;

					// update display button and preview
					this.displayButtonView.isOn = params.display;
				}
				if ( this.previewEnabled && this.mathView ) {
					// Update preview view
					this.mathView.value = equationInput;
				}

				this.saveButtonView.isEnabled = !!equationInput;
			}
		};

		fieldView.on( 'render', onInput );
		fieldView.on( 'input', onInput );

		return mathInput;
	}

  _createButton(
		label,
		icon,
		className,
		eventName
	) {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			icon,
			tooltip: true
		} );

		button.extendTemplate( {
			attributes: {
				class: className
			}
		} );

		if ( eventName ) {
			button.delegate( 'execute' ).to( this, eventName );
		}

		return button;
	}

  _createDisplayButton() {
		const t = this.locale.t;

		const switchButton = new SwitchButtonView( this.locale );

		switchButton.set( {
			label: t( 'Display mode' ),
			withText: true
		} );

		switchButton.extendTemplate( {
			attributes: {
				class: 'ck-button-display-toggle'
			}
		} );

		switchButton.on( 'execute', () => {
			// Toggle state
			switchButton.isOn = !switchButton.isOn;

			if ( this.previewEnabled && this.mathView ) {
				// Update preview view
				this.mathView.display = switchButton.isOn;
			}
		} );

		return switchButton;
	}
}
