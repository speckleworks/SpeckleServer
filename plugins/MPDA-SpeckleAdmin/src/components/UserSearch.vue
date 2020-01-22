<template>
  <v-layout align-center row wrap>
    <v-flex xs12 class='pb-0'>
      <v-text-field box label='search for users' clearable v-model='userSearch' flat :loading='searchInProgress' prepend-inner-icon="search" @input='startSearchUsers'></v-text-field>
    </v-flex>
    <v-flex xs12 style='margin-top:-30px' class='mb-5' v-if='userSearch!==null && foundUsers.length > 0'>
      <v-card class='elevation-10'>
        <v-card-title class='subheading' v-if='userSearch'>Search results ({{foundUsers.length}} users)</v-card-title>
        <v-divider></v-divider>
        <v-card-text style='max-height: 410px; overflow-y: auto; overflow-x: hidden;' v-if='foundUsers.length>0'>
          <v-list two-line xxxv-if='filters.length > 0'>
            <v-list-tile v-for='user in foundUsers' :key='user._id'>
              <v-list-tile-content>
                <v-list-tile-title>
                  {{user.name}} {{user.surname}}
                </v-list-tile-title>
                <v-list-tile-sub-title class='caption'>
                  <span class='caption'>{{user.company}}</span>
                </v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn fab small depressed @click.native='selectUser(user._id)'>
                  <v-icon>add</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import debounce from 'lodash.debounce'
import Axios from 'axios'

export default {
  name: 'UserSearch',
  props: {
    msg: String
  },
  data( ) {
    return {
      userSearch: '',
      foundUsers: [ ],
      searchInProgress: false
    }
  },
  watch: {
    userSearch( newVal, oldVal ) {
      if ( newVal === '' ) {
        this.foundUsers = [ ]
        this.searchInProgress = false
      }
    }
  },
  methods: {
    selectUser( userId ) {
      this.$emit( 'selected-user', userId )
      let index = this.foundUsers.findIndex( u => u._id === userId )
      this.foundUsers.splice( index, 1 )
    },
    startSearchUsers( ) {
      this.searchInProgress = true
      this.searchUsers( this.userSearch )
    },
    searchUsers: debounce( function( searchString ) {
      if ( searchString === '' || searchString === null ) {
        this.foundUsers = [ ]
        this.searchInProgress = false
        return
      }
      if ( searchString.length < 3 ) {
        // TODO: Show an error
        return
      }
      Axios.post( '/accounts/search', { searchString: searchString } )
        .then( res => {
          console.log( res )
          this.foundUsers = res.data.resources
          // build up a db of users
          if ( res.data.resources.length > 0 )
            this.$store.commit( 'ADD_USERS', res.data.resources )
          this.searchInProgress = false
        } )
        .catch( err => {
          this.foundUsers = [ ]
          this.searchInProgress = false
        } )
    }, 1500 )
  }
}

</script>
<style scoped lang='scss'>
.hovered {
  cursor: pointer;
}
</style>
