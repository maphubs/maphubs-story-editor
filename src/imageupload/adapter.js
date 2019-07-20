import request from 'superagent';

export default class Adapter {
	constructor( loader, config, t ) {
		this.loader = loader;
		this.config = config || {};
		this.t = t;
	}

	async upload() {
		// eslint-disable-next-line
		const reader = this.reader = new window.FileReader();
		const config = this.config;
		// console.log( config );
		return new Promise( async ( resolve, reject ) => {
			// get base64 in similar method to base64uploadadpator
			// eslint-disable-next-line
			// https://github.com/ckeditor/ckeditor5-upload/blob/441c5979add1460806f38f2061341b8bd9437863/src/adapters/base64uploadadapter.js#L79
			// eslint-disable-next-line

			reader.addEventListener( 'load', async () => {
				let data = reader.result;
				// wait for the user to crop the image
				if ( config.cropImage ) {
					data = await config.cropImage( data );
				} else {
					// eslint-disable-next-line
					console.warn( 'not cropping image' );
				}
				const apiUrl = config.assetUploadAPI;
				const token = config.assetUploadAPIKey;
				// eslint-disable-next-line
				console.log( 'uploading image to ' + apiUrl );
				request.post( apiUrl )
					.set( 'authorization', token ? `Bearer ${ token }` : null )
					.type( 'json' ).accept( 'json' )
					.send( {
						image: data,
						subfolder: config.subfolder,
						subfolderID: config.subfolderID
					} )
					.end( ( err, res ) => {
						if ( err ) {
							// eslint-disable-next-line
							console.error(err)
							reject( err );
						} else {
							const result = res.body;
							if ( config.onUpload ) {
								config.onUpload( result );
							}
							resolve( {
								default: result.webpcheckURL // API that redirect to best image option
							} );
						}
					} );
			} );

			reader.addEventListener( 'error', err => {
				// eslint-disable-next-line
				console.error(err)
				reject( err );
			} );

			reader.addEventListener( 'abort', () => {
				// eslint-disable-next-line
				console.error('image reading aborted')
				reject();
			} );

			this.loader.file.then( file => {
				reader.readAsDataURL( file );
			} );
		} );
	}
}
