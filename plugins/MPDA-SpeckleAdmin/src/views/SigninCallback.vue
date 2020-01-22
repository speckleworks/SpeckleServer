<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs11 md6 lg6>
        <v-card class="elevation-3" v-if='!$store.state.isAuth'>
          <v-toolbar dense class='title small text-uppercase elevation-0' v-show="!showError">
            <v-icon small>lock_open</v-icon>&nbsp;<span class='font-weight-light'>Finishing up...</span>
          </v-toolbar>
          <v-card-text v-if='!showError'>
            This shouldn't take long.
          </v-card-text>
          <v-card-text v-else class='pt-4'>
            <p class='headline font-weight-light'><v-icon class='pb-1'>error</v-icon>&nbsp;Oups. Something bad happened :(</p>
            <p class='caption' v-if='sslProblem'>
              Your server is not using SSL (i.e, your server url is http and not http<b>s</b>. Please check the community supported <a href='https://discourse.speckle.works/t/speckle-server-debian-9-installation-notes-for-development-machines/344' target="_blank"> server deployment instructions</a>. If still in trouble, don't hesitate to get in touch on <a href="https://speckle-works.slack.com/join/shared_invite/enQtNjY5Mzk2NTYxNTA4LTU4MWI5ZjdhMjFmMTIxZDIzOTAzMzRmMTZhY2QxMmM1ZjVmNzJmZGMzMDVlZmJjYWQxYWU0MWJkYmY3N2JjNGI">slack</a> or <a href="https://discourse.speckle.works/">discourse</a>.</p>
            <v-btn block to='/signin'>back to signin</v-btn>
          </v-card-text>
          <v-card-actions>
          </v-card-actions>
          <v-alert v-model="showError" type="warning" dismissible>
            Specifics:
            <pre>{{errorMessage}}</pre>
          </v-alert>
        </v-card>
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
  name: 'SigninViewCallback',
  components: {},
  computed: {},
  watch: {},
  data( ) {
    return {
      server: null,
      errorMessage: null,
      showError: false,
      sslProblem: false
    }
  },
  methods: {},
  mounted( ) {
    if ( this.$store.state.isAuth === true ) {
      return this.$router.push( '/' )
    }

    let conn = window.decodeURIComponent( this.$route.query.token )

    let jwt = conn.split( ':::' )[ 0 ]
    let server = localStorage.getItem( '__tempServer' )

    let url = new URL( server )
    if ( url.protocol !== "https" ) {
      this.sslProblem = true
    }

    this.$store.dispatch( 'authenticate', { server: server, token: jwt } )
      .then( ( ) => {

        this.$store.dispatch( 'getStreams', 'omit=objects,layers&isComputedResult=false&sort=updatedAt' )
        this.$store.dispatch( 'getProjects' )
        this.$store.dispatch( 'getProcessors' )
        this.$store.dispatch( 'createClient' )



        this.$router.push( '/' ) // TODO: Check redirect (?)
      } )
      .catch( err => {
        console.log( err )
        this.errorMessage = err
        this.showError = true
      } )
  }
}

</script>
<style scoped lang='scss'>
</style>
