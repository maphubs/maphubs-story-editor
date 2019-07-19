/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';

import MapHubsMap from './MapHubsMap';

export default class ClassicEditor extends ClassicEditorBase {}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	Essentials,
	UploadAdapter,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	CKFinder,
	EasyImage,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	Table,
	TableToolbar,
	MapHubsMap
];

// Editor configuration.
ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'imageUpload',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo',
			'|',
			'mapHubsMap'
		]
	},
	image: {
		toolbar: [
			'imageStyle:full',
			'imageStyle:side',
			'|',
			'imageTextAlternative'
		]
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en',
	mediaEmbed: {
		extraProviders: [
			{
				name: 'maphubs',
				url: /^mapforenvironment\.org|^.*\.maphubs\.com\/map\/view|share\/(\w+)/,
				html: match => {
					const url = match.input;
					const parts = url.split( '/' );
					let domain;
					let type;
					let id;
					if ( url.startsWith( 'http' ) ) {
						domain = parts[ 2 ];
						type = parts[ 4 ];
						id = parts[ 5 ];
					} else {
						domain = parts[ 0 ];
						type = parts[ 2 ];
						id = parts[ 3 ];
					}

					let embedLinkType = 'embed';
					if ( type === 'share' ) {
						embedLinkType = 'public-embed';
					}
					return (
						'<div style="position: relative; padding-bottom: 53%; height: 0;">' +
							`<iframe src="https://${ domain }/map/${ embedLinkType }/${ id }/static" ` +
								'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
								// eslint-disable-next-line
								'frameborder="0" allowtransparency="true" allow="encrypted-media" allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true">' +
							'</iframe>' +
						'</div>'
					);
				}
			}
		]
	},
	maphubsMap: {
		getMap: cb => {
			// override this in the app to connect a UI
			// eslint-disable-next-line
			const mapURL = prompt( 'Enter Map URL' );
			cb( mapURL );
		}
	}

};
