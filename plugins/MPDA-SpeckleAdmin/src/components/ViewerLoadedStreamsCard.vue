<template>
  <v-card :class='`mb-3 ${ isExpired ? "expired" : "current"}`'>
    <v-card-text>
      <v-layout row wrap>
        <v-flex xs12>{{stream.name}}</v-flex>
        <v-flex xs12 class='caption'>
          <v-icon small>fingerprint</v-icon> {{stream.streamId}}
          <v-icon small>{{stream.private ? "lock" : "lock_open"}}</v-icon>
          last changed <timeago :datetime='stream.updatedAt'></timeago>, created on {{new Date( stream.createdAt ).toLocaleString()}}
        </v-flex>
        <v-flex xs12 class='caption' v-if='isExpired'>
          <v-divider class='my-2'></v-divider>
          This stream has expired; data was updated.
        </v-flex>
      </v-layout>
    </v-card-text>
    <v-card-actions>
      <v-btn flat small @click='$emit("remove", stream.streamId)'>remove</v-btn>
      <v-btn v-if='isExpired' small @click='refreshStream()'>refresh</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import sockette from 'sockette'

export default {
  name: 'ViewerStreamCard',
  props: {
    stream: Object
  },
  computed: {},
  data( ) {
    return {
      isExpired: false
    }
  },
  methods: {
    refreshStream( ) {
      this.isExpired = false
      this.$emit( "refresh", this.stream.streamId )
    },
    async initSocket( ) {}
  },
  async mounted( ) {
    let wsUrl = this.$store.state.server.replace( 'http', 'ws' ).replace( '/api', '' )
    if ( !this.$store.state.client )
      await this.$store.dispatch( 'createClient' )
    this.ws = new sockette( `${wsUrl}?client_id=${this.$store.state.client._id}`, {
      onopen: e => {
        this.ws.send( JSON.stringify( { eventName: "join", resourceId: this.stream.streamId, resourceType: "stream" } ) )
      },
      onmessage: e => {
        // console.log( e )
        if ( e.data === 'ping' ) {
          this.ws.send( 'alive' )
          return
        }
        let parsedMessage = JSON.parse( e.data )
        console.log( parsedMessage )
        try {
          if ( parsedMessage.args.eventType === "update-global" ) {
            this.isExpired = true
          }
        } catch ( err ) {}
      },
      onclose: e => {
        console.log( e )
      },
      onerror: e => {
        console.warn( e )
      }
    } )
  },
  destroyed( ) {
    console.log( 'stream render card destroyed ' + this.stream.name + " " + this.stream.streamId )
    this.ws.close( )
  }
}

</script>
<style scoped lang='scss'>
.current {
  border-left: 4px solid #0A66FF;
}

.expired {
  border-left: 4px solid #FF0A6D;
}

</style>
