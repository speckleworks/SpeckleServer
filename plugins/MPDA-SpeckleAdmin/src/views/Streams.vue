<template>
  <v-container grid-list-xl>
    <!-- Toolbar for stream selection/bulk operations -->
    <v-toolbar fixed v-if='selectedStreams.length > 0' style='z-index:100'>
      <v-toolbar-items>
        <v-btn icon color='primary' class='md-raised md-dense md-primary' @click.native='clearSelection'>
          <v-icon>close</v-icon>
        </v-btn>
        <v-btn flat @click.native='selectAll()'>select all</v-btn>
      </v-toolbar-items>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat color='error' @click.native='deleteStreams'>Archive</v-btn>
        <v-btn flat @click.native='togglePermissions'>Make {{defaultPermission}}</v-btn>
        <v-btn flat @click.native='createProjectFromSelection'>Create Project</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <!-- End toolbar -->
    <v-layout row wrap>
      <v-flex xs12 py-5 class='headline font-weight-light'>
        Streams are the channels your design data flows into.
      </v-flex>
      <!-- Empty state handler -->
      <v-flex xs12 v-if='streams.length === 0'>
        <p class='title font-weight-light'>
          👋 Hello {{$store.state.user.name}}! It looks like you haven't created any streams yet. Don't forget to check out the <a href='https://speckle.systems/docs/essentials/start' target='_blank'>guide</a>!
        </p>
      </v-flex>
      <v-flex xs12>
        <v-text-field solo clearable :xxxhint='searchHint' label="Search for a stream" prepend-inner-icon="search" @input="updateSearch" spellcheck="false" v-model='searchfilter' :loading='isSearching' append-icon="refresh" @click:append="$store.dispatch( 'getStreams', 'omit=objects,layers&isComputedResult=false&sort=updatedAt' )"></v-text-field>
        <!--       <p class='caption'>
          How to search for things?
        </p> -->
        <div v-if='searchfilter && searchfilter!==""'>
          <p class='title font-weight-light my-3 mx-1'>Found {{filteredStreams.length}} streams matching your search criteria.</p>
        </div>
        <!--       </v-flex>
      <v-flex xs12> -->
        <v-expansion-panel>
          <v-expansion-panel-content>
            <template v-slot:header>Search Options</template>
            <v-card class='pa-3'>
              <v-expansion-panel>
                <v-expansion-panel-content>
                  <template v-slot:header>Tags</template>
                  <v-card class='pa-3'>
                    <v-chip v-for='tag in allTags' :key='tag' small dense @click='addSearchQuery("tag", tag)'>
                      {{tag}}
                    </v-chip>
                  </v-card>
                </v-expansion-panel-content>
                <!-- <v-expansion-panel> -->
                <v-expansion-panel-content>
                  <template v-slot:header>Job Numbers</template>
                  <v-card class='pa-3'>
                    <v-chip v-for='jnumber in allJobNumbers' :key='jnumber' @click='addSearchQuery("jn", jnumber)'>{{jnumber}}</v-chip>
                  </v-card>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-card>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <!-- {{allTags}} -->
      </v-flex>
    </v-layout>
    <!-- All the stream cards will flow below -->
    <v-layout row wrap>
      <!-- Pagination top (TODO: extract to component) -->
      <v-flex xs12>
        <v-btn icon small @click.native='pageNumber=0' :disabled='pageNumber===0'>
          <v-icon>first_page</v-icon>
        </v-btn>
        <v-btn icon small @click.native='pageNumber-=1' :disabled='pageNumber===0'>
          <v-icon>chevron_left</v-icon>
        </v-btn>
        <v-btn icon @click.native='pageNumber+=1' :disabled='pageNumber >= Math.round(filteredStreams.length/sliceSize)'>
          <v-icon>chevron_right</v-icon>
        </v-btn>
        <v-btn icon small @click.native='pageNumber=Math.round(filteredStreams.length/sliceSize)' :disabled='pageNumber >= Math.round(filteredStreams.length/sliceSize)'>
          <v-icon>last_page</v-icon>
        </v-btn>
        <span class='caption' xxxstyle="position: relative;top:8px;">{{pageNumber}} / {{(filteredStreams.length/sliceSize).toFixed(0)}}</span>
      </v-flex>
      <!-- The actual stream cards -->
      <v-flex xs12 sm6 v-for='stream in paginatedStreams' :key='stream._id'>
        <stream-card :stream='stream' v-on:selected='selectThis' v-on:deleted='clearSelection'></stream-card>
      </v-flex>
      <!-- Pagination bottom  -->
      <v-flex xs12>
        <v-btn icon small @click.native='pageNumber=0' :disabled='pageNumber===0'>
          <v-icon>first_page</v-icon>
        </v-btn>
        <v-btn icon small @click.native='pageNumber-=1' :disabled='pageNumber===0'>
          <v-icon>chevron_left</v-icon>
        </v-btn>
        <v-btn icon @click.native='pageNumber+=1' :disabled='pageNumber >= Math.round(filteredStreams.length/sliceSize)'>
          <v-icon>chevron_right</v-icon>
        </v-btn>
        <v-btn icon small @click.native='pageNumber=Math.round(filteredStreams.length/sliceSize)' :disabled='pageNumber >= Math.round(filteredStreams.length/sliceSize)'>
          <v-icon>last_page</v-icon>
        </v-btn>
        <span class='caption' xxxstyle="position: relative;top:8px;">{{pageNumber}} / {{(filteredStreams.length/sliceSize).toFixed(0)}}</span>
      </v-flex>
    </v-layout>
    <!-- Big fat fab button to create a new stream -->
    <v-btn color="primary" dark fixed large bottom right fab @click.native='createStream'>
      <v-icon>add</v-icon>
    </v-btn>
  </v-container>
</template>
<script>
import debounce from 'lodash.debounce'
import StreamCard from '../components/StreamCard.vue'

export default {
  name: 'StreamsView',
  components: { StreamCard },
  computed: {
    allTags( ) {
      return this.$store.getters.allStreamTags
    },
    allJobNumbers( ) {
      return this.$store.getters.allJobNumbersStreams
    },
    streams( ) {
      return this.$store.state.streams.filter( stream => stream.parent == null && stream.deleted === false ).sort( ( a, b ) => {
        return new Date( b.updatedAt ) - new Date( a.updatedAt );
      } )
    },
    filteredStreams( ) {
      return this.$store.getters.filteredResources( this.filters )
    },
    paginatedStreams( ) {
      // return this.filteredStreams.slice( this.startIndex, this.endIndex )
      return this.filteredStreams.slice( this.currentIndex + this.pageNumber * this.sliceSize, this.sliceSize * ( this.pageNumber + 1 ) )
    },
  },
  data( ) {
    return {
      currentIndex: 0,
      sliceSize: 6,
      pageNumber: 0,
      selectedStreams: [ ],
      searchfilter: '',
      filters: [ ],
      defaultPermission: 'private',
      isSearching: false,
      searchHint: `You can restrict your search to the stream's id by prepending id:{your stream id}, similarly for name, tags etc.`
    }
  },
  watch: {
    searchfilter( ) {
      this.isSearching = true
    },
    selectedStreams( ) {
      let priv = 0,
        pub = 0
      this.selectedStreams.forEach( s => {
        if ( s.private ) priv++
        else pub++
      } )
      this.defaultPermission = priv > pub ? 'public' : 'private'
    }
  },
  methods: {
    addSearchQuery( key, tag ) {
      this.pageNumber = 0
      let tempFilter = `${key}:${tag}`
      this.searchfilter = tempFilter
      setTimeout( ( ) => { this.isSearching = false }, 50 )
      try {
        let filters = tempFilter.split( ' ' ).map( t => {
          if ( t.includes( ':' ) )
            return { key: t.split( ':' )[ 0 ], value: t.split( ':' )[ 1 ] }
          else if ( !t.includes( 'public' ) && !t.includes( 'private' ) && !t.includes( 'mine' ) && !t.includes( 'shared' ) ) // TODO: not elegant
            return { key: 'name', value: t }
          else
            return { key: t, value: null }
        } )
        this.filters = filters
      } catch {
        this.filters = [ { key: 'name', value: e } ]
      }
      this.isSearching = false
    },
    createStream( ) {
      this.$store.dispatch( 'createStream', { name: 'A New Speckle Stream', onlineEditable: true } )
        .then( res => {
          this.$router.push( `/streams/${res.streamId}` )
        } )
        .catch( err => {
          console.error( err )
        } )
    },
    createProjectFromSelection( ) {
      this.$store.dispatch( 'createProject', { name: 'Speckle Project', streams: this.selectedStreams.map( s => s.streamId ) } )
        .then( res => {
          this.clearSelection( )
          this.$router.push( `/projects/${res._id}` )
        } )
    },
    togglePermissions( ) {
      this.selectedStreams.forEach( stream => {
        this.$store.dispatch( 'updateStream', { streamId: stream.streamId, private: this.defaultPermission === 'private' ? true : false } )
      } )
      this.defaultPermission = this.defaultPermission === 'private' ? 'public' : 'private'
    },
    deleteStreams( ) {
      this.selectedStreams.forEach( stream => {
        this.$store.dispatch( 'updateStream', { streamId: stream.streamId, deleted: true } )
      } )
      this.clearSelection( )
    },
    updateSearch: debounce( function ( e ) {
      this.pageNumber = 0
      this.isSearching = false
      this.searchfilter = e
      try {
        let filters = this.searchfilter.split( ' ' ).map( t => {
          if ( t.includes( ':' ) )
            return { key: t.split( ':' )[ 0 ], value: t.split( ':' )[ 1 ] }
          else if ( !t.includes( 'public' ) && !t.includes( 'private' ) && !t.includes( 'mine' ) && !t.includes( 'shared' ) ) // TODO: not elegant
            return { key: 'name', value: t }
          else
            return { key: t, value: null }
        } )
        this.filters = filters
      } catch {
        this.filters = [ { key: 'name', value: e } ]
      }
    }, 1000 ),
    selectAll( ) {
      this.paginatedStreams.forEach( stream => {
        let index = this.selectedStreams.findIndex( s => s.streamId === stream.streamId )
        if ( index === -1 ) {
          bus.$emit( 'select-stream', stream.streamId )
        }
      } )
    },
    selectThis( stream ) {
      let index = this.selectedStreams.findIndex( s => s.streamId === stream.streamId )
      if ( index === -1 )
        this.selectedStreams.unshift( stream )
      else
        this.selectedStreams.splice( index, 1 )
    },
    clearSelection( ) {
      this.defaultPermission = 'private'
      bus.$emit( 'unselect-all' )
    },
    checkSelection( ) {
      this.selectedStreams = this.selectedStreams.filter( s => !s.deleted )
    }
  },
  created( ) {}
}

</script>
<style scoped lang='scss'>
</style>
