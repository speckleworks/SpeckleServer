import Vue from 'vue'
import Router from 'vue-router'
import Store from './store'

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
      path: '/login/:redirectTo?',
      name: 'login',
      component: ( ) => import( './views/Login.vue' )
    },
    {
      path: '/register',
      name: 'register',
      component: ( ) => import( './views/Register.vue' ),
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
        name: 'streamoverview',
        path: '',
        component: ( ) => import( './views/StreamOverview.vue' )
      }, {
        name: 'streamdata',
        path: 'data',
        component: ( ) => import( './views/StreamData.vue' )
      },{
        name: 'streamsharing',
        path: 'sharing',
        component: ( ) => import( './views/StreamSharing.vue' )
      } ,{
        name: 'streamhistory',
        path: 'history',
        component: ( ) => import( './views/StreamHistory.vue' )
      } ]
    },
    {
      path: '/projects',
      name: 'projects',
      component: ( ) => import( './views/Projects.vue' ),
      meta: { requiresAuth: true },
    }, {
      path: '/projects/:projectId',
      name: 'singleproject',
      component: ( ) => import( './views/Project.vue' ),
      meta: { requiresAuth: true },
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
      path: '/plugins',
      name: 'plugins',
      component: ( ) => import( './views/Plugins.vue' ),
      meta: { requiresAuth: true },
    },
    {
      path: '/feedback',
      name: 'feedback',
      component: ( ) => import( './views/Feedback.vue' ),
      meta: { requiresAuth: true },
    }
  ],
  // scrollBehavior( to, from, savedPosition ) {
  //   console.log( 'scrollBehavior' )
  //   return { x: 0, y: 0 }
  // }
} )

// myRouter.afterEach( ( to, from ) => {
//   document.getElementById( 'app' ).scrollIntoView( )
// } )

myRouter.beforeEach( ( to, from, next ) => {
  if ( to.meta.requiresAuth ) {
    if ( to.meta.requiresAuth === true && Store.state.isAuth === false )
      return next( { path: '/login' + ( to !== null ? "/" + window.btoa( to.path ) : "" ) } )
  }
  next( )
} )

export default myRouter
