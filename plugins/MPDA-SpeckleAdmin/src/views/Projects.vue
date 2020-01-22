<template>
  <v-container grid-list-xl>
    <!-- Toolbar for project selection/bulk operations -->
    <v-toolbar fixed v-if='selectedProjects.length > 0' style='z-index:100'>
      <v-toolbar-items>
        <v-btn icon color='primary' class='md-raised md-dense md-primary' @click.native='clearSelection'>
          <v-icon>close</v-icon>
        </v-btn>
        <v-btn flat @click.native='selectAll()'>select all</v-btn>
      </v-toolbar-items>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat color='error' @click.native='deleteSelectedProjects'>Archive</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <!-- End toolbar -->
    <v-layout row wrap>
      <v-flex xs12 py-5 class='headline font-weight-light'>
        Projects allow you to share streams with a team.
      </v-flex>
      <!-- Empty state handler -->
      <v-flex xs12 v-if='projects.length === 0'>
        <p class='title font-weight-light'>
          👋 Hello {{$store.state.user.name}}! It looks like you haven't created any projects yet. Don't forget to check out the <a href='https://speckle.systems/docs/web/management' target='_blank'>guide</a>!
        </p>
      </v-flex>
      <v-flex xs12>
        <v-text-field solo clearable label="Search for a project" prepend-inner-icon="search" @input="updateSearch" spellcheck="false" v-model='searchfilter' :loading='isSearching' append-icon="refresh" @click:append="$store.dispatch( 'getProjects' )"></v-text-field>
        <div v-if='searchfilter && searchfilter!==""'>
          <p class='title font-weight-light my-3 mx-1'>Found {{filteredProjects.length}} project{{filteredProjects.length===1?'':'s'}} matching your search criteria.</p>
        </div>
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
      </v-flex>
    </v-layout>
    <!-- All the project cards will flow below -->
    <v-layout row wrap>
      <!-- Pagination top (TODO: extract to component) -->
      <v-flex xs12>
        <v-btn icon small @click.native='pageNumber=0' :disabled='pageNumber===0'>
          <v-icon>first_page</v-icon>
        </v-btn>
        <v-btn icon small @click.native='pageNumber-=1' :disabled='pageNumber===0'>
          <v-icon>chevron_left</v-icon>
        </v-btn>
        <v-btn icon @click.native='pageNumber+=1' :disabled='pageNumber >= Math.round(filteredProjects.length/sliceSize)'>
          <v-icon>chevron_right</v-icon>
        </v-btn>
        <v-btn icon small @click.native='pageNumber=Math.round(filteredProjects.length/sliceSize)' :disabled='pageNumber >= Math.round(filteredProjects.length/sliceSize)'>
          <v-icon>last_page</v-icon>
        </v-btn>
        <span class='caption' xxxstyle="position: relative;top:8px;">{{pageNumber}} / {{(filteredProjects.length/sliceSize).toFixed(0)}}</span>
      </v-flex>
      <!-- The actual project cards -->
      <v-flex xs12 sm6 v-for='project in paginatedProjects' :key='project._id'>
        <project-card :resource='project' v-on:selected='selectThis' v-on:deleted='clearSelection'></project-card>
      </v-flex>
      <!-- Pagination bottom  -->
      <v-flex xs12>
        <v-btn icon small @click.native='pageNumber=0' :disabled='pageNumber===0'>
          <v-icon>first_page</v-icon>
        </v-btn>
        <v-btn icon small @click.native='pageNumber-=1' :disabled='pageNumber===0'>
          <v-icon>chevron_left</v-icon>
        </v-btn>
        <v-btn icon @click.native='pageNumber+=1' :disabled='pageNumber >= Math.round(filteredProjects.length/sliceSize)'>
          <v-icon>chevron_right</v-icon>
        </v-btn>
        <v-btn icon small @click.native='pageNumber=Math.round(filteredProjects.length/sliceSize)' :disabled='pageNumber >= Math.round(filteredProjects.length/sliceSize)'>
          <v-icon>last_page</v-icon>
        </v-btn>
        <span class='caption' xxxstyle="position: relative;top:8px;">{{pageNumber}} / {{(filteredProjects.length/sliceSize).toFixed(0)}}</span>
      </v-flex>
    </v-layout>
    <!-- Big fat fab button to create a new project -->
    <v-btn color="primary" dark fixed large bottom right fab @click.native='createProject'>
      <v-icon>add</v-icon>
    </v-btn>
  </v-container>
</template>
<script>
import debounce from 'lodash.debounce'
import ProjectCard from '../components/ProjectCard.vue'

export default {
  name: 'ProjectsView',
  components: {
    ProjectCard
  },
  computed: {
    projects( ) {
      return this.$store.state.projects.filter( p => p.deleted === false )
    },
    filteredProjects( ) {
      if ( this.searchfilter && this.searchfilter !== '' )
        return this.$store.getters.filteredResources( this.filters, "projects" )
      // return this.projects.filter( p => p.name.toLowerCase().includes( this.searchfilter.toLowerCase() ) )
      return this.projects
    },
    paginatedProjects( ) {
      return this.filteredProjects.slice( this.currentIndex + this.pageNumber * this.sliceSize, this.sliceSize * ( this.pageNumber + 1 ) )
    },
    allTags( ) {
      return this.$store.getters.allProjectTags
    },
    allJobNumbers( ) {
      return this.$store.getters.allJobNumbersProjects
    },
  },
  data( ) {
    return {
      currentIndex: 0,
      sliceSize: 6,
      pageNumber: 0,
      searchfilter: '',
      selectedProjects: [ ],
      isSearching: false,
      filters: [ ]
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
    selectThis( project ) {
      let index = this.selectedProjects.findIndex( p => p._id === project._id )
      if ( index === -1 )
        this.selectedProjects.unshift( project )
      else
        this.selectedProjects.splice( index, 1 )
    },
    selectAll( ) {
      this.paginatedProjects.forEach( project => {
        let index = this.selectedProjects.findIndex( s => s._id === project._id )
        if ( index === -1 ) {
          bus.$emit( 'select-project', project._id )
        }
      } )
    },
    createProject( ) {
      this.$store.dispatch( 'createProject', { name: 'A brand new speckle project' } )
        .then( res => {
          this.$router.push( `/projects/${res._id}` )
        } )
    },
    deleteSelectedProjects( ) {
      this.selectedProjects.forEach( project => {
        this.$store.dispatch( 'updateProject', { _id: project._id, deleted: true } )
      } )
      this.clearSelection( )
    },
    clearSelection( ) {
      bus.$emit( 'unselect-all-projects' )
    },
    updateSearch: debounce( function ( e ) {
      this.pageNumber = 0
      this.isSearching = false
      this.searchfilter = e
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
  },
  created( ) {}
}

</script>
<style scoped lang='scss'>
</style>
