<template>
  <v-card :class="{'elevation-10':selected, 'elevation-1': true}" :style="`opacity:${isOwner ? 1 : 0.20 };pointer-events:${isOwner ? 'all' : 'none'};`">
    <v-card-title>
      <v-icon left>{{resourceType==='stream'?'import_export':'business'}}</v-icon>&nbsp;
      <span class='title font-weight-light'>{{resource.name ? resource.name : "No Name"}}</span>&nbsp;
      <span class='caption'>({{resourceType}})</span>&nbsp;
      <v-spacer></v-spacer>
      <span></span>
      <span>
        <v-checkbox color='primary' v-model="selected"></v-checkbox>
      </span>
    </v-card-title>
    <v-divider class='mx-0 my-0'></v-divider>
    <v-layout row wrap>
      <v-flex xs12 class='caption' ma-2>
        <v-icon small>edit</v-icon>&nbsp;<timeago :datetime='resource.updatedAt'></timeago>&nbsp;
        <v-icon small>access_time</v-icon>&nbsp; {{createdAt}}&nbsp;
      </v-flex>
    </v-layout>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn depressed flat color='error' class='transparent' @click.native='deleteForever()' v-show='isOwner'>Delete Permanently</v-btn>
      <v-btn color='primary' @click.native='restore()'>Restore</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import debounce from 'lodash.debounce'
import uniq from 'lodash.uniq'
import union from 'lodash.union'
import marked from 'marked'

export default {
  name: 'ProjectCard',
  props: {
    resource: Object
  },
  watch: {
    selected( ) { this.$emit( "selected", this.resource ) }
  },
  computed: {
    project( ) {
      return this.resource
    },
    createdAt( ) {
      let date = new Date( this.project.createdAt )
      return date.toLocaleString( 'en', { year: 'numeric', month: 'long', day: 'numeric' } )
    },
    canEdit( ) {
      return this.isOwner ? true : this.project.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.project.owner === this.$store.state.user._id
    },
    resourceType( ) {
      if ( this.resource.streamId )
        return 'stream'
      else
        return 'project'
    }
  },
  data( ) {
    return {
      selected: false,
    }
  },
  methods: {
    deleteForever( ) {
      if ( this.resource.streamId )
        this.$store.dispatch( 'deleteStream', { streamId: this.resource.streamId } )
      else
        this.$store.dispatch( 'deleteProject', { _id: this.resource._id } )
    },
    restore( ) {
      if ( this.resource.streamId )
        this.$store.dispatch( 'updateStream', { streamId: this.resource.streamId, deleted: false } )
      else
        this.$store.dispatch( 'updateProject', { _id: this.resource._id, deleted: false } )
    }
  },
  mounted( ) {
    // TODO: caca
    bus.$on( 'select-resource', id => {
      if ( id === this.resource._id ) this.selected = true
    } )
    bus.$on( 'unselect-all-resources', ( ) => {
      this.selected = false
    } )
  }
}

</script>
<style scoped lang='scss'>
</style>
