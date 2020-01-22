<template>
  <v-container grid-list-xl v-if='project'>
    <v-toolbar absolute v-if='project.deleted'>
      <span>This project is in your trashbin. </span>
      <v-spacer></v-spacer>
      <v-btn color='primary' v-if='canEdit' @click.native='restore'> Restore? </v-btn>
    </v-toolbar>
    <v-layout row wrap class='mb-3'>
      <v-flex xs12>
        <project-detail-title :project='project'></project-detail-title>
      </v-flex>
      <v-flex xs12>
        <detail-description :resource='project'></detail-description>
      </v-flex>
      <v-flex xs12 sm12 lg12>
        <v-card class='elevation-0'>
          <v-card-title class='title font-weight-light'>
            <v-icon small left>supervisor_account</v-icon>&nbsp;
            Users
          </v-card-title>
          <v-card-text>
            <user-search v-on:selected-user='addUserToTeam' v-if='canEdit'></user-search>
            <permission-table :project='project' :global-disabled='!canEdit' @remove-user='' @move-user=''></permission-table>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 sm12 lg12>
        <v-card  class='elevation-0'>
          <v-card-title class='title font-weight-light'>
            <v-icon small left>import_export</v-icon>&nbsp;
            Streams
          </v-card-title>
          <v-card-text>
            <project-detail-streams :project='project' v-on:selected-stream='addStream' v-on:remove-stream='removeStream'></project-detail-streams>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12>
        <client-graph :project='project'></client-graph>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import union from 'lodash.union'
import uniq from 'lodash.uniq'

import UserSearch from '../components/UserSearch.vue'
import PermissionTable from '../components/PermissionTableProject.vue'
import DetailDescription from '../components/DetailDescription.vue'
import ProjectDetailStreams from '../components/ProjectDetailStreams.vue'
import ProjectDetailTitle from '../components/ProjectDetailTitle.vue'
import ClientGraph from '../components/ClientGraph.vue'

export default {
  name: 'ProjectDetailView',
  components: {
    UserSearch,
    PermissionTable,
    DetailDescription,
    ProjectDetailStreams,
    ProjectDetailTitle,
    ClientGraph
  },
  props: {},
  computed: {
    canEdit( ) {
      return this.project.owner === this.$store.state.user._id || this.project.canWrite.indexOf( this.$store.state.user._id ) > -1 || this.$store.state.user.role === 'admin'
    },
    project( ) {
      return this.$store.state.projects.find( p => p._id === this.$route.params.projectId )
    },
    canReadProject( ) { return this.project.canRead },
    canWriteProject( ) { return this.project.canWrite },
    canReadStreams( ) { return this.project.permissions.canRead },
    canWriteStreams( ) { return this.project.permissions.canWrite },
    allUsers( ) {
      return uniq( [ ...this.canReadProject, ...this.canWriteProject, ...this.canReadStreams, ...this.canWriteProject, this.project.owner ] )
    }
  },
  data( ) {
    return {}
  },
  methods: {
    restore( ) {
      this.$store.dispatch( 'updateProject', { _id: this.project._id, deleted: false } )
    },
    addUserToTeam( userId ) {
      this.$store.dispatch( 'addUserToProject', { projectId: this.project._id, userId: userId } )
      return
    },
    addStream( streamId ) {
      this.$store.dispatch( 'addStreamToProject', { projectId: this.project._id, streamId: streamId } )
      return
    },
    removeStream( streamId ) {
      this.$store.dispatch( 'removeStreamFromProject', { projectId: this.project._id, streamId: streamId } )
    },
  },
  mounted( ) {
    let project = this.$store.state.projects.find( p => p._id === this.$route.params.projectId )
    if ( !project ) {
      this.$store.dispatch( 'getProject', { _id: this.$route.params.projectId } )
        .then( res => {
          this.$store.dispatch( 'getUser', { _id: res.data.resource.owner } )
          union( res.data.resource.canRead, res.data.resource.canWrite ).forEach( _id => this.$store.dispatch( 'getUser', { _id: _id } ) )
        } )
        .catch( err => {
          if ( this.$store.state.isAuth ) {
            this.$router.push( '/projects' )
            console.log( "you don't have permission." )
          } else {
            console.log( "should redirect to login" )
            this.$router.push( '/login' )
          }
          console.log( err )
        } )
    } else {
      this.$store.dispatch( 'getUser', { _id: project.owner } )
      union( project.canRead, project.canWrite ).forEach( _id => this.$store.dispatch( 'getUser', { _id: _id } ) )
    }
  }
}

</script>
<style scoped lang='scss'>
.detail-card {
  margin-bottom: 20px;
}

</style>
