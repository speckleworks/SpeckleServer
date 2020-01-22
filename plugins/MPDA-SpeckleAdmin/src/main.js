import Vue from 'vue'
import Axios from 'axios'
import App from './App.vue'
import Router from './router'
import Store from './store/store'
import './registerServiceWorker'

Vue.config.productionTip = false

import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import colors from 'vuetify/es5/util/colors'

Vue.use( Vuetify, {
  theme: {
    primary: colors.blue.darken1, // #E53935
    secondary: colors.blue.lighten4, // #FFCDD2
    accent: colors.indigo.base // #3F51B5
  }
} )

import VueTimeago from 'vue-timeago'
Vue.use( VueTimeago, { locale: 'en' } )

import base64url from 'base64url'
// Set up the server route
// Step 1: Get it form local storage.
let server = localStorage.getItem( 'currentServer' )
if ( server )
  Store.state.server = server

// Step 2: If a query url is present, and different, overwrite it.
try {
  let queryString = window.location.href.split( '?' )[ 1 ]
  let queryVal = queryString.split( '=' )[ 1 ]
  let queryObject = JSON.parse( base64url.decode( queryVal ) )

  if ( queryObject.server && Store.state.server != queryObject.server )
    Store.state.server = queryObject.server

} catch ( err ) {
  console.log( 'Query borked' )
  console.log( err )
}

// set default server
Axios.defaults.baseURL = Store.state.server

// Get the token, if any is present.
let token = localStorage.getItem( 'token' )

// Start the init flow
Axios.get( Store.state.server )
  .then( response => {
    Store.state.serverManifest = response.data
    return Axios.get( `${Store.state.server}/accounts?omit=logins`, { headers: { Authorization: token } } )
  } )
  .then( response => {
    // means we're logged out
    if ( response === null ) {
      // TODO
      initApp( )
      return
    }
    // needs to log in
    if ( response.status !== 200 ) {
      // TODO
      initApp( )
      return
    }
    // set defaults in axios, if we got this far things should be fine
    Axios.defaults.headers.common[ 'Authorization' ] = token
    // update the store
    Store.state.isAuth = true
    Store.state.user = response.data.resource
    Store.state.token = token

    initApp( )
  } )
  .catch( err => {
    initApp( )
  } )

// set axios as default $http request lib
Vue.prototype.$http = Axios

// event bus used for triggerring events cross-hirearchy
window.bus = new Vue( )

// get hex color from string global mixin
import CH from 'color-hash'
let ColorHasher = new CH( )

Vue.mixin( {
  methods: {
    getHexFromString: str => ColorHasher.hex( str ),
    hexFromString: str => ColorHasher.hex( str ),
    appendInfoToUrl( key, info ) {
      let existingQueryObject = this.$route.query.s ? JSON.parse( base64url.decode( this.$route.query.s ) ) : {}
      if ( info !== null )
        existingQueryObject[ key ] = info
      else
        delete existingQueryObject[ key ]

      this.$router.replace( { params: this.$route.params, query: { s: base64url( JSON.stringify( existingQueryObject ) ) } } )

      // console.log( existingQueryObject )
    },
    getUrlQueryObject( ) {
      if ( !this.$route.query.s )
        return null
      return this.$route.query.s ? JSON.parse( base64url.decode( this.$route.query.s ) ) : null
    },
  }
} )


import EditableSpan from './components/EditableSpan.vue'
Vue.component( 'editable-span', EditableSpan )

import Countly from 'countly-sdk-web'
import VueCountly from 'vue-countly'


////////////////////////////////////////////////////////////
//                                                        //
// Commment out the 4 lines below to disable telemetry!   //
//                                                        //
////////////////////////////////////////////////////////////
Vue.use( VueCountly, Countly, {
  app_key: '04ac5c1e31e993f2624e964475dd949e9a3443f5',
  url: 'https://telemetry.speckle.works',
} );

// Automatic 'plugin' component registration:
// H/T to Chris Fritz...

Vue.prototype.$pluginRoutes = [ ]
const requireComponent = require.context(
  // The relative path of the components folder
  '@/plugins',
  // Whether or not to look in subfolders
  true,
  // The regular expression used to match base component filenames
  /plugin-[\w-]+\.vue$/
)

try {
  // console.log( requireComponent.keys( ) )
  requireComponent.keys( ).forEach( ( fileName ) => {
    // Get the component config
    const componentConfig = requireComponent( fileName )
    // Globally register the component
    const component = Vue.component( componentConfig.default.name, componentConfig.default || componentConfig )
    const path = componentConfig.default.name
      .replace( /([a-z])([A-Z])/g, "$1-$2" )
      .replace( /\s+/g, "-" )
      .toLowerCase( );
  
    const route = {
      name: path,
      path: '/plugins/' + path,
      component: component,
      meta: { requiresAuth: componentConfig.default.manifest.requiresAuth },
    }
    Router.addRoutes( [ route ] )
    Vue.prototype.$pluginRoutes.push( route )
  
    if ( componentConfig.default.manifest.registerInNav )
      Store.state.adminPlugins.push( {
        name: componentConfig.default.manifest.humanReadableName,
        description: componentConfig.default.manifest.description,
        icon: componentConfig.default.manifest.icon,
        requiresAuth: componentConfig.default.manifest.requiresAuth,
        route: '/plugins/' + path,
      } )
  
  } )
} catch (error) {
  console.error(error)
}

// The init logic (it's called after we do some auth flows)
let initApp = ( ) => {
  new Vue( {
    router: Router,
    store: Store,
    render: h => h( App ),
    created( ) {

      ////////////////////////////////////////////////////////////
      //                                                        //
      // Commment out the two lines below to disable telemetry! //
      //                                                        //
      ////////////////////////////////////////////////////////////
      this.$Countly.q.push( [ 'track_sessions' ] )
      Router.$Countly = this.$Countly
    }
  } ).$mount( '#app' )
}
