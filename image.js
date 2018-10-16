const path      = require( 'path' )
const fs        = require( 'fs' )
const mkdirp    = require( 'mkdirp' )
const request   = require( 'request' )
const transform = require( './transform' )

module.exports = ( url ) => {
	return new Promise( ( resolve, reject ) => {
		let parsedUrl = parseUrl( url )

		if ( false === parsedUrl ) {
			reject()
		}

		let filePath = path.resolve( `./images/${parsedUrl.cloud.name}/${parsedUrl.cloud.folder}/${parsedUrl.file}` )
		let fileUrl  = `${parsedUrl.cloud.remote}${parsedUrl.file}`

		downloadMissingImage( fileUrl, filePath ).then( () => {
			transform( filePath, parsedUrl.transformations ).then( data => {
				resolve( Object.assign( data, parsedUrl ) )
			} ).catch( reject )
		} ).catch( reject )
	} )
}

parseUrl = ( url ) => {
	let config = JSON.parse( fs.readFileSync( './config.json' ) )
	let clouds = config.clouds
	let match  = false

	clouds.some( ( cloud ) => {
		match = matchUrl( url, cloud.name, cloud.folder )
		if ( false !== match ) {
			match.cloud = cloud
			return true
		}
		return false
	} )

	return match
}

matchUrl = ( url, name, folder ) => {
	let hasCustomFileName   = false
	let transformationIndex = -1
	let fileIndex           = -1
	let match               = null

	let regExps = [
		{
			regex: `${name}\/images\/(.*)\/${folder}\/(.+)`,
			customFileName: true,
			transformations: 1,
			file: 2,
		},
		{
			regex: `${name}\/images\/${folder}\/(.+)`,
			customFileName: true,
			transformations: -1,
			file: 1,
		},
		{
			regex: `${name}\/(.*)\/${folder}\/(.+)`,
			customFileName: false,
			transformations: 1,
			file: 2,
		},
		{
			regex: `${name}\/${folder}\/(.+)`,
			customFileName: false,
			transformations: -1,
			file: 1,
		},
	]

	regExps.some( ( regExp ) => {
		match = url.match( new RegExp( regExp.regex ) )
		if ( null !== match ) {
			hasCustomFileName   = regExp.customFileName
			transformationIndex = regExp.transformations
			fileIndex           = regExp.file
			return true
		}
		return false
	} )

	if ( null === match ) {
		return false
	}

	let transformationString = ''
	let fileName             = ''
	let transformations      = {}

	if ( transformationIndex > 0 ) {
		transformationString = match[ transformationIndex ]

		let allTransformations = transformationString.split( ',' )

		allTransformations.forEach( singleTransformation => {
			let transformation                   = singleTransformation.split( '_', 2 )
			transformations[ transformation[0] ] = transformation[1]
		} )
	}

	if ( fileIndex > 0 ) {
		fileName = match[ fileIndex ]

		if ( hasCustomFileName ) {
			fileName = path.dirname( fileName ) + path.extname( fileName )
		}
	}

	return {
		transformations: transformations,
		file: fileName,
	}
}

downloadMissingImage = ( url, filePath ) => {
	return new Promise( ( resolve, reject ) => {
		if ( ! fs.existsSync( filePath ) ) {
			downloadImage( url, filePath ).then( resolve ).catch( reject )
		} else {
			resolve()
		}
	} )
}

downloadImage = ( url, filePath ) => {
	return new Promise( resolve => {
		mkdirp( path.dirname( filePath ) )
		request.head( url, () => {
			request( url ).pipe( fs.createWriteStream( filePath ) ).on( 'close', resolve )
		} )
	} )
}
