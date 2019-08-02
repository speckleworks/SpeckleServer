<template>
  <div>
    <md-empty-state md-icon="delete_outline" md-label="" md-description="By creating a project, you'll be able to group streams together and share them with a team." v-if='allResources.length===0'>
      You do not have any deleted items.
    </md-empty-state>
    <div class='md-layout' v-else>
      <md-card class="md-elevation-0 md-layout-item md-size-100">
        <md-card-content>
          <h1 class='md-display-2'>Trash bin</h1>
          <p>These are your deleted resources. You can restore them or delete them permanently. Take care, there's no undo button!</p>
        </md-card-content>
      </md-card>
      <md-card class="main-toolbar md-elevation-3">
        <md-card-content class='md-layout md-alignment-center-space-between'>
          <div class="md-layout-item md-size-100">
            <md-field md-clearable>
              <md-icon>search</md-icon>
              <label>search for resources by their name</label>
              <md-input v-model='filterText' @input="" spellcheck="false"></md-input>
            </md-field>
          </div>
        </md-card-content>
      </md-card>
      <div class="md-layout md-alignment-center-center">
        <div class="md-layout-item md-size-100 md-medium-size-100">
          <md-card class="md-elevation-0">
            <md-card-content class='md-layout md-alignment-center-center' v-for='resource in allResourcesFiltered' :key='resource._id'>
              <div class="md-layout-item md-size-5">
                <md-avatar class="md-avatar-icon md-small" :style='{ "background" : resource.streamId ? "#448aff" : "#E639B9" }'>{{resource.name.substring(0,1).toUpperCase()}}</md-avatar>
              </div>
              <div class="md-layout-item">
                <router-link :to='resource.streamId ? "/streams/"+resource.streamId : "/projects/"+resource._id'>{{resource.name}}</router-link>
              </div>
              <div class="md-layout-item md-caption">{{resource.streamId ? "stream" : "project"}}</div>
              <div class="md-layout-item md-caption">Last modified: <strong><timeago :datetime='resource.updatedAt'></timeago></strong></div>
              <div class="md-layout-item md-size-30 text-right">
                <md-button class='md-accent md-icon-button' @click.native='deleteForever( resource )'>
                  <md-icon>delete_forever</md-icon>
                </md-button>
                <md-button class='md-primary md-raised' @click.native='restore( resource )'>
                  restore
                </md-button>
              </div>
            </md-card-content>
          </md-card>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ProjectCard from '../components/ProjectCard.vue'

export default {
  name: 'TrashView',
  components: {
    ProjectCard
  },
  computed: {
    projects( ) {
      return this.$store.state.projects.filter( p => p.deleted === true )
    },
    streams( ) {
      return this.$store.state.streams.filter( s => s.deleted === true )
    },
    allResources( ) {
      return [ ...this.streams, ...this.projects ].sort( ( a, b ) => {
        return new Date( b.updatedAt ) - new Date( a.updatedAt );
      } )
    },
    allResourcesFiltered( ) {
      if ( this.filterText === '' ) return this.allResources
      return this.allResources.filter( r => r.name.toLowerCase( ).includes( this.filterText.toLowerCase( ) ) ).sort( ( a, b ) => a.updatedAt > b.updatedAt )
    }
  },
  data( ) {
    return {
      filterText: ''
    }
  },
  methods: {
    deleteForever( resource ) {
      if ( resource.streamId )
        this.$store.dispatch( 'deleteStream', { streamId: resource.streamId } )
      else
        this.$store.dispatch( 'deleteProject', { _id: resource._id } )
    },
    restore( resource ) {
      if ( resource.streamId )
        this.$store.dispatch( 'updateStream', { streamId: resource.streamId, deleted: false } )
      else
        this.$store.dispatch( 'updateProject', { _id: resource._id, deleted: false } )
    }
  },
  created( ) {}
}

</script>
<style scoped lang='scss'>
.md-field label {
  opacity: 0.5;
}

.main-toolbar {
  position: -webkit-sticky;
  /* Safari */
  position: sticky;
  top: 0;
  width: 100%;
  background-color: white;
  z-index: 100;
  margin-bottom: 30px;
}

.md-field {
  margin: 0 !important;
}

</style>
