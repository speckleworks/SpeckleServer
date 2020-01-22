<template>
  <v-layout row wrap>
    <v-flex xs12>
      <detail-description :resource='stream'></detail-description>
      <stream-detail-network :stream='stream'></stream-detail-network>
      <v-card class='elevation-0 pt-4'>
        <v-toolbar dense class='elevation-0 transparent'>
          <v-icon small left>business</v-icon>&nbsp;
          <span class='title font-weight-light'>Projects</span>
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
          <v-chip v-for='(proj, index) in streamProjects' :key='proj._id' class='md-primary' md-clickable>
            <router-link :to='"/projects/"+proj._id'>{{proj.name}}</router-link>&nbsp;
          </v-chip></span>
          <p v-if='streamProjects.length===0'>This stream is not part of any projects.</p>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import debounce from 'lodash.debounce'
import union from 'lodash.union'

import StreamDetailTitle from '../components/StreamDetailTitle.vue'
import DetailDescription from '../components/DetailDescription.vue'
import StreamDetailNetwork from '../components/StreamDetailNetwork.vue'
import StreamDetailComments from '../components/StreamDetailComments.vue'

export default {
  name: 'StreamDetailView',
  components: {
    StreamDetailTitle,
    DetailDescription,
    StreamDetailNetwork,
    StreamDetailComments
  },
  computed: {
    stream( ) {
      let stream = this.$store.state.streams.find( s => s.streamId === this.$route.params.streamId )
      return stream
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
    }
  },
  data( ) {
    return {
      error: '',
      editDescription: false
    }
  },
  methods: {
    restore( ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, deleted: false } )
    },
  },
  mounted( ) {
    let stream = this.$store.state.streams.find( s => s.streamId === this.$route.params.streamId )
    if ( !stream ) {
      this.$store.dispatch( 'getStream', { streamId: this.$route.params.streamId } )
        .then( res => {
          this.$store.dispatch( 'getUser', { _id: res.data.resource.owner } )
          union( res.data.resource.canRead, res.data.resource.canWrite ).forEach( _id => this.$store.dispatch( 'getUser', { _id: _id } ) )
        } )
        .catch( err => {
          if ( err.message.includes( '404' ) ) this.error = `Stream ${this.$route.params.streamId} was not found.`
          if ( err.message.includes( '401' ) ) this.error = `Stream ${this.$route.params.streamId} is not accessible to you due to its protection level.`
        } )
    } else {
      this.$store.dispatch( 'getUser', { _id: stream.owner } )
      union( stream.canRead, stream.canWrite ).forEach( _id => this.$store.dispatch( 'getUser', { _id: _id } ) )
    }
  }
}

</script>
<style scoped lang='scss'>
</style>
