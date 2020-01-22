<template>
  <v-card class='elevation-0 pa-3'>
    <v-layout row wrap>
      <v-flex xs12 class='display-1 font-weight-light text-capitalize my-5'>
        <v-btn icon @click.native='$router.push(`/view/${allProjectStreams}`)'>
          <v-icon>360</v-icon>
        </v-btn>
        <!-- {{allProjectStreams}} -->
        <editable-span v-if='canEdit' :text='project.name' @update='updateName'></editable-span>
        <span v-else>{{project.name}}</span>
      </v-flex>
      <v-flex xs12 class='caption' style='line-height: 32px'>
        <v-icon small>person</v-icon> <span class='caption'>{{project.canRead.length}}</span>&nbsp;
        <v-icon small>import_export</v-icon> <span class='caption'>{{project.streams.length}}</span>&nbsp;
        <v-icon small>fingerprint</v-icon>&nbsp;<strong style="user-select:all">{{project._id}}</strong>&nbsp;
        <v-icon small>access_time</v-icon>&nbsp;<timeago :datetime='project.updatedAt'></timeago>&nbsp;
        <span class='caption font-weight-light text-uppercase'>Owned by <strong>{{owner}}</strong>. You {{canEdit ? 'can' : 'cannot'}} edit.</span>
      </v-flex>
      <v-flex xs12 class='ma-0 pa-0 mt-3 mb-2'>
        <v-layout row align-center>
          <v-flex xs3 class=''>
            <v-text-field hint='Project Code' :mask='jnMask' v-model='project.jobNumber' solo persistent-hint :disabled='!canEdit' @input='updateJobNumber'></v-text-field>
          </v-flex>
          <v-flex xs9>
            <v-combobox @input='updateTags' :disabled='!canEdit' v-model="project.tags" :items='allTags' hint='add or remove tags' solo persistent-hint small-chips deletable-chips multiple tags>
              <template v-slot:no-data>Add a new tag!</template>
            </v-combobox>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-card>
</template>
<script>
import debounce from 'lodash.debounce'
import uniq from 'lodash.uniq'

export default {
  name: 'HelloWorld',
  props: {
    project: Object
  },
  computed: {
    jnMask( ) {
      return this.$store.state.serverManifest.jnMask || "######-##"
    },
    allProjectStreams( ) {
      return this.project.streams.join( ',' )
    },
    allTags( ) {
      return this.$store.getters.allTags
    },
    canEdit( ) {
      return this.project.owner === this.$store.state.user._id || this.project.canWrite.indexOf( this.$store.state.user._id ) > -1
    },
    owner( ) {
      let u = this.$store.state.users.find( user => user._id === this.project.owner )
      if ( !u ) {
        this.$store.dispatch( 'getUser', { _id: this.project.owner } )
      }
      return u ? u.surname.includes( "is you" ) ? `you` : `${u.name} ${u.surname}` : 'Loading'
    },
    canReadProject( ) { return this.project.canRead },
    canWriteProject( ) { return this.project.canWrite },
    canReadStreams( ) { return this.project.permissions.canRead },
    canWriteStreams( ) { return this.project.permissions.canWrite },
    allUsers( ) {
      return uniq( [ ...this.canReadProject, ...this.canWriteProject, ...this.canReadStreams, ...this.canWriteProject, this.project.owner ] )
    }
  },
  data( ) { return {} },
  methods: {
    updateName( args ) {
      this.$store.dispatch( 'updateProject', { _id: this.project._id, name: args.text } )
    },
    updateTags: debounce( function ( e ) {
      this.$store.dispatch( 'updateProject', { _id: this.project._id, tags: this.project.tags } )
    }, 1000 ),
    updateJobNumber: debounce( function ( e ) {
      this.$store.dispatch( 'updateProject', { _id: this.project._id, jobNumber: this.project.jobNumber } )
    }, 1000 )
  }
}

</script>
<style scoped lang='scss'>
.title-card {
  margin-left: 0;
  margin-right: 0;
}

.project-name {
  transition: all 0.2s ease;
}

.project-name:hover {
  color: #448aff;
}

</style>
