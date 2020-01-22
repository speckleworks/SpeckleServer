<template>
  <v-container grid-list-xl>
    <!-- Toolbar for processor selection/bulk operations -->
    <v-toolbar fixed v-if='selectedProcessors.length > 0' style='z-index:100'>
      <v-toolbar-items>
        <v-btn icon color='primary' class='md-raised md-dense md-primary' @click.native='clearSelection'>
          <v-icon>close</v-icon>
        </v-btn>
        <v-btn flat @click.native='selectAll()'>select all</v-btn>
      </v-toolbar-items>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat color='error' @click.native='deleteSelectedProcessors'>Delete</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <!-- End toolbar -->
    <v-layout row wrap>
      <v-flex xs12 py-5 class='headline font-weight-light'>
        Processor allows you to run scripts on streams.
      </v-flex>
      <!-- Empty state handler -->
      <v-flex xs12 v-if='processors.length === 0'>
        <p class='title font-weight-light'>Hmm, you don't have any processors yet. Don't worry! You can create a new one here (big blue button in the lower right corner)!
        </p>
      </v-flex>
      <v-flex xs12>
        <v-text-field solo clearable label="Search for a processor" prepend-inner-icon="search" @input="updateSearch" spellcheck="false" v-model='searchfilter' :loading='isSearching' append-icon="refresh" @click:append="$store.dispatch( 'getProcessors' )"></v-text-field>
        <div v-if='searchfilter && searchfilter!==""'>
          <p class='title font-weight-light my-3 mx-1'>Found {{filteredProcessors.length}} processor{{filteredProcessors.length===1?'':'s'}} matching your search criteria.</p>
        </div>
      </v-flex>
    </v-layout>
    <!-- All the processor cards will flow below -->
    <v-layout row wrap>
      <!-- Pagination top (TODO: extract to component) -->
      <v-flex xs12>
        <v-btn icon small @click.native='pageNumber=0' :disabled='pageNumber===0'>
          <v-icon>first_page</v-icon>
        </v-btn>
        <v-btn icon small @click.native='pageNumber-=1' :disabled='pageNumber===0'>
          <v-icon>chevron_left</v-icon>
        </v-btn>
        <v-btn icon @click.native='pageNumber+=1' :disabled='pageNumber >= Math.round(filteredProcessors.length/sliceSize)'>
          <v-icon>chevron_right</v-icon>
        </v-btn>
        <v-btn icon small @click.native='pageNumber=Math.round(filteredProcessors.length/sliceSize)' :disabled='pageNumber >= Math.round(filteredProcessors.length/sliceSize)'>
          <v-icon>last_page</v-icon>
        </v-btn>
        <span class='caption' xxxstyle="position: relative;top:8px;">{{pageNumber}} / {{(filteredProcessors.length/sliceSize).toFixed(0)}}</span>
      </v-flex>
      <!-- The actual processor cards -->
      <v-flex xs12 sm6 v-for='processor in paginatedProcessors' :key='processor._id'>
        <processor-card :resource='processor' v-on:selected='selectThis' v-on:deleted='clearSelection'></processor-card>
      </v-flex>
      <!-- Pagination bottom  -->
      <v-flex xs12>
        <v-btn icon small @click.native='pageNumber=0' :disabled='pageNumber===0'>
          <v-icon>first_page</v-icon>
        </v-btn>
        <v-btn icon small @click.native='pageNumber-=1' :disabled='pageNumber===0'>
          <v-icon>chevron_left</v-icon>
        </v-btn>
        <v-btn icon @click.native='pageNumber+=1' :disabled='pageNumber >= Math.round(filteredProcessors.length/sliceSize)'>
          <v-icon>chevron_right</v-icon>
        </v-btn>
        <v-btn icon small @click.native='pageNumber=Math.round(filteredProcessors.length/sliceSize)' :disabled='pageNumber >= Math.round(filteredProcessors.length/sliceSize)'>
          <v-icon>last_page</v-icon>
        </v-btn>
        <span class='caption' xxxstyle="position: relative;top:8px;">{{pageNumber}} / {{(filteredProcessors.length/sliceSize).toFixed(0)}}</span>
      </v-flex>
    </v-layout>
    <!-- Big fat fab button to create a new processor -->
    <v-btn color="primary" dark fixed large bottom right fab @click.native='createProcessor'>
      <v-icon>add</v-icon>
    </v-btn>
  </v-container>
</template>
<script>
import debounce from 'lodash.debounce'
import ProcessorCard from '../components/ProcessorCard.vue'

export default {
  name: 'ProcessorView',
  components: {
    ProcessorCard
  },
  computed: {
    processors( ) {
      return this.$store.state.processors.filter( p => p.owner.indexOf(this.$store.state.user._id) !== -1)
    },
    filteredProcessors( ) {
      if ( this.searchfilter && this.searchfilter !== '' )
        return this.processors.filter( p => p.name.toLowerCase().includes( this.searchfilter.toLowerCase() ) )
      return this.processors
    },
    paginatedProcessors( ) {
      return this.filteredProcessors.slice( this.currentIndex + this.pageNumber * this.sliceSize, this.sliceSize * ( this.pageNumber + 1 ) )
    }
  },
  data( ) {
    return {
      currentIndex: 0,
      sliceSize: 6,
      pageNumber: 0,
      searchfilter: '',
      selectedProcessors: [ ],
      isSearching: false
    }
  },
  methods: {
    selectThis( processor ) {
      let index = this.selectedProcessors.findIndex( p => p._id === processor._id )
      if ( index === -1 )
        this.selectedProcessors.unshift( processor )
      else
        this.selectedProcessors.splice( index, 1 )
    },
    selectAll( ) {
      this.paginatedProcessors.forEach( processor => {
        let index = this.selectedProcessors.findIndex( s => s._id === processor._id )
        if ( index === -1 ) {
          bus.$emit( 'select-processor', processor._id )
        }
      } )
    },
    createProcessor( ) {
      this.$store.dispatch( 'createProcessor', { name: 'A brand new speckle processor' } )
        .then( res => {
          this.$router.push( `/processors/${res._id}` )
        } )
    },
    deleteSelectedProcessors( ) {
      this.selectedProcessors.forEach( processor => {
        this.$store.dispatch( 'deleteProcessor', { _id: processor._id } )
      } )
      this.selectedProcessors.splice( 0, this.selectedProcessors.length )
      this.clearSelection( )
    },
    clearSelection( ) {
      bus.$emit( 'unselect-all-processors' )
    },
    updateSearch: debounce( function( e ) {
      this.pageNumber = 0
      this.isSearching = false
      this.searchfilter = e
    }, 1000 ),
  }
}

</script>
<style scoped lang='scss'>
</style>
