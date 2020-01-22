<template>
  <v-container grid-list-sm v-if='allUsersPop.length > 0 && project' class='pa-0 ma-0'>
    <v-layout row wrap>
      <v-flex xs12 v-if='!canEdit'>You cannot add users to this project.</v-flex>
      <v-flex xs12 v-for='user in allUsersPop' v-if='user' :key='user._id'>
        <user-perm-card
        @change-permission-streams='changePermissionStreams'
        @change-permission-project='changePermissionProject'
        @remove-user='removeUser'
        :user='user' :project='project' :global-disabled='globalDisabled'></user-perm-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import union from 'lodash.union'
import uniq from 'lodash.uniq'

import UserPermCard from '@/components/UserPermissionProjectCard.vue'

export default {
  name: 'PermissionTable',
  components: {
    UserPermCard
  },
  props: {
    project: Object,
    globalDisabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    canEdit( ) {
      return this.project.owner === this.$store.state.user._id || this.project.canWrite.indexOf( this.$store.state.user._id ) > -1 || this.$store.state.user.role === 'admin'
    },
    canReadProject( ) { return this.project.canRead },
    canWriteProject( ) { return this.project.canWrite },
    canReadStreams( ) { return this.project.permissions.canRead },
    canWriteStreams( ) { return this.project.permissions.canWrite },
    allUsers( ) {
      return uniq( [ ...this.canReadProject, ...this.canWriteProject, ...this.canReadStreams, ...this.canWriteProject, this.project.owner ] )
    },
    allUsersPop( ) {
      if ( this.allUsers.length === 0 ) return [ ]
      return this.allUsers.map( userId => {
        let u = this.$store.state.users.find( user => user._id === userId )
        if ( !u ) this.$store.dispatch( 'getUser', { _id: userId } )
        if ( u ) u.isOwner = u._id === this.project.owner
        return u
      } ) //.sort( ( a, b ) => a.name > b.name ? 1 : -1 )
    }
  },
  data( ) {
    return {}
  },
  methods: {
    hasWritePermissionStreams( _id ) {
      return this.canWriteStreams.indexOf( _id ) > -1
    },
    hasWritePermissionProject( _id ) {
      return this.canWriteProject.indexOf( _id ) > -1
    },
    changePermissionProject( userId ) {
      let canWrite = this.project.canWrite.indexOf( userId ) > -1 ? true : false
      let localCanWrite = [ ],
        localCanRead = [ ],
        streamCanWrite = this.project.permissions.canWrite,
        streamCanRead = this.project.permissions.canRead

      if ( canWrite ) {
        localCanWrite = this.project.canWrite.filter( uId => uId !== userId )
        localCanRead = uniq( [ ...this.project.canRead, userId ] )
      } else {
        localCanRead = this.project.canRead
        localCanWrite = uniq( [ ...this.project.canWrite, userId ] )
        // TODO: UPGRADE STREAMS CANWRITE TOO (otherwise user x can edit the project but not do much)
        streamCanWrite = uniq( [ ...streamCanWrite, userId ] )
        this.upgradeUser( userId )
      }
      this.$store.dispatch( 'updateProject', { _id: this.project._id, permissions: { canRead: streamCanRead, canWrite: streamCanWrite }, canRead: localCanRead, canWrite: localCanWrite } )
    },
    changePermissionStreams( userId ) {
      let hasWritePermission = this.project.permissions.canWrite.indexOf( userId ) > -1 ? true : false
      if ( !hasWritePermission ) this.upgradeUser( userId )
      else this.downgradeUser( userId )
    },
    upgradeUser( userId ) {
      this.$store.dispatch( 'upgradeUserInProject', { projectId: this.project._id, userId: userId } )
    },
    downgradeUser( userId ) {
      this.$store.dispatch( 'downgradeUserInProject', { projectId: this.project._id, userId: userId } )
    },
    removeUser( userId ) {
      this.$store.dispatch( 'removeUserInProject', { projectId: this.project._id, userId: userId } )
    }
  },
  mounted( ) {}
}

</script>
<style scoped lang='scss'>
.user {
  padding: 2px 10px;
}

</style>
