import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';

import Adapter from './adapter';

export default class SimpleUpload extends Plugin {
	static get requires() {
		return [ FileRepository ];
	}

	static get pluginName() {
		return 'MapHubsUpload';
	}

	init() {
		const maphubsUploadConfig = this.editor.config.get( 'maphubsUpload' );
		this.editor.plugins.get( 'FileRepository' )
			.createUploadAdapter = loader => new Adapter( loader, maphubsUploadConfig, this.editor.t );
	}
}
