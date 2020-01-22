import base64url from 'base64url'
import Vue from 'vue'
import Router from 'vue-router'
import Store from './store/store'

Vue.use( Router )

let myRouter = new Router( {
  linkExactActiveClass: 'is-active',
  routes: [ {
      path: '/',
      name: 'dashboard',
      component: ( ) => import( './views/Dashboard.vue' ),
      meta: { requiresAuth: true },
    },
    {
      path: '/signin:redirectTo?',
      name: 'signin',
      component: ( ) => import( './views/Signin.vue' ),
      beforeEnter( to, from, next ) {
        next( )
      }
    },
    {
      path: '/signin/callback',
      name: 'signin-cb',
      component: ( ) => import( './views/SigninCallback.vue' ),
    },
    {
      path: '/streams',
      name: 'streams',
      component: ( ) => import( './views/Streams.vue' ),
      meta: { requiresAuth: true },
    },
    {
      path: '/streams/:streamId',
      component: ( ) => import( './views/Stream.vue' ),
      meta: { requiresAuth: true },
      children: [ {
        name: 'stream overview',
        path: '',
        component: ( ) => import( './views/StreamOverview.vue' )
      }, {
        name: 'stream data',
        path: 'data',
        component: ( ) => import( './views/StreamData.vue' )
      }, {
        name: 'stream sharing',
        path: 'sharing',
        component: ( ) => import( './views/StreamSharing.vue' )
      }, {
        name: 'stream history',
        path: 'history',
        component: ( ) => import( './views/StreamHistory.vue' )
      } ]
    },
    {
      path: '/projects',
      name: 'projects',
      component: ( ) => import( './views/Projects.vue' ),
      meta: { requiresAuth: true },
    },
    {
      path: '/projects/:projectId',
      name: 'project overview',
      component: ( ) => import( './views/Project.vue' ),
      meta: { requiresAuth: true },
    },
    {
      path: '/view/:streamIds*',
      name: 'viewer',
      component: ( ) => import( './views/Viewer.vue' ),
      meta: { requiresAuth: false },
    },
    {
      path: '/trash',
      name: 'trash',
      component: ( ) => import( './views/Trash.vue' ),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ( ) => import( './views/Profile.vue' ),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: ( ) => import( './views/Admin.vue' ),
      meta: { requiresAuth: true },
      children: [ {
        name: 'admin users',
        path: '',
        component: ( ) => import( './views/AdminUsers.vue' )
      }, {
        name: 'admin streams',
        path: 'streams',
        component: ( ) => import( './views/AdminStreams.vue' )
      }, {
        name: 'admin projects',
        path: 'projects',
        component: ( ) => import( './views/AdminProjects.vue' )
      } ]
    },
    {
      path: '/processors',
      name: 'processors',
      component: ( ) => import( './views/Processors.vue' ),
      meta: { requiresAuth: true },
    },
    {
      path: '/processors/:processorId',
      name: 'processor overview',
      component: ( ) => import( './views/Processor.vue' ),
      meta: { requiresAuth: true },
    },
    {
      path: '/pluginsadmin',
      name: 'plugins',
      component: ( ) => import( './views/Plugins.vue'),
      meta: { requiresAuth: true}
    }
  ],
} )

myRouter.afterEach( ( to, from ) => {
  if ( to.name === 'signin-cb' ) return


  let existingQueryObject = to.query.s ? JSON.parse( base64url.decode( to.query.s ) ) : {}
  if ( existingQueryObject && existingQueryObject.server && existingQueryObject.server === Store.state.server )
    return

  if ( Store.state.server )
    existingQueryObject.server = Store.state.server

  if ( myRouter.$Countly ) {
    myRouter.$Countly.q.push( [ 'track_pageview', to.name ] )
  }

  myRouter.replace( { params: to.params, query: { s: base64url( JSON.stringify( existingQueryObject ) ) } } )
} )

myRouter.beforeEach( ( to, from, next ) => {
  if ( to.meta.requiresAuth ) {
    if ( to.meta.requiresAuth === true && Store.state.isAuth === false )
      return next( { path: '/signin' } )
  }
  next( )
} )

export default myRouter
