import Vue from 'vue'
import Vuex from 'vuex'

//viewer store for viewer settings
const viewerStore = {
  state: {
    showEdges: false,
    edgesThreshold: 45,
    castShadows: false,
    meshOverrides: {
      opacity: 84,
      specular: 30
    }
  },
  mutations: {
    TOGGLE_EDGES( state, payload ) {
      state.showEdges = payload
      localStorage.setItem( 'viewerSettings', JSON.stringify( state ) )
    },
    SET_EDGES_THRESHOLD( state, payload ) {
      state.edgesThreshold = payload
      localStorage.setItem( 'viewerSettings', JSON.stringify( state ) )
    },
    TOGGLE_SHADOWS( state, payload ) {
      state.castShadows = payload
      localStorage.setItem( 'viewerSettings', JSON.stringify( state ) )
    },
    SET_MESH_OPACITY( state, payload ) {
      state.meshOverrides.opacity = payload
      localStorage.setItem( 'viewerSettings', JSON.stringify( state ) )
    },
    SET_MESH_SPECULAR( state, payload ) {
      state.meshOverrides.specular = payload
      localStorage.setItem( 'viewerSettings', JSON.stringify( state ) )
    },
    SET_ALL_VIEWER_SETTINGS( state, payload ) {
      Object.keys( payload ).forEach( key => {
        state[ key ] = payload[ key ]
      } )
    }
  }
}

export default viewerStore
