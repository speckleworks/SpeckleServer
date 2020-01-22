<template>
  <v-card class='elevation-0'>
    <v-toolbar class='elevation-0 transparent'>
      <v-icon small left>share</v-icon>&nbsp;
      <span class='title font-weight-light'>Link Sharing</span> &nbsp;
    </v-toolbar>
    <v-divider></v-divider>
    <v-card-text class='mx-2'>
      <v-btn depressed color='primary' @click.native='changeLinkSharing' :disabled='!canEdit'>{{stream.private ? "OFF" : "ON"}}</v-btn>
      {{ stream.private ? "Private resource. Only people with read or write persmissions can access it." : "Public resource. Anyone with the id can access it."}}
      <span class='' v-if='isOwner'>
        You are the <strong>owner</strong> of this stream.
      </span>
      <span class='' v-else>
        This stream was shared with you by <strong>{{streamOwner}}.</strong>
      </span>
    </v-card-text>
    <!-- <v-divider></v-divider> -->
    <v-toolbar class='elevation-0 transparent title font-weight-light'>
      <v-icon small left>supervisor_account</v-icon>&nbsp;
      <span class='title font-weight-light'>User Permissions</span> &nbsp;
    </v-toolbar>
    <v-card-text class='mx-2' v-if='streamProjects.length>0'>
      <span>Some users might be disabled as their permissions are set through the following projects: <router-link v-for='(proj, index) in streamProjects' :to='"/projects/"+proj._id' :key='proj._id'>{{proj.name}}<span v-if='index<streamProjects.length-1'>, </span></router-link></span>
    </v-card-text>
    <v-card-text class='mx-2' v-if='!canEdit'>
      You cannot edit the permissions of this stream.
    </v-card-text>
    <v-divider></v-divider>
    <v-card-text class='' v-if='canEdit'>
      <user-search v-on:selected-user='addUserToWrite'></user-search>
      <permission-table :resource='stream' :disabled-users='usersFromProjects' :global-disabled='!canEdit' v-on:update-table='updatePerms'></permission-table>
    </v-card-text>
  </v-card>
</template>
<script>
import debounce from 'lodash.debounce'
import uniq from 'lodash.uniq'
import Axios from 'axios'

import UserSearch from './UserSearch.vue'
import PermissionTable from './PermissionTable.vue'

export default {
  name: 'StreamDetailUserPerms',
  components: {
    UserSearch,
    PermissionTable
  },
  props: {
    stream: Object
  },
  computed: {
    streamOwner( ) {
      if ( this.isOwner ) return `${this.$store.state.user.name} ${this.$store.state.user.surname}`
      let owner = this.$store.state.users.find( user => user._id === this.stream.owner )
      if ( !owner ) return '(loading)'
      return `${owner.name} ${owner.surname} ${owner.company ? "(" + owner.company + ")" : ''}`
    },
    canEdit( ) {
      if (this.$store.state.user.role == 'admin') return true
      return this.isOwner ? true : this.stream.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.stream.owner === this.$store.state.user._id
    },
    usersFromProjects( ) {
      let otherProjects = this.$store.state.projects.filter( p => p.streams.indexOf( this.stream.streamId ) !== -1 )
      let otherCanRead = Array.prototype.concat( ...otherProjects.map( op => op.permissions.canRead ) )
      let otherCanWrite = Array.prototype.concat( ...otherProjects.map( op => op.permissions.canWrite ) )
      return [ ...new Set( [ ...otherCanWrite, ...otherCanRead ] ) ]
    },
    streamProjects( ) {
      return this.$store.state.projects.filter( p => p.streams.indexOf( this.stream.streamId ) !== -1 )
    }

  },
  data( ) {
    return {
      userSearch: '',
      foundUsers: [ ],
      searchInProgress: false
    }
  },
  methods: {
    changeLinkSharing( ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, private: !this.stream.private } )
    },
    addUserToWrite( userId ) {
      let canWrite = uniq( [ ...this.stream.canWrite, userId ] )
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, canWrite: canWrite } )
    },
    updatePerms( { canRead, canWrite } ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, canRead: canRead, canWrite: canWrite } )
    }
  }
}

</script>
<style scoped lang='scss'>
</style>
