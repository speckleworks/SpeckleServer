<template>
  <v-card class='elevation-0 pa-3'>
    <v-layout row wrap>
      <v-flex xs12 class='display-1 font-weight-light text-capitalize my-5'>
        <v-btn icon @click.native='$router.push(`/view/${stream.streamId}`)'>
          <v-icon>360</v-icon>
        </v-btn>
        <editable-span v-if='canEdit' :text='stream.name' @update='updateName'></editable-span>
        <span v-else>{{stream.name}}</span>
      </v-flex>
      <v-flex xs12 class='caption' style='line-height: 32px'>
        <v-icon small>fingerprint</v-icon>&nbsp;<strong style="user-select:all">{{stream.streamId}}</strong>&nbsp;
        <v-icon small>edit</v-icon>&nbsp;<timeago :datetime='stream.updatedAt'></timeago>&nbsp;
        <v-icon small>access_time</v-icon>&nbsp; {{createdAt}}&nbsp;
        <v-icon small>{{stream.private ? "lock" : "lock_open"}}</v-icon> link sharing {{stream.private ? "off" : "on" }} &nbsp;
        <v-icon small>person_outline</v-icon> {{ allUsers.length }} &nbsp;
        <v-icon small>history</v-icon> {{ stream.children.length }} &nbsp;
        <span class='caption font-weight-light text-uppercase'>Owned by <strong>{{owner}}</strong></span>
      </v-flex>
      <v-flex xs12 class='ma-0 pa-0 mt-3 mb-2'>
        <v-layout row align-center>
          <v-flex xs3 class='pr-4'>
            <v-text-field hint='Project Code' :mask='jnMask' v-model='stream.jobNumber' solo persistent-hint :disabled='!canEdit' @input='updateJobNumber'></v-text-field>
          </v-flex>
          <v-flex xs9>
            <v-combobox @input='updateTags' :disabled='!canEdit' v-model="stream.tags" :items='allTags' hint='add or remove tags' solo persistent-hint small-chips deletable-chips multiple tags>
              <template v-slot:no-data>
                <p>Add a new tag!</p>
              </template>
            </v-combobox>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-card>
</template>
<script>
import debounce from 'lodash.debounce'
import union from 'lodash.union'

export default {
  name: 'StreamDetailTitle',
  props: {
    stream: Object, // can be alert or info
  },
  computed: {
    jnMask( ) {
      return this.$store.state.serverManifest.jnMask || "######-##"
    },
    allTags( ) {
      return this.$store.getters.allTags
    },
    canEdit( ) {
      if (this.$store.state.user.role == 'admin') return true
      return this.isOwner ? true : this.stream.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.stream.owner === this.$store.state.user._id
    },
    streamProjects( ) {
      return this.$store.state.projects.filter( p => p.streams.indexOf( this.stream.streamId ) !== -1 )
    },
    viewLink( ) {
      let url = new URL( this.$store.state.server )
      return url.origin + `/view?streams=${this.stream.streamId}`
    },
    isOwner( ) {
      return this.stream.owner === this.$store.state.user._id
    },
    allUsers( ) {
      return union( this.stream.canRead, this.stream.canWrite )
    },
    owner( ) {
      let u = this.$store.state.users.find( user => user._id === this.stream.owner )
      if ( !u ) {
        this.$store.dispatch( 'getUser', { _id: this.stream.owner } )
      }
      return u ? u.surname.includes( "is you" ) ? `you` : `${u.name} ${u.surname}` : 'Loading'
    },
    createdAt( ) {
      let date = new Date( this.stream.createdAt )
      return date.toLocaleString( 'en', { year: 'numeric', month: 'long', day: 'numeric' } )
    },
  },
  data( ) {
    return {
      tag: null
    }
  },
  methods: {
    updateTags: debounce( function ( e ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, tags: this.stream.tags } )
    }, 1000 ),
    updateName( args ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, name: args.text } )
    },
    updateJobNumber: debounce( function ( e ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, jobNumber: this.stream.jobNumber } )
    }, 1000 )
  },
  mounted( ) {}
}

</script>
<style scoped lang='scss'>
.title-card {
  margin-left: 0;
  margin-right: 0;
}

.md-card-content:last-of-type {
  padding-bottom: 0px !important;
}

</style>
