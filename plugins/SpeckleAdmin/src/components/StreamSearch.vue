<template>
  <md-card md-with-hover class='md-elevation-0 stream-search'>
    <md-card-content>
      <md-field md-clearable>
        <md-icon>search</md-icon>
        <md-input @input="updateSearch" v-model='searchfilter' spellcheck="false" :disabled='globalDisabled'></md-input>
        <label>Search for a stream to add</label>
      </md-field>
      <md-progress-bar md-mode="indeterminate" :md-diameter='20' :md-stroke='2' v-show='searchInProgress'></md-progress-bar>
      <div class='search-results' v-if='showSearchResults'>
        <md-chip md-clickable class='md-primary' style='margin: 3px;' v-for='stream in paginatedStreams' v-if='filters.length > 0' :key='stream.streamId' @click='selectStream(stream.streamId)'>
          <strong>{{stream.name}}</strong> {{stream.streamId}} </span>
          <!-- <span v-if='stream.tags'> | </span> -->
          <span v-for='tag in stream.tags' v-if='stream.tags' style="background: #0B5DE8; border-radius:3px; margin-right:4px; padding:1px"> {{tag}} </span>
        </md-chip>
        <p v-if='paginatedStreams.length === 0' class="md-caption">No streams found. Existing streams ignored.</p>
      </div>
    </md-card-content>
  </md-card>
</template>
<script>
import debounce from 'lodash.debounce'

export default {
  name: 'StreamSearch',
  props: {
    streamsToOmit: {
      type: Array,
      default ( ) { return [ ] }
    },
    globalDisabled: {
      type:Boolean,
      default: false
    },
    writeOnly: Boolean
  },
  computed: {
    filteredStreams( ) {
      return this.$store.getters.filteredStreams( this.filters ).filter( s => this.streamsToOmit.indexOf( s.streamId ) === -1 )
    },
    paginatedStreams( ) {
      let toReturn = this.filteredStreams.slice( this.startIndex, this.endIndex )
      if( this.writeOnly )
        toReturn = toReturn.filter( s => s.owner === this.$store.state.user._id || s.canWrite.indexOf( this.$store.state.user._id ) > -1 )
      return toReturn
    }
  },
  watch: {
    searchfilter( val ) {
      if ( val === '' ) {
        this.showSearchResults = false
        this.searchInProgress = false
      } else
        this.searchInProgress = true
    }
  },
  data( ) {
    return {
      searchfilter: '',
      filters: [ ],
      showSearchResults: false,
      searchInProgress: false
    }
  },
  methods: {
    selectStream( streamId ) {
      this.$emit( 'selected-stream', streamId )
    },
    updateSearch: debounce( function( e ) {
      this.searchfilter = e

      if ( e === '' ) {
        this.showSearchResults = false
        return
      }
      this.showSearchResults = true
      this.searchInProgress = false
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
  }
}

</script>
<style scoped lang='scss'>
.stream-search {
  border-radius: 10px;
}
</style>
