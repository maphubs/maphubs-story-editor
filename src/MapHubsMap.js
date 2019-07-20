import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Command from '@ckeditor/ckeditor5-core/src/command';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import mapIcon from './map.svg';

export default class MapHubsMap extends Plugin {
	static get requires() {
		return [ MapHubsMapEditing, MapHubsMapUI ];
	}
}

class MapHubsMapUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'maphubsMap', locale => {
			// The state of the button will be bound to the widget command.
			const command = editor.commands.get( 'insertMapHubsMap' );

			// The button will be an instance of ButtonView.
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				// The t() function helps localize the editor. All strings enclosed in t() can be
				// translated and change when the language of the editor changes.
				label: t( 'Insert Map' ),
				icon: mapIcon,
				tooltip: true
			} );

			// Bind the state of the button to the command.
			buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute the command when the button is clicked (executed).
			this.listenTo( buttonView, 'execute', () => editor.execute( 'insertMapHubsMap' ) );

			return buttonView;
		} );
	}
}

class MapHubsMapEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		this._defineSchema();
		this._defineConverters();
		this.editor.commands.add( 'insertMapHubsMap', new InsertMapHubsMapCommand( this.editor ) );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'maphubsMap', {
			// Behaves like a self-contained object (e.g. an image).
			isObject: true,
			isBlock: true,
			// Allow in places where other blocks are allowed (e.g. directly in the root).
			allowWhere: '$block',
			allowAttributes: [ 'url' ]
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		// <maphubsMap> converters
		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'figure',
				classes: 'maphubs-map',
				attributes: {
					url: true
				}
			},
			model: ( viewElement, modelWriter ) => {
				return modelWriter.createElement( 'figure', { url: viewElement.getAttribute( 'url' ) } );
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'maphubsMap',
			view: {
				name: 'figure',
				classes: 'maphubs-map',
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'maphubsMap',
			view: ( modelElement, viewWriter ) => {
				const url = modelElement.getAttribute( 'url' );
				const figure = viewWriter.createContainerElement( 'figure', { class: 'media' } );
				const attributes = {
					class: 'ck-media__wrapper'
				};
				attributes[ 'data-oembed-url' ] = url;
				const map = viewWriter.createUIElement( 'div', attributes, function( domDocument ) {
					const domElement = this.toDomElement( domDocument );
					if ( !url ) {
						// console.error('Missing required map URL');
						domElement.innerHTML = '<p>Error</p>';
					} else {
						// https://mapforenvironment.org/map/view/36/#3.7/19.98/96.74
						// https://demo.maphubs.com/map/share/TA5R70AlT
						const parts = url.split( '/' );
						const domain = parts[ 2 ];
						const type = parts[ 4 ];
						const id = parts[ 5 ];
						let embedLinkType = 'embed';
						if ( type === 'share' ) {
							embedLinkType = 'public-embed';
						}
						// console.log( parts );
						// eslint-disable-next-line
						domElement.innerHTML = '<div class="maphubs-map-embed" style="position: relative; padding-bottom: 53%; height: 0;">' +
									`<iframe src="https://${ domain }/map/${ embedLinkType }/${ id }/static" ` +
										'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
										// eslint-disable-next-line
										'frameborder="0" allowtransparency="true" allow="encrypted-media" allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true">' +
									'</iframe>' +
								'</div>';
					}
					return domElement;
				} );

				viewWriter.insert( viewWriter.createPositionAt( figure, 0 ), map );

				return toWidget( figure, viewWriter, { label: 'maphubs map widget' } );
			}
		} );
	}
}

class InsertMapHubsMapCommand extends Command {
	execute() {
		const config = this.editor.config.get( 'maphubsMap' );
		if ( config && config.getMap ) {
			config.getMap( mapURL => {
				this.editor.model.change( writer => {
					const maphubsMap = writer.createElement( 'maphubsMap' );
					writer.setAttribute( 'url', mapURL, maphubsMap );
					this.editor.model.insertContent( maphubsMap );
					writer.setSelection( maphubsMap, 'on' );
				} );
			} );
		} else {
			// eslint-disable-next-line
			console.error( 'Missing required maphubsMap config' );
		}
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'maphubsMap' );
		// this.isEnabled = true
		this.isEnabled = allowedIn !== null;
	}
}
