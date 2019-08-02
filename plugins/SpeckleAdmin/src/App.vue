<template>
  <div id="app">
    <md-app md-waterfall>
      <md-app-drawer :md-active="showSidebar" class='super-bg md-primary nav-sidebar' md-persistent="mini">
        <md-list>
          <md-list-item @click='showSidebar=!showSidebar'>
            <md-icon>{{ showSidebar ? "chevron_left" : "chevron_right"}}</md-icon>
            <span class="md-list-item-text"></span>
          </md-list-item>
        </md-list>
        <nav-drawer></nav-drawer>
        <div class='md-caption credits'><a href='https://speckle.works' target="_blank"><img src='https://speckle.works/img/logos/logo-xs.png' width="19px"></a></div>
      </md-app-drawer>
      <md-app-content>
        <keep-alive exclude='StreamDetailView'>
          <router-view></router-view>
        </keep-alive>
      </md-app-content>
    </md-app>
  </div>
</template>
<script>
import NavDrawer from './components/NavDrawer.vue'

export default {
  name: 'MainApp',
  components: {
    NavDrawer
  },
  data: _ => ( {
    showSidebar: true
  } ),
  created( ) {
    if ( this.$store.state.isAuth ) {
      this.$store.dispatch( 'getStreams', 'omit=objects,layers&isComputedResult=false&sort=updatedAt' )
      this.$store.dispatch( 'getProjects' )
    }
  },
  updated( ) {
    let overlay = document.getElementsByClassName( "md-overlay" )[ 0 ]
    if ( !overlay ) return
    overlay.onclick = ( function( ) {
      this.showSidebar = false
    } ).bind( this )
  }

}

</script>
<style lang='scss'>
$SpeckleBlue: #448aff;

.credits {
  position: absolute;
  bottom:20px;
  width: 100%;
  text-align: center;
}
.credits a {
  color: white !important;
}
.md-app-content {
  @media only screen and (max-width: 600px) {
    padding: 0 !important;
  }
}
.text-center-small {
  @media only screen and (max-width: 600px) {
    text-align: center;
  }
}

.md-drawer.md-persistent-mini {
  transform: translate3D(0, 0px, 0) !important;
}

.super-bg {
  background: #448aff;
  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #448aff, #396afc);
  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #448aff, #396afc);
  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}


#app {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.md-app {
  height: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.btn-no-margin,
.no-margin {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.md-card.md-with-hover {
  cursor: default !important;
}

button {
  /*cursor: pointer !important;*/
}

.stream-chips:after {
  display: none !important;
}

.stream-chips:before {
  display: none !important;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center !important;
}

.bg-ghost-white {
  background-color: ghostwhite;
}

.sticky-top {
  position: -webkit-sticky;
  /* Safari */
  position: sticky;
  top: 0;
  width: 100%;
  background-color: white;
  z-index: 100;
  /*margin-bottom: 30px;*/
}

.md-select-menu {
  /*z-index: 10000 !important;*/
  background-color: white !important;
}

</style>
