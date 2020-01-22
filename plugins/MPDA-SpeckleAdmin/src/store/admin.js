import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'

// the admin module is a seperate store that includes all the users / streams / projects on the system
// its ADD mutations are unique, and are called by get*Admin actions contained in this module
// but its UPDATE and DELETE mutations are the same as those in the rootStore, so rootStore actions update
// or delete state for projects, streams, and the current user across both stores
const adminStore = {
  state: {
    streams: [ ],
    users: [ ],
    projects: [ ]
  },
  mutations: {
    //streams
    ADD_STREAMS_ADMIN( state, streams ) {
      streams.forEach( stream => {
        if ( state.streams.findIndex( x => x.streamId === stream.streamId ) === -1 ) {
          // defensive code (vue 3.0 we're off to typescript baby, can't wait)
          if ( !stream.description ) stream.description = '...'
          if ( !stream.tags ) stream.tags = [ ]
          state.streams.unshift( stream )
        }
      } )
    },
    UPDATE_STREAM( state, props ) {
      let found = state.streams.find( s => s.streamId === props.streamId )
      if ( !found ) return console.error( 'User not found; aborting update.' )
      Object.keys( props ).forEach( key => {
        found[ key ] = props[ key ]
      } )
      found.updatedAt = ( new Date( ) ).toISOString( )
    },
    DELETE_STREAM( state, stream ) {
      let index = state.streams.findIndex( s => s.streamId === stream.streamId )
      if ( index > -1 ) {
        state.streams.splice( index, 1 )
      } else
        console.log( `Failed to remove stream ${stream.streamId} from store.` )
    },
    //users
    ADD_USERS_ADMIN( state, users ) {
      users.forEach( user => {
        let found = state.users.find( u => u._id === user._id )
        if ( !found )
          state.users.unshift( user )
        else found = user // update the user
      } )
    },
    UPDATE_USER( state, user ) {
      let found = null
      found = state.users.find( u => u._id === user._id )
      if ( !found )
        return console.error( 'User not found; aborting update.' )
      Object.keys( user ).forEach( key => {
        found[ key ] = user[ key ]
      } )
    },
    //projects
    ADD_PROJECTS_ADMIN( state, projects ) {
      projects.forEach( project => {
        if ( state.projects.findIndex( p => p._id === project._id ) === -1 ) {
          // potentially enforce here extra fields
          if ( !project.tags ) project.tags = [ ]
          if ( !project.deleted ) project.deleted = false
          state.projects.unshift( project )
        }
      } )
    },
    UPDATE_PROJECT( state, props ) {
      let found = state.projects.find( p => p._id === props._id )
      if ( null == found ) return
      Object.keys( props ).forEach( key => {
        found[ key ] = props[ key ]
      } )
      found.updatedAt = ( new Date( ) ).toISOString( )
    },
    DELETE_PROJECT( state, props ) {
      let index = state.projects.findIndex( p => p._id === props._id )
      if ( index > -1 ) {
        state.projects.splice( index, 1 )
      } else
        console.log( `Failed to remove project ${props._id} from store.` )
    },
  },
  getters: {},
  actions: {
    //streams
    getStreamsAdmin( context ) {
      return new Promise( ( resolve, reject ) => {
        Axios.get( 'streams/admin' )
          .then( res => {
            context.commit( 'ADD_STREAMS_ADMIN', res.data.resources )
            return resolve( res.data.resources )
          } )
          .catch( err => {
            console.log( err )
            return reject( err )
          } )
      } )
    },

    //users
    getUsersAdmin( context ) {
      return new Promise( ( resolve, reject ) => {
        Axios.get( 'accounts/admin' )
          .then( res => {
            context.commit( 'ADD_USERS_ADMIN', res.data.resource )
            return resolve( res.data.resources )
          } )
          .catch( err => {
            console.log( err )
            return reject( err )
          } )
      } )
    },
    updateUserAdmin( context, user ) {
      return new Promise( ( resolve, reject ) => {
        Axios.put( "accounts/" + user._id, user )
          .then( res => {
            return resolve( context.commit( 'UPDATE_USER', user ) )
          } )
          .catch( err => {
            return reject( err )
          } )
      } )

    },
    //projects
    getProjectsAdmin( context ) {
      return new Promise( ( resolve, reject ) => {
        Axios.get( 'projects/admin' )
          .then( res => {
            context.commit( 'ADD_PROJECTS_ADMIN', res.data.resources )
            return resolve( res.data.resources )
          } )
          .catch( err => {
            console.log( err )
            return reject( err )
          } )
      } )
    },
  }
}

export default adminStore
