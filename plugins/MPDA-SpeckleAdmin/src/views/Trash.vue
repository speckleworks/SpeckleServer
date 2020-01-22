<template>
  <v-container grid-list-xl>
    <!-- Toolbar for stream selection/bulk operations -->
    <v-toolbar fixed v-if='selectedResources.length > 0' style='z-index:100' class='elevation-0'>
      <v-toolbar-items>
        <v-btn icon color='primary' class='md-raised md-dense md-primary' @click.native='clearSelection'>
          <v-icon>close</v-icon>
        </v-btn>
        <v-btn flat @click.native='selectAll()'>select all</v-btn>
      </v-toolbar-items>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat color='error' @click.native='deleteAllSelected()'>Delete Permanently ({{selectedResources.length}})</v-btn>
        <v-btn color='primary' depressed @click.native='restoreAllSelected()'>Restore</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-layout row wrap>
      <v-flex xs12 py-5 class='headline font-weight-light'>
        Welcome to the recycle bin ({{allResources.length}} items). You can restore them or delete them permanently.<br><strong>Take care, there's no undo button!</strong>
      </v-flex>
      <v-flex xs12>
        <v-text-field solo clearable label="Search for a resource" prepend-inner-icon="search" @input="" spellcheck="false" v-model='filterText'></v-text-field>
        <div v-if='filterText && filterText!==""'>
          <p class='title font-weight-light my-3 mx-1'>Found {{allResourcesFiltered.length}} resources matching your search criteria.</p>
        </div>
      </v-flex>
      <!-- Pagination top  -->
      <v-flex xs12>
        <v-btn icon small @click.native='pageNumber=0' :disabled='pageNumber===0'>
          <v-icon>first_page</v-icon>
        </v-btn>
        <v-btn icon small @click.native='pageNumber-=1' :disabled='pageNumber===0'>
          <v-icon>chevron_left</v-icon>
        </v-btn>
        <v-btn icon @click.native='pageNumber+=1' :disabled='pageNumber >= Math.round(allResourcesFiltered.length/sliceSize)'>
          <v-icon>chevron_right</v-icon>
        </v-btn>
        <v-btn icon small @click.native='pageNumber=Math.round(allResourcesFiltered.length/sliceSize)' :disabled='pageNumber >= Math.round(allResourcesFiltered.length/sliceSize)'>
          <v-icon>last_page</v-icon>
        </v-btn>
        <span class='caption' xxxstyle="position: relative;top:8px;">{{pageNumber}} / {{(allResourcesFiltered.length/sliceSize).toFixed(0)}}</span>
      </v-flex>
      <v-flex xs12>
        <v-layout row wrap>
          <v-flex xs12 sm6 lg6 v-for='resource in allResourcesPaginated' :key='resource._id'>
            <simple-card :resource='resource' v-on:selected='selectThis' xxxxv-on:deleted='clearSelection'></simple-card>
          </v-flex>
        </v-layout>
      </v-flex>
      <!-- Pagination bottom  -->
      <v-flex xs12>
        <v-btn icon small @click.native='pageNumber=0' :disabled='pageNumber===0'>
          <v-icon>first_page</v-icon>
        </v-btn>
        <v-btn icon small @click.native='pageNumber-=1' :disabled='pageNumber===0'>
          <v-icon>chevron_left</v-icon>
        </v-btn>
        <v-btn icon @click.native='pageNumber+=1' :disabled='pageNumber >= Math.round(allResourcesFiltered.length/sliceSize)'>
          <v-icon>chevron_right</v-icon>
        </v-btn>
        <v-btn icon small @click.native='pageNumber=Math.round(allResourcesFiltered.length/sliceSize)' :disabled='pageNumber >= Math.round(allResourcesFiltered.length/sliceSize)'>
          <v-icon>last_page</v-icon>
        </v-btn>
        <span class='caption' xxxstyle="position: relative;top:8px;">{{pageNumber}} / {{(allResourcesFiltered.length/sliceSize).toFixed(0)}}</span>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import SimpleCard from '../components/SimpleCard.vue'

export default {
  name: 'TrashView',
  components: {
    SimpleCard
  },
  watch: {
    filterText( ) {
      this.pageNumber = 0
    }
  },
  computed: {
    projects( ) {
      return this.$store.state.projects.filter( p => p.deleted === true )
    },
    streams( ) {
      return this.$store.state.streams.filter( s => s.deleted === true )
    },
    allResources( ) {
      return [ ...this.streams, ...this.projects ].filter( res => res.owner === this.$store.state.user._id ).sort( ( a, b ) => {
        return new Date( b.updatedAt ) - new Date( a.updatedAt );
      } )
    },
    allResourcesFiltered( ) {
      if ( this.filterText === '' || this.filterText === null ) return this.allResources
      return this.allResources.filter( r => r.name ? r.name.toLowerCase( ).includes( this.filterText.toLowerCase( ) ) : true ).sort( ( a, b ) => a.updatedAt > b.updatedAt )
    },
    allResourcesPaginated( ) {
      return this.allResourcesFiltered.slice( this.currentIndex + this.pageNumber * this.sliceSize, this.sliceSize * ( this.pageNumber + 1 ) )
    }
  },
  data( ) {
    return {
      filterText: '',
      currentIndex: 0,
      sliceSize: 6,
      pageNumber: 0,
      selectedResources: [ ]
    }
  },
  methods: {
    deleteForever( resource ) {
      if ( resource.streamId )
        this.$store.dispatch( 'deleteStream', { streamId: resource.streamId } )
      else
        this.$store.dispatch( 'deleteProject', { _id: resource._id } )
    },
    deleteAllSelected( ) {
      for ( let resource of this.selectedResources ) {
        if ( resource.streamId )
          this.$store.dispatch( 'deleteStream', { streamId: resource.streamId } )
        else
          this.$store.dispatch( 'deleteProject', { _id: resource._id } )
      }
      this.clearSelection( )
    },
    restore( resource ) {
      if ( resource.streamId )
        this.$store.dispatch( 'updateStream', { streamId: resource.streamId, deleted: false } )
      else
        this.$store.dispatch( 'updateProject', { _id: resource._id, deleted: false } )
    },
    restoreAllSelected( ) {
      for ( let resource of this.selectedResources ) {
        if ( resource.streamId )
          this.$store.dispatch( 'updateStream', { streamId: resource.streamId, deleted: false } )
        else
          this.$store.dispatch( 'updateProject', { _id: resource._id, deleted: false } )
      }
      this.clearSelection( )
    },
    clearSelection( ) {
      this.selectedResources.forEach( resource => {
        bus.$emit( 'unselect-all-resources' )
      } )
    },
    selectAll( ) {
      this.allResourcesPaginated.forEach( resource => {
        let index = this.selectedResources.findIndex( res => res._id === resource._id )
        if ( index === -1 ) {
          bus.$emit( 'select-resource', resource._id )
        }
      } )
    },
    selectThis( resource ) {
      let index = this.selectedResources.findIndex( r => r._id === resource._id )
      if ( index === -1 )
        this.selectedResources.unshift( resource )
      else
        this.selectedResources.splice( index, 1 )
    }
  },
  created( ) {}
}

</script>
<style scoped lang='scss'>
</style>
