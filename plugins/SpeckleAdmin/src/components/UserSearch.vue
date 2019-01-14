<template>
  <md-card md-with-hover class='md-elevation-0 user-search'>
    <md-card-content>
    <md-field md-clearable>
      <md-icon>search</md-icon>
      <label>Search for a user to add</label>
      <md-input v-model='userSearch' @input='startSearchUsers'></md-input>
    </md-field>
    <md-progress-bar md-mode="indeterminate" :md-diameter='20' :md-stroke='2' v-show='searchInProgress'></md-progress-bar>
    <div class='md-layout xxxsearch-results xxxmd-elevation-1'>
      <md-chip md-clickable class='md-primary' style='margin: 3px;' v-for='user in foundUsers' :key='user._id' v-if='userSearch!==null && foundUsers.length > 0' @click='selectUser(user._id)'>
        {{user.name}} {{user.surname}} <span v-if='user.company' class='md-caption'>({{user.company}})</span>
      </md-chip>
      <div v-if='foundUsers.length === 0 && userSearch!=="" && !searchInProgress' class='md-caption'>
        No users found. Try a different search!
      </div>
    </div>
  </md-card-content>
  </md-card>
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
      if ( searchString === '' ) {
        this.foundUsers = [ ]
        this.searchInProgress = false
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
.user-search {
  border-radius: 10px;
  @media only screen and (max-width: 600px) {
    margin: 0 !important;
  }
}
.search-results {
  position: absolute;
  background-color: white;
  z-index: 40;
  padding: 10px;
  box-sizing: border-box;
}
.user-list {
  margin-bottom: 5px;
  padding: 5px;
}

.user-list:hover {
  background-color: #F4F4F4;
  cursor: pointer;
}

</style>
