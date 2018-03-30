const winston = require( 'winston' )
const chalk = require( 'chalk' )
const crypto = require( 'crypto' )
const SpeckleObject = require( '../../../../models/SpeckleObject' )
/*
HIC SVNT DRACONES
 */
module.exports = ( objects, user ) => {
  winston.debug( chalk.bgBlue( 'Bulk obj save: ' ) + ` ${objects.length} received` )
  objects.forEach( obj => {
    if ( !obj.hash && obj.type != 'Placeholder' ) obj.hash = crypto.createHash( 'md5' ).update( JSON.stringify( obj ) ).digest( 'hex' );
  } )

  return new Promise( ( resolve, reject ) => {
    if ( objects.length === 0 )
      return resolve( objects )
    
    let notPlaceholders = objects.filter( obj => obj.type != 'Placeholder'  )
    if( notPlaceholders.length === 0 ) 
      return resolve(  objects )
    
    SpeckleObject.find( { hash: { $in: objects.map( obj => obj.hash ) } }, '_id hash' )
      .then( existingObjects => {
        winston.debug( chalk.bgBlue( 'Bulk obj save: ' ) + ` ${existingObjects.length} preexisting objs.` )
        existingObjects.forEach( dbObj => objects.filter( obj => obj.hash === dbObj.hash ).forEach( obj => obj._id = dbObj._id.toString( ) ) )

        let toCreate = objects.filter( obj => obj._id === undefined )
        toCreate.forEach( obj => obj.owner = user._id )
        return SpeckleObject.insertMany( toCreate )
      } )
      .then( insertedObjects => {
        winston.debug( chalk.bgBlue( 'Bulk obj save: ' ) + ` ${insertedObjects.length} new objs created` )
        insertedObjects.forEach( dbObj => objects.filter( obj => obj.hash === dbObj.hash ).forEach( obj => obj._id = dbObj._id.toString( ) ) )
        resolve( objects )
      } )
      .catch( err => {
        reject( err )
      } )
  } ) 
}