const http  = require( 'http' )
const image = require( './image' )
const fs    = require( 'fs' )

let config = JSON.parse( fs.readFileSync( './config.json' ) )

http.createServer( ( req, res ) => {

	image( req.url ).then( theImage => {
		res.writeHead( 200, {
			'Content-Type': 'image/' + theImage.info.format,
			'Content-Length': theImage.info.size,
			'Cache-Control': 'public, max-age=31557600',
		} )
		res.write( theImage.data )
		return res.end()
	} ).catch( () => {
		res.writeHead( 404, {
			'Content-Type': 'text/plain',
			'Cache-Control': 'no-cache',
		} )
		res.write( '404' )
		return res.end()
	} )

} ).listen( config.port )
