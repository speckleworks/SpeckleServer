const winston = require( '../../../config/logger' )
const _ = require( 'lodash' )
const DataStream = require( '../../../models/DataStream' )
const Client = require( '../../../models/UserAppClient' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  console.log(req.params)
  if ( !req.params.streamId || !req.params.otherId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }

  if ( req.params.streamId == req.params.otherId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'Can not diff the same stream, yo!' } )
  }

  let first = {}
  let second = {}
  let firstClients = []
  let secondClients = []

  DataStream.find( { streamId: { $in: [ req.params.streamId, req.params.otherId ] } } ).lean( )
    .then( streams => {
      if ( streams.length != 2 ) throw new Error( 'Failed to find streams.' )

      first = streams.find( s => s.streamId === req.params.streamId )
      second = streams.find( s => s.streamId === req.params.otherId )
      
      
      // check if user can read first stream
      
      return PermissionCheck( req.user, 'read', first )
    } )
    .then( ( ) => {
      
      // check if user can read second stream
      return PermissionCheck( req.user, 'read', second )
    } )
    .then( ( ) => {
      
       //console.log(Client.find( { streamId: first.streamId } ))
       return Client.find( { streamId: first.streamId } ).populate( 'owner', 'name surname email company' ) // uncomment if u need these
    } )
    .then( clFirst => {
      firstClients = clFirst
      //console.log(firstClients)
      return Client.find( { streamId: second.streamId } ).populate( 'owner', 'name surname email company' ) // uncomment if u need these
    })
    .then( clSecond => {
      
      secondClients = clSecond

      console.log(req.params.streamId,"lol")
      let objects = { common: null, inA: null, inB: null }
      first.objects = first.objects.map( o => o.toString( ) )
      second.objects = second.objects.map( o => o.toString( ) )
      objects.common = first.objects.filter( id => second.objects.includes( id ) )
      objects.inA = first.objects.filter( id => !second.objects.includes( id ) )
      objects.inB = second.objects.filter( id => !first.objects.includes( id ) )
      let firstSenderClient = firstClients.filter( cl => cl.role === 'Sender' )[0] // returns an arr, take first elem
      let secondSenderClient = secondClients.filter( cl => cl.role === 'Sender' )[0] // returns an arr, take first elem
      
      res.send( {
        success: true,
        revision_datetime: new Date().toLocaleString("en"),
        autor: firstSenderClient.owner,
        delta: {
          created: objects.inA,
          deleted: objects.inB,
          common: objects.common
        },
        revision_A: {
          id: req.params.streamId, 
          updatedAt: firstSenderClient.updatedAt.toLocaleString("en"), 
          sender: firstSenderClient.documentType
        },
        revision_B: {
          id: req.params.otherId, 
          updatedAt: secondSenderClient.updatedAt.toLocaleString("en"), 
          sender: secondSenderClient.documentType
        }
      } )

    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )

}