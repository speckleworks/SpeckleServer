<template>
  <v-card class='elevation-0'>
    <stream-search :streams-to-omit='streams' write-only v-on:selected-stream='selectStream' v-if='canEdit'></stream-search>
    <v-card-text class='md-layout-item md-size-100' v-if='streams.length === 0'>
      <p v-if='canEdit'>This project has no streams. Add some using the form above!</p>
      <p v-else>This project has no streams.</p>
    </v-card-text>
    <v-card-text v-else class='pa-0'>
      <v-list two-line>
        <v-list-tile v-for='stream in populatedStreams' :key='stream.streamId'>
          <v-list-tile-content>
            <v-list-tile-title>
              <span class='caption'>
                <v-icon small>fingerprint</v-icon> {{stream.streamId}}
                &nbsp;<v-icon small>{{stream.private ? "lock" : "lock_open"}}</v-icon>
              </span>&nbsp;
              <span class='text-capitalize'>{{stream.name}}</span>&nbsp;<router-link :to='"/streams/" + stream.streamId'><v-icon small>open_in_new</v-icon></router-link>
            </v-list-tile-title>
            <v-list-tile-sub-title class='xxx-font-weight-thin caption'>
              last changed <timeago :datetime='stream.updatedAt'></timeago>, created on {{new Date( stream.createdAt ).toLocaleString()}}
            </v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn :disabled='!canEdit' small icon @click.stop.native='removeStream(stream.streamId)'><v-icon>close</v-icon></v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
      </v-list>
      <!-- <stream-card-small v-for='stream in streams' :key='stream' :streamId='stream' v-on:remove-stream='removeStream' :removable='canEdit'></stream-card-small> -->
    </v-card-text>
  </v-card>
</template>
<script>
import debounce from 'lodash.debounce'
import StreamCardSmall from './StreamCardSmall.vue'
import StreamSearch from './StreamSearch.vue'

export default {
  name: 'ProjectStreams',
  components: {
    StreamCardSmall,
    StreamSearch
  },
  props: {
    project: Object,
  },
  computed: {
    streams( ) { return this.project.streams ? this.project.streams : [ ] },
    populatedStreams( ) {
      return this.$store.state.streams.filter( stream => this.streams.indexOf( stream.streamId ) !== -1 )
    },
    canEdit( ) {
      return this.project.owner === this.$store.state.user._id || this.project.canWrite.indexOf( this.$store.state.user._id ) > -1 || this.$store.state.user.role === 'admin'
    },
  },
  watch: {},
  data( ) {
    return {}
  },
  methods: {
    selectStream( streamId ) {
      // just bubble it up
      this.$emit( 'selected-stream', streamId )
    },
    removeStream( streamId ) {
      // just bubble it up
      this.$emit( 'remove-stream', streamId )
    }
  }
}

</script>
<style scoped lang='scss'>
</style>
