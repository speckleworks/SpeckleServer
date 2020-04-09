const fs = require( 'fs' )
const path = require( 'path' )
const winston = require( './config/logger' )
const URL = require( 'url' ).URL

const isDirectory = source => fs.lstatSync( source ).isDirectory( )
const getDirectories = source => fs.readdirSync( source ).map( name => path.join( source, name ) ).filter( isDirectory )


module.exports = ( ) => {
  winston.debug( 'Scanning for speckle plugins...' )

  // gather potential plugin subdirectories
  const rootDirs = process.env.PLUGIN_DIRS.split( ',' )
  let pluginDirs = [ ]
  rootDirs.forEach( dir => {
    if ( fs.existsSync( dir ) ) {
      let dirs = getDirectories( dir )
      pluginDirs.push( ...dirs, dir )
    } else
      winston.warn( `specified plugin directory does not exist: ${dir}` )
  } )

  // read in manifest files
  let plugins = [ ]
  pluginDirs.forEach( dir => {
    let file = path.join( dir, 'speckle-plugin-manifest.json' )
    if ( fs.existsSync( file ) ) {
      let obj = JSON.parse( fs.readFileSync( file, 'utf8' ) )
      obj.sourceDir = dir
      if ( obj.serveSource )
        obj.serveSource = path.join( dir, obj.serveSource )
      plugins.push( obj )
    } else
      winston.warn( `No plugin manifest file found in ${dir}.` )
  } )

  // check for conflicts
  let serveLocations = [ ]
  plugins.forEach( pl => {
    if ( !serveLocations.includes( pl.serveFrom ) )
      serveLocations.push( pl.serveFrom )
    else {
      winston.warn( `Conflicting plugin endpoint found at: ${pl.serveFrom} in folder ${pl.sourceDir}.
        It will load from ${pl.serveFrom + '-dupe'} instead.` )
      pl.serveFrom += '-dupe'
    }

    pl.canonicalUrl = new URL( pl.serveFrom, process.env.CANONICAL_URL )

  } )
  winston.debug( `Found ${plugins.length} plugin(s): ${plugins.map( p => p.name ).join( ', ' )}` )

  return plugins
}
