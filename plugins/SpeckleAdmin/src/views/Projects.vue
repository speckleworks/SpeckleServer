<template>
  <div>
    <md-empty-state md-icon="business" md-label="" md-description="By creating a project, you'll be able to group streams together and share them with a team." v-if='projects.length === 0'>
      <md-button class="md-primary md-raised" @click.native='createProject'>Create your first project!</md-button>
    </md-empty-state>
    <div class='md-layout' v-else>
      <md-card class="md-elevation-0 md-layout-item md-size-100">
        <md-card-content>
          <h1 class='md-display-2'>Projects</h1>
          <p>Projects allow you to group streams together with a team of users.</p>
        </md-card-content>
      </md-card>
      <md-card class="md-primary-xx main-toolbar md-elevation-3">
        <md-card-content class='md-layout md-alignment-center-space-between'>
          <div class="md-layout-item md-size-95 md-small-size-70">
            <md-field md-clearable>
              <md-icon>search</md-icon>
              <label>search by name</label>
              <md-input @input="" spellcheck="false"></md-input>
            </md-field>
          </div>
          <div class="md-layout-item md-size-5 md-small-size-30 text-right">
            <md-button class='md-icon-button md-raised md-primary' @click.native='createProject'>
              <md-icon>add</md-icon>
            </md-button>
          </div>
        </md-card-content>
      </md-card>
      <div class='md-layout-item md-small-size-100 md-medium-size-50 md-large-size-50 md-xlarge-size-33' v-for='project in projects'>
        <project-card :resource='project'></project-card>
      </div>
    </div>
  </div>
</template>
<script>
import ProjectCard from '../components/ProjectCard.vue'

export default {
  name: 'ProjectsView',
  components: {
    ProjectCard
  },
  computed: {
    projects( ) {
      return this.$store.state.projects.filter( p => p.deleted === false )
    }
  },
  data( ) {
    return {

    }
  },
  methods: {
    createProject( ) {
      this.$store.dispatch( 'createProject', { name: 'A brand new speckle project' } )
        .then( res => {
          this.$router.push( `/projects/${res._id}` )
        } )
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
