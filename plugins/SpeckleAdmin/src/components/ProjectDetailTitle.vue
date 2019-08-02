<template>
  <md-card class='md-elevation-0 title-card'>
    <md-card-content>
      <h1 class='md-display-1'>
      <router-link to='/projects'>Projects</router-link> /
      <editable-span v-if='canEdit' :text='project.name' @update='updateName'></editable-span>
      <span v-else>{{project.name}}</span>
    </h1>
      <p>
        <md-chip class='md-primary'>projectId: <span style="user-select:all">
        <strong>{{project._id}}</strong></span>
        </md-chip>
        <div class='md-xlarge-hide md-large-hide md-medium-hide md-small-hide'><br>&nbsp</div>
        <md-chip class=''>
          <span v-if='canEdit'><md-icon>lock_open</md-icon> you can edit</span>
          <span v-else><md-icon>lock</md-icon> you cannot edit</span>
        </md-chip>
      </p>
      <md-divider></md-divider>
      <md-chips v-model="project.tags" @input='updateTags' md-placeholder="add tags" class='stream-chips' md-disabled='!canEdit'></md-chips>
    </md-card-content>
  </md-card>
</template>
<script>
import debounce from 'lodash.debounce'

export default {
  name: 'HelloWorld',
  props: {
    project: Object
  },
  computed: {
    canEdit( ) {
      return this.project.owner === this.$store.state.user._id || this.project.canWrite.indexOf( this.$store.state.user._id ) > -1
    },
  },
  data( ) { return {} },
  methods: {
    updateName( args ) {
      this.$store.dispatch( 'updateProject', { _id: this.project._id, name: args.text } )
    },
    updateTags: debounce( function( e ) {
      this.$store.dispatch( 'updateProject', { _id: this.project._id, tags: this.project.tags } )
    }, 1000 ),
  }
}

</script>
<style scoped lang='scss'>
.title-card {
  margin-left: 0;
  margin-right: 0;
}

.project-name {
  transition: all 0.2s ease;
}

.project-name:hover {
  color: #448aff;
}

</style>
