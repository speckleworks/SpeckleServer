<template>
  <div>
    <md-card class='md-elevation-3' md-with-hover>
      <md-card-header class='bg-ghost-white'>
        <md-card-header-text>
          <div class="md-title">Data</div>
          <div class="md-caption">Add/remove data below. Strings, numbers and booleans are supported. Changes will not be saved automatically until you click "save".</div>
          <div v-if='stream.commitMessage'>
            <br>
            <md-divider></md-divider>
            <br>
            <div class="md-caption"><i>Current commit message:</i> {{stream.commitMessage}}</div>
          </div>
        </md-card-header-text>
        <md-button class='md-primary md-raised' @click.native='preSaveData()' :disabled='!changed'> SAVE </md-button>
      </md-card-header>
      <md-card-content style='padding-bottom:20px;'>
        <div class="md-layout-item md-size-100" v-if='deStream'>
          <stream-layer v-for='layer in mergedLayers' :key='layer.guid' :layer='layer' @update='updateLayer' @remove='removeLayer'>
          </stream-layer>
        </div>
        <div class="md-layout-item md-size-100 md-caption text-center" style='padding: 5px' v-else>
          <br>
          There's no data in this stream... yet!
          <br>
        </div>
        <div class="md-layout" style="margin-top: 10px;">
          <div class="md-layout-item">
            <md-button class='md-icon-button md-raised md-primary' @click.native='addLayer'>
              <md-icon>add</md-icon>
            </md-button>
            <md-button class='md-icon-button md-raised' @click.native='showImportCSVDialog = true'>
              <md-icon>cloud_upload</md-icon>
              <md-tooltip md-direction="top">Paste a CSV file</md-tooltip>
            </md-button>
          </div>
          <div class="md-layout-item text-right">
            <md-button class='md-primary md-raised' @click.native='preSaveData()' :disabled='!changed'> SAVE </md-button>
          </div>
        </div>
      </md-card-content>
    </md-card>
    <br>
    <!-- <stream-detail-history :stream='stream'></stream-detail-history> -->
    <br>
    <md-dialog :md-active.sync='showImportCSVDialog'>
      <md-dialog-title>Import CSV</md-dialog-title>
      <div class="md-layout md-gutter" style="width:50vw;padding:24px 24px 0; box-sizing: border-box;">
        <div class="md-layout-item md-size-100">
          <p>Paste your csv below.</p>
          <p class='md-caption'>We assume the first row will contain the column names. Each column will become a separate "output port" or layer.</p>
        </div>
        <div class="md-layout-item md-size-100">
          <textarea style="height: 150px;width:100%" v-model='csvInput'></textarea>
        </div>
        <div>
        </div>
      </div>
      <md-dialog-actions>
        <md-button class="md-primary" @click='closeCsvDialog()'>Cancel</md-button>
        <md-button class="md-primary md-raised" @click='importCSV()'>Import CSV</md-button>
      </md-dialog-actions>
    </md-dialog>
    <md-dialog :md-active.sync="showSaveDialog">
      <md-dialog-title>Commit message</md-dialog-title>
      <div class="md-layout md-gutter" style="padding:24px 24px 0; box-sizing: border-box;">
        <div class="md-layout-item">
          <p>Write a short description of the reasons behind the changes you just made.</p>
          <md-field>
            <label>changelog:</label>
            <md-textarea v-model='commitMessage'>
            </md-textarea>
          </md-field>
        </div>
      </div>
      <md-dialog-actions>
        <md-button class="md-primary" @click='showSaveDialog=false'>Cancel</md-button>
        <md-button class="md-primary md-raised" @click='saveData()'>Save changes</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
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
    }
  },
  data( ) {
    return {
      changed: false,
      showSaveDialog: false,
      commitMessage: 'no message',
      showImportCSVDialog: false,
      csvInput: ''
    }
  },
  methods: {
    restore( ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, deleted: false } )
    },
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
      this.$store.dispatch( 'updateStreamObjectsAndLayers', { streamId: this.stream.streamId, commitMessage: this.commitMessage } )
        .then( res => {
          this.showSaveDialog = false
          this.commitMessage = 'no message'
          this.changed = false
          console.log( res )
        } )
        .catch( err => {
          console.error( err )
        } )
    },
    fetchData( streamId ) {
      console.log( `fetching data for ${streamId}` )
      Axios.get( `streams/${streamId}?fields=layers` )
        .then( res => {
          this.layers = res.data.resource.layers
          return Axios.get( `streams/${streamId}/objects?fields=type,value` )
        } )
        .then( res => {
          this.objects = res.data.resources
          this.$store.commit( 'ADD_DE_STREAM', { streamId: streamId, layers: this.layers, objects: this.objects } )
        } )
        .catch( err => {
          console.error( err )
        } )
    },
    importCSV( ) {
      let results = papa.parse( this.csvInput, { dynamicTyping: false } )
      // console.log( results )
      let transposed = results.data[ 0 ].map( ( x, i ) => results.data.map( x => x[ i ] ) )
      // console.log( transposed )
      this.$store.commit( 'APPEND_DE_STREAM_LAYERS_FROM_CSV', { streamId: this.stream.streamId, transposed } )
      this.showImportCSVDialog = false
      this.csvInput = ''
      this.changed = true
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
