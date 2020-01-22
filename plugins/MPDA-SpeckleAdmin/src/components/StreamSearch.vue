<template>
  <v-layout align-center row wrap @mouseleave='mouseLeave'>
    <v-flex xs12 class='pb-0'>
      <v-text-field ref="searchField" autofocus box flat clearable prepend-inner-icon="search" label='search for streams' @input="updateSearch" v-model='searchfilter' spellcheck="false" :disabled='globalDisabled' :loading='searchInProgress' append-icon="refresh" @click:append="$store.dispatch( 'getStreams', 'omit=objects,layers&isComputedResult=false&sort=updatedAt' )"></v-text-field>
    </v-flex>
    <v-flex xs12 v-if='showSearchResults' style='margin-top:-30px' class='mb-5'>
      <v-card class='elevation-10'>
        <v-card-title class='subheading'>Search results ({{paginatedStreams.length}} streams)</v-card-title>
        <v-divider></v-divider>
        <v-card-text style='max-height: 410px; overflow-y: auto; overflow-x: hidden;' v-if='paginatedStreams.length>0'>
          <v-list two-line v-if='filters.length > 0'>
            <v-list-tile v-for='stream in paginatedStreams' :key='stream.streamId'>
              <v-list-tile-content>
                <v-list-tile-title>
                  {{stream.name}}
                </v-list-tile-title>
                <v-list-tile-sub-title class='caption'>
                  <v-icon small>fingerprint</v-icon><span class='caption' style="user-select:all;">{{stream.streamId}}</span>&nbsp;<v-icon small>edit</v-icon>
                  <timeago :datetime='stream.updatedAt'></timeago>
                </v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn fab small depressed @click.native='selectStream(stream.streamId)'>
                  <v-icon>add</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
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
      type: Boolean,
      default: false
    },
    writeOnly: Boolean
  },
  computed: {
    filteredStreams( ) {
      return this.$store.getters.filteredResources( this.filters, "streams" ).filter( s => this.streamsToOmit.indexOf( s.streamId ) === -1 )
    },
    paginatedStreams( ) {
      let toReturn = this.filteredStreams.slice( this.startIndex, this.endIndex )
      if ( this.writeOnly )
        toReturn = toReturn.filter( s => s.owner === this.$store.state.user._id || s.canWrite.indexOf( this.$store.state.user._id ) > -1 )
      return toReturn
    }
  },
  watch: {
    searchfilter( val ) {
      if ( val === '' || val === null ) {
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
      searchInProgress: false,
      startIndex: 0,
      endIndex: 42
    }
  },
  methods: {
    mouseLeave() {
      this.$refs.searchField.blur()
    },
    refreshStreams( ) {
      this.$store.dispatch( 'getStreams', 'omit=objects,layers&isComputedResult=false&sort=updatedAt' )
    },
    selectStream( streamId ) {
      this.$emit( 'selected-stream', streamId )
    },
    updateSearch: debounce( function( e ) {
      this.searchfilter = e

      if ( e === '' || e === null ) {
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
.hovered {
  cursor: pointer;
}

</style>
