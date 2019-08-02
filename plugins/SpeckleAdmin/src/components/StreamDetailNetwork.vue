<template>
  <md-card class='md-elevation-3' md-with-hover>
    <md-card-header class='bg-ghost-white'>
      <md-card-header-text>
        <div class="md-title">
          Source
        </div>
        <div class="md-caption">Where this stream is originating from.</div>
      </md-card-header-text>
    </md-card-header>
    <md-card-content>
      <br>
      <client-card v-for='client in senders' :key='client._id' :client='client'></client-card>
    </md-card-content>
    <md-card-header class='bg-ghost-white'>
      <md-card-header-text>
        <div class="md-title">
          Receivers
        </div>
        <div class="md-caption">Where this stream is being received.</div>
      </md-card-header-text>
    </md-card-header>
    <md-card-content>
      <br>
      <client-card v-for='client in receivers' :key='client._id' :client='client'></client-card>
      <p v-if='receivers.length===0'>There seem to be no stream receivers.</p>
    </md-card-content>
  </md-card>
</template>
<script>
import debounce from 'lodash.debounce'
import ClientCard from './ClientCard.vue'
export default {
  name: 'StreamDetailNetwork',
  components: { ClientCard },
  props: {
    stream: Object,
  },
  watch: {
    stream( newStream, oldStream ) {
      this.fetchData( )
    }
  },
  computed: {
    canEdit( ) {
      return this.isOwner ? true : this.stream.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.stream.owner === this.$store.state.user._id
    },
    senders( ) {
      if ( this.stream.onlineEditable )
        return [ {
          role: 'sender',
          documentType: '',
          documentName: 'Web UI',
          updatedAt: this.stream.updatedAt,
          owner: this.stream.owner
        } ]
      return this.$store.getters.streamClients( this.stream.streamId ).filter( c => c.role.toLowerCase( ) === 'sender' )
    },
    receivers( ) {
      return this.$store.getters.streamClients( this.stream.streamId ).filter( c => c.role.toLowerCase( ) === 'receiver' )
    },
    clients( ) {
      return this.$store.getters.streamClients( this.stream.streamId )
    }
  },
  methods: {
    fetchData( ) {
      this.$store.dispatch( 'getStreamClients', { streamId: this.stream.streamId } )
    }
  },
  created( ) {
    this.fetchData( )
  }
}

</script>
<style scoped lang='scss'>
</style>
