<template>
  <md-card md-with-hover :class="{'stream-card':true, 'selected':selected}">
    <md-card-header @click='selected=!selected'>
      <md-card-header-text>
        <router-link :to='"/projects/"+project._id'>
          <div class="md-title">{{project.name}}</div>
          <div class="md-subhead md-small-hide" stlye='user-select:all;'>{{project._id}}</div>
          <div class="md-caption md-small-hide" v-html='compiledDescription'></div>
        </router-link>
      </md-card-header-text>
      <!-- <md-checkbox v-model="selected" value="1" @click.native='$emit("selected", stream)'></md-checkbox> -->
    </md-card-header>
    <md-card-content>
      <div class="md-layout md-alignment-center-center">
        <div class="md-layout-item md-size-10">
          <md-icon>access_time</md-icon>
        </div>
        <div class="md-layout-item md-caption">
          <strong><timeago :datetime='project.updatedAt'></timeago></strong>
        </div>
        <div class="md-layout-item md-size-10">
          <md-icon>create</md-icon>
        </div>
        <div class="md-layout-item md-caption">
          {{createdAt}}
        </div>
        <div class="md-layout-item md-size-100" style="padding: 10px 0px;">
          <div class="md-layout md-alignment-center-left">
            <div class='md-layout-item md-size-10'>
              <md-icon>person</md-icon>
            </div>
            <div class='md-layout-item xxxmd-size-10 md-caption'>
              <strong>{{projectTeamMembers.length}}</strong> team members.
            </div>
            <div class='md-layout-item md-size-10'>
              <md-icon>import_export</md-icon>
            </div>
            <div class='md-layout-item xxxmd-size-25 md-caption'>
              <strong>{{project.streams.length}}</strong> streams.
            </div>
          </div>
        </div>
        <div class='md-layout-item md-size-100 md-small-hide'>
          <md-chips v-model="project.tags" @input='updateTags' md-placeholder="add tags" class='stream-chips'></md-chips>
        </div>
      </div>
    </md-card-content>
    <md-card-actions>
      <md-button class='md-accent' @click.native='archiveProject' v-show='isOwner'>Archive</md-button>
      <md-button class='md-raised-xxx' :to='"/projects/"+project._id'>More...</md-button>
    </md-card-actions>
    <!-- {{stream.streamId}} -->
  </md-card>
</template>
<script>
import debounce from 'lodash.debounce'
import uniq from 'lodash.uniq'
import union from 'lodash.union'
import marked from 'marked'

export default {
  name: 'ProjectCard',
  props: {
    resource: Object
  },
  watch: {
    selected( ) { this.$emit( "selected", this.project ) }
  },
  computed: {
    project( ) {
      return this.resource
    },
    projectTeamMembers( ) {
      return union( this.project.canRead, this.project.canWrite )
    },
    createdAt( ) {
      let date = new Date( this.project.createdAt )
      return date.toLocaleString( 'en', { year: 'numeric', month: 'long', day: 'numeric' } )
    },
    compiledDescription( ) {
      return marked( this.project.description.substring( 0, 400 ) + ' ...', { sanitize: true } )
    },
    canEdit( ) {
      return this.isOwner ? true : this.project.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.project.owner === this.$store.state.user._id
    }
  },
  data( ) {
    return {
      selected: false,
    }
  },
  methods: {
    archiveProject( ) {
      this.$store.dispatch( 'updateProject', { _id: this.project._id, deleted: true } )
      // this.$store.dispatch( 'updateStream', { _id: this.project._id, deleted: true } )
      // this.$emit( 'deleted' )
    },
    updateTags: debounce( function( e ) {
      this.$store.dispatch( 'updateProject', { _id: this.project._id, tags: this.project.tags } )
    }, 1000 )
  },
  mounted( ) {
    bus.$on( 'unselect-all', ( ) => {
      this.selected = false
    } )
  }
}

</script>
<style scoped lang='scss'>
.stream-chips:after {
  display: none !important;
}

.stream-chips:before {
  display: none !important;
}

.md-card-actions,
.md-card-header {
  background: ghostwhite;
}

.md-card-header {
  margin-bottom: 10px;
}

.stream-chips {
  margin-bottom: 0;
}

.stream-chips input {
  font-size: 10px;
}

.stream-card {
  margin-bottom: 20px;
}

i {
  color: #4C4C4C;
}

</style>
