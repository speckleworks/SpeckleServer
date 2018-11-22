const fs = require( 'fs' )
const path = require( 'path' )
const winston = require( './config/logger' )

const isDirectory = source => fs.lstatSync( source ).isDirectory( )
const getDirectories = source => fs.readdirSync( source ).map( name => path.join( source, name ) ).filter( isDirectory )

module.exports = ( ) => {
  winston.debug( 'Scanning for speckle plugins...' )

  // gather potential plugin subdirectories
  const rootDirs = process.env.PLUGIN_DIRS.split( `,` )
  let pluginDirs = [ ]
  rootDirs.forEach( dir => {
    if ( fs.existsSync( dir ) ) {
      let dirs = getDirectories( dir )
      pluginDirs = [ ...dirs, pluginDirs ]
    } else
      winston.warn( `specified plugin directory does not exist: ${dir}` )
  } )

  // read in manifest files
  let plugins = []
  pluginDirs.forEach( dir => {
    let file = path.normalize( `${dir}//speckle-plugin-manifest.json` )
    if ( fs.existsSync( file ) ) {
      let obj = JSON.parse( fs.readFileSync( file, 'utf8' ) )
      obj.sourceDir = dir
      plugins.push( obj )
    } else
      winston.warn( `No plugin manifest file found in ${dir}.` )
  } )

  // check for conflicts
  let serveLocations = []
  plugins.forEach( pl => {
    if ( serveLocations.indexOf( pl.serveFrom ) < 0 )
      serveLocations.push( pl.serveFrom )
    else {
      winston.warn( `Conflicting plugin endpoint found at: ${pl.serveFrom} in folder ${pl.sourceDir}.
        It will load from ${pl.serveFrom + '-dupe'} instead.` )
      pl.serveFrom += '-dupe'
    }
    pl.canonicalUrl = process.env.CANONICAL_URL + pl.serveFrom
  } )
  winston.debug( `Found ${plugins.length} plugin(s):${plugins.map( p => ' ' + p.name )}` )

  return plugins
}
