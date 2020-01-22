<template>
  <div>
    <v-list class='' :expand='true' subheader dense two-line>
      <v-list-group :value='!$store.state.isAuth'>
        <template v-slot:activator>
          <v-list-tile xxx-v-if='$store.state.serverManifest.serverName'>
            <v-list-tile-action>
              <v-icon>account_circle</v-icon>
            </v-list-tile-action>
            <v-list-tile-content v-if='$store.state.server'>
              <v-list-tile-title class='xxx-font-weight-light caption'>
                <b>{{$store.state.serverManifest.serverName}}</b>
              </v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-content v-else>
              <v-list-tile-title class='xxx-font-weight-light caption'>
                <b>No server selected.</b>
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
        <v-list-tile v-if='$store.state.isAuth'>
          <v-list-tile-action>
            <v-icon>info</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-sub-title>Server version: {{$store.state.serverManifest.version}}</v-list-tile-sub-title>
            <v-list-tile-sub-title>App version: {{$store.state.appVersion}}</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile to='/profile' v-if='$store.state.isAuth'>
          <v-list-tile-action>
            <v-icon>face</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Profile</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if='$store.state.isAuth' @click='logout()'>
          <v-list-tile-action>
            <v-icon class='red--text'>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Logout
            </v-list-tile-title>
            <v-list-tile-sub-title class='xxx-font-weight-lightxxx caption'>
              Logs you out of the current server.
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile to='/signin' v-else>
          <v-list-tile-action>
            <v-icon>lock</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Signin</v-list-tile-title>
            <v-list-tile-sub-title>Login or register</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list-group>
    </v-list>
    <v-list v-if='$store.state.isAuth' two-line class='pa-0'>
      <v-list-tile to='/'>
        <v-list-tile-action>
          <v-icon>home</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Home</v-list-tile-title>
          <v-list-tile-sub-title class='xxx-font-weight-light caption'>Everything at a glance.</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile to='/streams'>
        <v-list-tile-action>
          <v-icon>import_export</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Streams</v-list-tile-title>
          <v-list-tile-sub-title class='xxx-font-weight-light caption'>Create and manage your streams.</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile to='/projects'>
        <v-list-tile-action>
          <v-icon>business</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Projects</v-list-tile-title>
          <v-list-tile-sub-title class='xxx-font-weight-light caption'>Group your data and share it with others.</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile to='/trash'>
        <v-list-tile-action>
          <v-icon>delete_outline</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Archive</v-list-tile-title>
          <v-list-tile-sub-title class='xxx-font-weight-light caption'>The good old recycle bin.</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile to='/view'>
        <v-list-tile-action>
          <v-icon>360</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Viewer</v-list-tile-title>
          <v-list-tile-sub-title class='xxx-font-weight-light caption'>3d speckle stream viewer</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile to='/processors'>
        <v-list-tile-action>
          <v-icon>code</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Processor</v-list-tile-title>
          <v-list-tile-sub-title class='xxx-font-weight-light caption'>Stream processing</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <!-- Dynamically add plugin routes -->
      <v-list-tile v-for='plugin in $store.state.adminPlugins' :to='plugin.route' :key='plugin.route'>
        <v-list-tile-action>
          <v-icon>{{plugin.icon}}</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{plugin.name}}</v-list-tile-title>
          <v-list-tile-sub-title class='xxx-font-weight-light caption'>{{plugin.description}}</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <!-- end plugin routes -->
      <!-- <v-divider class='ma-3'></v-divider> -->
      <v-divider class='ma-3'></v-divider>
      <v-list-tile v-if='$store.state.user.role==="admin"' to='/admin'>
        <v-list-tile-action>
          <v-icon>settings</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Admin</v-list-tile-title>
          <v-list-tile-sub-title class='xxx-font-weight-light caption'>Server administration</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile to='/pluginsadmin'>
        <v-list-tile-action>
          <v-icon>extensions</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Plugins</v-list-tile-title>
          <v-list-tile-sub-title class='xxx-font-weight-light caption'>Plugins registered on this server</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-divider class='ma-3'></v-divider>
    </v-list>
    <v-list xxxv-if='$store.state.isAuth' two-line subheader>
      <v-list-tile href='https://speckle.systems/docs/web/management' target='_blank'>
        <v-list-tile-action>
          <v-icon>help</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>App Help</v-list-tile-title>
          <v-list-tile-sub-title class='caption'>Help for this web app.</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile href='https://speckle.systems/docs/essentials/start' target='_blank'>
        <v-list-tile-action>
          <v-icon>help_outline</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Speckle Help</v-list-tile-title>
          <v-list-tile-sub-title class='caption'>How to get started with Speckle.</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
    <v-divider xxxsclass='mb-4' v-if='$store.state.isAuth'></v-divider>
    <v-list dense subheader class='ma-0 pa-0'>
      <v-list-tile @click='toggleDark()'>
        <v-list-tile-action>
          <v-icon>{{$store.state.dark ? "wb_sunny" : "nights_stay"}}</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{$store.state.dark ? "Day Mode" : "Dark Mode"}}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
    <v-divider class='ma-0 pa-0'></v-divider>
    <v-card class='elevation-0'>
      <v-card-text>
        <div class='text-uppercase text-xs-center-xxx caption ml-0 pa-5 ml-2 mt-3 mb-3'>
          Brought to you by:<br>
          <a href='https://speckle.works' target="_blank" style="xxxcolor:white; text-decoration: none;"><b>Speckle</b>,
            <span class=' caption'>the open source data platform for AEC.</span></a>
          <!-- <v-divider class='my-4'></v-divider> -->
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
export default {
  name: 'SiteNavigation',
  data: _ => ( {
    dark: false,
  } ),
  methods: {
    logout( ) {
      this.$store.dispatch( 'logout' )
      this.$router.push( '/signin' )
    },
    toggleDark( ) {
      this.dark = !this.dark
      localStorage.setItem( 'dark', this.dark )
      this.$store.commit( 'SET_DARK', this.dark )
    },
  },
  mounted( ) {
    this.dark = this.$store.state.dark
  }
}

</script>
<style lang='scss'>
</style>
