<template>
  <v-layout row wrap class='mb-5' justify-left>
    <v-flex xs12>
      <v-text-field solo clearable @input="updateSearch" label="Search for a stream or project" prepend-inner-icon="search" @click:append="refreshResources()" append-icon="refresh" spellcheck="false" v-model='filterText' :loading='isLoading'></v-text-field>
    </v-flex>
    <v-flex xs12 v-if='filterText' style='position: relative; top: -30px'>
      <v-card class='xxxtransparent elevation-10'>
        <v-layout row wrap>
          <v-flex xs12 md6 pa-3>
            <div class='title font-weight-light mb-3 pl-3'>Streams ({{filteredStreams.length}})</div>
            <v-list two-line v-if='filteredStreams.length > 0' style='max-height: 210px; overflow-y: auto; overflow-x: hidden;'>
              <v-list-tile v-for='stream in filteredStreams' :key='stream.streamId' :to='`/streams/${stream.streamId}`'>
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{stream.name}}
                  </v-list-tile-title>
                  <v-list-tile-sub-title class='caption'>
                    <v-icon small>fingerprint</v-icon><span class='caption' style="user-select:all;">{{stream.streamId}}</span>&nbsp;<v-icon small>edit</v-icon>
                    <timeago :datetime='stream.updatedAt'></timeago>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
            <span class='caption pl-3' v-else>No streams with that name found.</span>
          </v-flex>
          <v-flex xs12 md6 pa-3>
            <div class='title font-weight-light mb-3 pl-3'>Projects ({{filteredProjects.length}})</div>
            <v-list two-line v-if='filteredProjects.length > 0' style='max-height: 210px; overflow-y: auto; overflow-x: hidden;'>
              <v-list-tile v-for='project in filteredProjects' :key='project._id' :to='`/projects/${project._id}`'>
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{project.name}}
                  </v-list-tile-title>
                  <v-list-tile-sub-title class='caption'>
                    <v-icon small>fingerprint</v-icon><span class='caption' style="user-select:all;">{{project._id}}</span>&nbsp;<v-icon small>edit</v-icon>
                    <timeago :datetime='project.updatedAt'></timeago>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
            <span class='caption pl-3' v-else>No projects with that name found.</span>
          </v-flex>
        </v-layout>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import debounce from 'lodash.debounce'

export default {
  name: 'SearchEverything',
  props: {},
  watch: {
    filterText( val ) {
      // if ( val === '' || val === null ) {
      //   this.isLoading = false
      //   return
      // }
      this.isLoading = true
    }
  },
  computed: {
    projects( ) {
      return this.$store.state.projects.filter( p => p.deleted === false )
    },
    streams( ) {
      return this.$store.state.streams.filter( stream => stream.parent === null && stream.deleted === false ).sort( ( a, b ) => {
        return new Date( b.updatedAt ) - new Date( a.updatedAt );
      } )
    },
    filteredStreams( ) {
      // if ( !this.actualSearchFilter || this.actualSearchFilter === '' ) return [ ]
      // return this.streams.filter( stream => stream.name ? stream.name.toLowerCase( ).includes( this.actualSearchFilter.toLowerCase( ) ) : true ).sort( ( a, b ) => a.updatedAt > b.updatedAt )
      return this.$store.getters.filteredResources( this.filters, "streams" )
    },
    filteredProjects( ) {
      // if ( !this.actualSearchFilter || this.actualSearchFilter === '' ) return [ ]
      // return this.projects.filter( r => r.name ? r.name.toLowerCase( ).includes( this.actualSearchFilter.toLowerCase( ) ) : true ).sort( ( a, b ) => a.updatedAt > b.updatedAt )
      return this.$store.getters.filteredResources( this.filters, "projects" )
    },
  },
  data( ) {
    return {
      filterText: '',
      isLoading: false,
      filters: [ ]
    }
  },
  methods: {
    updateSearch: debounce( function ( e ) {

      this.isLoading = false
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
        console.log( this.filters )
      } catch {
        this.filters = [ { key: 'name', value: e } ]
      }
    }, 1000 ),
    refreshResources( ) {
      this.$store.dispatch( 'getStreams', 'omit=objects,layers&isComputedResult=false&sort=updatedAt' )
      this.$store.dispatch( 'getProjects' )
    }
  }
}

</script>
<style scoped lang='scss'>
</style>
