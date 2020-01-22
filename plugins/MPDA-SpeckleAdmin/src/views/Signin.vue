<template>
  <v-container fluid fill-height>
    <v-layout xx-align-center justify-center>
      <v-flex xs11 md6 lg6>
        <form @submit.prevent='login' v-if='$store.state.isAuth === false'>
          <v-card class="elevation-3">
            <v-toolbar dense class='title small text-uppercase elevation-0' v-if='servers.length!==0'>
              <v-icon small>account_circle</v-icon>&nbsp;&nbsp;<span class='font-weight-light'>Previously used servers</span>
            </v-toolbar>
            <v-card-text v-if='servers.length!==0'>
              <!-- <p class='pl-3'><small>Previously used accounts:</small></p> -->
              <v-list two-line>
                <v-list-tile v-for='server in servers' :key='server.url' @click='prevAccountClick(server.url)' class='elevation-0 my-3'>
                  <v-list-tile-content>
                    <v-list-tile-title><b>{{server.name}}</b></v-list-tile-title>
                    <v-list-tile-sub-title>{{server.url}} <small>({{server.version}})</small></v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <v-btn color="primary" fab small dark>
                      <v-icon>arrow_right_alt</v-icon>
                    </v-btn>
                  </v-list-tile-action>
                </v-list-tile>
              </v-list>
              <!-- {{servers}} -->
              <!-- {{localStorage}} -->
            </v-card-text>
            <v-toolbar dense class='title small text-uppercase elevation-0'>
              <v-icon small>group_add</v-icon>&nbsp;&nbsp;<span class='font-weight-light'>Sign in</span>
            </v-toolbar>
            <v-card-text>
              <p class='pl-3'>Login or register to a new server by inputting its url below:</p>
              <v-list two-line>
                <v-list-tile>
                  <v-list-tile-content>
                    <v-text-field style='width: 90%' xxx-prepend-inner-icon='developer_board' hint='server url' type="url" v-model='server' name='server' label='server url' placeholder='https://speckle.yourdomain.com'></v-text-field>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <v-btn color="black" fab small dark type="submit" @click='login()'>
                      <v-icon>arrow_right_alt</v-icon>
                    </v-btn>
                  </v-list-tile-action>
                </v-list-tile>
              </v-list>
            </v-card-text>
            <v-card-actions>
            </v-card-actions>
            <v-alert v-model="showError" type="warning" dismissible>
              {{errorMessage}}
            </v-alert>
          </v-card>
        </form>
        <v-card v-else>
          <v-card-text>You are already logged in.</v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import Axios from 'axios'

export default {
  name: 'SigninView',
  components: {},
  computed: {},
  watch: {},
  data( ) {
    return {
      server: null,
      errorMessage: null,
      showError: false,
      servers: [ ]
    }
  },
  methods: {
    prevAccountClick( serverUrl ) {
      this.server = serverUrl
      this.login( )
    },
    login( ) {
      this.showError = false
      let url = null
      try {
        url = new URL( this.server )
        let originUrl = new URL( window.location.href )
        localStorage.setItem( '__tempServer', url.origin )
        window.open( `${url.origin}/signin?redirectUrl=${ window.encodeURIComponent( location.origin +'/#/signin/callback') }`, 'login screen', 'height=700,width=800' )
      } catch ( err ) {
        this.errorMessage = err.message
        this.showError = true
      }
    },
    checkExistingServers( ) {
      let usedServers = localStorage.getItem( 'allSpeckleServers' ) ? localStorage.getItem( 'allSpeckleServers' ).split( ',' ) : null
      let promises = usedServers.map( s => {
        Axios.get( s )
          .then( res => {
            this.servers.push( { url: s, name: res.data.serverName, version: res.data.version } )
          } )
          .catch( err => {
            this.servers.push( { url: s, name: 'Server Unreachable', version: 'n/a' } )
          } )
      } )
      let servers = [ ]

    },
    checkRedirect( ) {
      //TODO
    }
  },
  activated( ) {
    this.checkExistingServers( )
  },
  mounted( ) {
    this.checkExistingServers( )
    this.checkRedirect( )

    if ( !window.location.href.includes( 'speckle.systems' ) ) {
      this.server = new URL( window.location.href ).origin
    }

    if ( this.$store.state.isAuth === true ) {
      this.appendInfoToUrl( 'server', { apiUrl: this.$store.state.server } )
      this.$router.push( '/' )
    }
  }
}

</script>
<style scoped lang='scss'>
</style>
