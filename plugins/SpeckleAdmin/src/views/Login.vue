<template>
  <md-content class='md-layout md-alignment-center-center' style="min-height: 100%">
    <form class="md-layout-item md-size-33 md-small-size-100 md-medium-size-50" @submit.prevent='login' v-if='$store.state.isAuth === false'>
      <md-card class="md-elevation-3">
        <md-card-header>
          <md-card-header-text>
            <div class="md-title">Login</div>
            <div class="md-caption">
            <span v-if='$store.state.serverManifest'>at <strong><a :href='$store.state.server' target="_blank">{{$store.state.serverManifest.serverName}}</a></strong>.</span>
            Do you want to <router-link to='/register'>register</router-link>?</div>
          </md-card-header-text>
        </md-card-header>
        <md-card-content>
          <md-field>
            <md-icon>{{serverOk ? "check" : "chevron_right"}}</md-icon>
            <label>Server API address</label>
            <md-input type="url" v-model='server' name='server' @blur='checkServer'></md-input>
          </md-field>
          <md-field>
            <label>Email adress</label>
            <md-input type="email" v-model='email' name='email'></md-input>
          </md-field>
          <md-field>
            <label>Password</label>
            <md-input v-model='password' type="password" name='password'></md-input>
          </md-field>
        </md-card-content>
        <md-card-actions v-if='!$store.state.isAuth'>
          <md-button type="submit" class="md-primary md-raised">Login</md-button>
        </md-card-actions>
        <br>
        <speckle-alert type='error' v-on:closed='showError=false' v-show='showError'>
          {{errorMessage}}
        </speckle-alert>
      </md-card>
    </form>
    <md-card class="md-elevation-3" v-else>
      <md-card-content>
        You are already logged in.
      </md-card-content>
    </md-card>
  </md-content>
</template>
<script>
import Axios from 'axios'
import SpeckleAlert from '../components/SpeckleAlert.vue'

export default {
  name: 'LoginView',
  components: {
    SpeckleAlert
  },
  computed: {},
  watch: {
  },
  data( ) {
    return {
      server: null,
      email: null,
      password: null,
      errorMessage: null,
      showError: false,
      serverOk: false
    }
  },
  methods: {
    login( ) {
      this.$store.dispatch( 'login', { email: this.email, password: this.password } )
        .then( res => {
          console.log( 'Logged in.' )
          this.$store.dispatch( 'getStreams', 'omit=objects,layers&isComputedResult=false&deleted=false&sort=-lastModified' )
          this.$store.dispatch( 'getProjects' )
          if ( this.$route.params.redirectTo !== null && this.$route.params.redirectTo !== undefined ) {
            let redirectTo = atob( this.$route.params.redirectTo )
            this.$router.push( redirectTo )
            this.password = null
          } else
            this.$router.push( '/' )
        } )
        .catch( err => {
          console.log( err )
          this.errorMessage = `Failed to log in.`
          this.showError = true
        } )
    },
    checkServer( ) {
      if ( !this.server.includes( 'api' ) )
        this.server += '/api'
      Axios.get( this.server )
        .then( res => {
          if ( !res.data.hasOwnProperty( 'serverName' ) )
            throw new Error( 'Failed to get server.' )
          this.serverOk = true
          this.errorMessage = ``
          this.showError = false
          this.$store.commit( 'SET_SERVER', this.server )
          this.$store.commit( 'SET_SERVER_DETAILS', res.data )
          localStorage.setItem( 'server', this.server )
          Axios.defaults.baseURL = this.server
        } )
        .catch( err => {
          this.serverOk = false
          this.errorMessage = `Server url is incorrect.`
          this.showError = true
        } )
    }
  },
  mounted( ) {
    if ( this.$store.state.server ) {
      this.server = this.$store.state.server
      this.checkServer( )
    } else {
      this.server = `${window.location.origin}/api`
      this.checkServer( )
    }
    if ( this.$store.state.isAuth === true ) {
      this.$router.push( '/' )
      // this.errorMessage = 'You are already logged in!'
      // this.showError = true
    }
  }
}

</script>
<style scoped lang='scss'>
</style>
