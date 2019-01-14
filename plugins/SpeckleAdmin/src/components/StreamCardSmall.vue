<template>
  <md-card class='md-elevation-0' style='margin-bottom: 5px;' v-if='stream'>
    <md-card-content class='md-layout md-gutter md-alignment-center-left'>
      <div class="md-layout-item md-size-30">
        <router-link :to='"/streams/"+stream.streamId'>{{stream.name}}</router-link>
      </div>
      <div class="md-layout-item md-caption">
        <span v-if='stream.commitMessage'> {{stream.commitMessage}}</span>
      </div>
      <div class="md-layout-item md-caption text-right">
        {{stream.streamId}} | last update <strong><timeago :datetime='stream.updatedAt'></timeago></strong>
      </div>
      <div class="md-layout-item text-right" v-if='removable'>
        <md-button class='md-dense-xxx md-icon-button md-accent' @click.native='$emit("remove-stream", streamId)'>
          <md-icon>delete</md-icon>
        </md-button>
      </div>
    </md-card-content>
  </md-card>
</template>
<script>
export default {
  name: 'StreamCardSmall',
  props: {
    streamId: String,
    removable: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    stream( ) {
      let stream = this.$store.state.streams.find( s => s.streamId === this.streamId )
      if ( !stream ) this.$store.dispatch( 'getStream', { streamId: this.streamId } )
      return stream
    }
  },
  data( ) { return {} },
  methods: {}
}

</script>
<style scoped lang='scss'>
</style>
