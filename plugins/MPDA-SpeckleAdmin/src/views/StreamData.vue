<template>
  <v-layout row wrap>
    <v-flex xs12 v-if='!onlineEditable'>
      <v-alert type='warning' :value="!onlineEditable">
        This stream is not marked as online editable.
      </v-alert>
    </v-flex>
    <v-flex xs12>
      <v-progress-linear :indeterminate="true" v-if='isGettingStreamData'></v-progress-linear>
    </v-flex>
    <v-flex xs12>
      <v-card class='elevation-0 pt-4'>
        <v-toolbar dense class='elevation-0 transparent'>
          <v-icon small left>business</v-icon>&nbsp;
          <span class='title font-weight-light'>Data</span>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn depressed small flat @click.native='showImportCSVDialog = true' :disabled='!onlineEditable'>
              <v-icon>cloud_upload</v-icon>
              &nbsp;&nbsp;Import CSV
            </v-btn>
            <v-btn color='primary' small depressed @click.native='preSaveData()' :disabled='!changed || !onlineEditable'>
              save
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-layout row wrap>
            <v-flex xs12>
              <stream-layer v-for='layer in mergedLayers' :key='layer.guid' :layer='layer' @update='updateLayer' @remove='removeLayer'>
              </stream-layer>
            </v-flex>
            <v-flex xs12>
              <v-btn block @click.native='addLayer' :disabled='!onlineEditable'>
                <v-icon>add</v-icon>
                add a layer
              </v-btn>
            </v-flex>
            <v-flex xs12>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-flex>
    <v-dialog v-model="showSaveDialog" width="500">
      <v-card>
        <v-card-title class="headline" primary-title>
          Commit message
        </v-card-title>
        <v-card-text>
          <p>Write a short description of the reasons behind the changes you just made.</p>
          <v-text-field box v-model='commitMessage'></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click='showSaveDialog=false'>
            cancel
          </v-btn>
          <v-btn color="primary" @click="saveData()" :loading='isLoading' :disabled='isLoading'>
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- CSV -->
    <v-dialog v-model='showImportCSVDialog' width="500">
      <v-card>
        <v-card-title class="headline" primary-title>
          CSV Import
        </v-card-title>
        <v-card-text>
          <p>Paste your csv below.</p>
          <p class='md-caption'>We assume the first row will contain the column names. Each column will become a separate "output port" or layer.</p>
          <v-textarea box style="height: 150px;width:100%" v-model='csvInput'></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click='closeCsvDialog()'>Cancel</v-btn>
          <v-btn color="primary" @click='importCSV()' :loading='isLoading' :disabled='isLoading'>Import CSV</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import debounce from 'lodash.debounce'
import union from 'lodash.union'
import Axios from 'axios'
import uuid from 'uuid/v4'
import papa from 'papaparse'

import StreamLayer from '../components/StreamLayer.vue'

export default {
  name: 'StreamEditView',
  components: {
    StreamLayer
  },
  watch: {
    stream( newStream, oldStream ) {
      this.fetchData( newStream.streamId )
    }
  },
  computed: {
    // fed to the stream layers component
    mergedLayers( ) {
      if ( !this.deStream ) return [ ]
      let mergedLayers = [ ]
      this.deStream.layers.forEach( l => {
        mergedLayers.push( {
          name: l.name,
          isArray: true,
          startIndex: l.startIndex,
          objectCount: l.objectCount,
          guid: l.guid,
          topology: l.topology,
          objects: this.deStream.objects.slice( l.startIndex, l.startIndex + l.objectCount ).map( o => o.value.toString( ) )
        } )
      } )
      return mergedLayers
    },
    deStream( ) {
      return this.$store.state.deStreams.find( s => s.streamId === this.$route.params.streamId )
    },
    stream( ) {
      return this.$store.state.streams.find( s => s.streamId === this.$route.params.streamId )
    },
    canEdit( ) {
      return this.isOwner ? true : this.stream.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.stream.owner === this.$store.state.user._id
    },
    onlineEditable( ) {
      return this.stream.onlineEditable ? this.stream.onlineEditable : false
    }
  },
  data( ) {
    return {
      changed: false,
      showSaveDialog: false,
      commitMessage: 'no message',
      showImportCSVDialog: false,
      csvInput: '',
      isLoading: false,
      isGettingStreamData: false,
    }
  },
  methods: {
    updateLayer( { layer, objects } ) {
      this.$store.commit( 'UPDATE_DE_STREAM_LAYER', { streamId: this.stream.streamId, layer, objects } )
      this.changed = true
    },
    addLayer( ) {
      this.$store.commit( 'ADD_DE_STREAM_LAYER', { streamId: this.stream.streamId } )
      this.changed = true
    },
    removeLayer( layer ) {
      this.$store.commit( 'REMOVE_DE_STREAM_LAYER', { streamId: this.stream.streamId, layer: layer } )
      this.changed = true
    },
    preSaveData( ) {
      this.showSaveDialog = true
    },
    saveData( ) {
      this.isLoading = true
      this.$store.dispatch( 'updateStreamObjectsAndLayers', { streamId: this.stream.streamId, commitMessage: this.commitMessage } )
        .then( res => {
          this.showSaveDialog = false
          this.commitMessage = 'no message'
          this.changed = false
          this.isLoading = false
          console.log( res )
        } )
        .catch( err => {
          // TODO: handle error
          this.isLoading = false
          console.error( err )
        } )
    },
    fetchData( streamId ) {
      if(!this.onlineEditable) return
      console.log( `fetching data for ${streamId}` )
      this.isGettingStreamData = true
      Axios.get( `streams/${streamId}?fields=layers` )
        .then( res => {
          this.layers = res.data.resource.layers
          console.log( this.layers )
          return Axios.get( `streams/${streamId}/objects?fields=type,value` )
        } )
        .then( res => {
          this.objects = res.data.resources
          this.$store.commit( 'ADD_DE_STREAM', { streamId: streamId, layers: this.layers, objects: this.objects } )
          this.isGettingStreamData = false

          console.log( res )
        } )
        .catch( err => {
          this.isGettingStreamData = false
          // TODO: Handle error
          console.error( err )
        } )
    },
    importCSV( ) {
      this.isLoading = true
      let results = papa.parse( this.csvInput, { dynamicTyping: false } )
      // console.log( results )
      let transposed = results.data[ 0 ].map( ( x, i ) => results.data.map( x => x[ i ] ) )
      // console.log( transposed )
      this.$store.commit( 'APPEND_DE_STREAM_LAYERS_FROM_CSV', { streamId: this.stream.streamId, transposed } )
      this.showImportCSVDialog = false
      this.csvInput = ''
      this.changed = true
      this.isLoading = false
    },
    closeCsvDialog( ) {
      this.showImportCSVDialog = false
      this.csvInput = ''
    }
  },
  mounted( ) {
    console.log( 'hello data' )
    let stream = this.$store.state.streams.find( s => s.streamId === this.$route.params.streamId )
    this.fetchData( this.$route.params.streamId )
  }
}

</script>
<style scoped lang='scss'>
.detail-card {
  margin-bottom: 20px;
}

.md-content {
  padding: 30px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.md-card-content {
  padding: 0;
}

a:hover {
  cursor: pointer;
}

</style>
