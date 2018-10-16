const sharp = require( 'sharp' )

module.exports = ( imagePath, transformations ) => {
	return new Promise( ( resolve, reject ) => {
		let image = sharp( imagePath )

		if ( 'w' in transformations || 'h' in transformations ) {
			let width  = undefined
			let height = undefined

			if ( 'w' in transformations ) {
				width = parseInt( transformations.w )
				delete transformations.w
			}

			if ( 'h' in transformations ) {
				height = parseInt( transformations.h )
				delete transformations.h
			}

			image.resize( width, height )
		}

		for ( transform in transformations ) {
			image = transformImage( image, transform, transformations[ transform ] )
		}

		image.jpeg( {
			progressive: true
		} )

		image.toBuffer( ( err, data, info ) => {
			if ( err ) {
				reject()
			} else {
				resolve( { err, data, info } )
			}
		} )
	} )
}

transformImage = ( image, key, value ) => {
	switch ( key ) {

		case 'c':
			switch ( value ) {
				case 'fit':
					image.max()
					break
				case 'pad':
					image.embed()
					break
			}
			break

		case 'b':
			image.background( value )
			break

		case 'g':
			image.crop( sharp.gravity[ value ] )
			break

		case 'q':
			image.jpeg( {
				quality: parseFloat( value ),
				progressive: true,
			} )
			break

	}

	return image
}
