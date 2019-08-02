<template>
  <md-card md-with-hover>
    <md-card-header class='bg-ghost-white'>
      <md-card-header-text>
        <h2 class='md-title'><md-icon>import_export</md-icon> Streams</h2>
        <p class='md-caption'>These are this project's streams. Adding a stream here will automatically grant write permission to the project's team members.<span v-if='canEdit'><br>&nbsp<md-divider></md-divider><br>You can only add streams that you have write permissions to.</span></p>
      </md-card-header-text>
    </md-card-header>
    <md-card-content class='md-layout'>
      <div class='md-layout-item md-size-100'>
        <stream-search :streams-to-omit='streams' write-only v-on:selected-stream='selectStream' v-if='canEdit'></stream-search>
      </div>
      <div class='md-layout-item md-size-100' v-if='streams.length === 0'>
        <p>This project has no streams. Add some using the form below!</p>
      </div>
      <div class='md-layout-item md-size-100' v-else>
        <stream-card-small v-for='stream in streams' :key='stream' :streamId='stream' v-on:remove-stream='removeStream' :removable='canEdit'></stream-card-small>
      </div>
    </md-card-content>
  </md-card>
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
    canEdit( ) {
      return this.project.owner === this.$store.state.user._id || this.project.canWrite.indexOf( this.$store.state.user._id ) > -1
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
