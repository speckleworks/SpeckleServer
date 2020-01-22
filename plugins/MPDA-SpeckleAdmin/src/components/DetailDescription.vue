<template>
  <v-card v-if='resource' class='elevation-0'>
    <v-toolbar class='elevation-0 transparent'>
      <v-icon left small>book</v-icon>
      <span class='title font-weight-light'>{{title}} Description</span>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat color='primary' v-if='editDescription===false && canEdit' @click.native='editDescription=true'>Edit</v-btn>
        <v-btn flat color='primary' v-if='editDescription===true' @click.native='updateDescription'>Done</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-divider></v-divider>
    <v-card-text>
      <v-layout v-show='!editDescription'>
        <v-flex xs12 v-html='compiledDescription'></v-flex>
      </v-layout>
      <v-layout v-show='editDescription' row wrap>
        <v-flex xs12 class="caption">
          Supports <a class='' target="_blank" href='https://en.wikipedia.org/wiki/Markdown#Example'>markdown:</a><strong> ** bold **</strong>, <i>* italic *</i>, <code># Heading 1</code>, <code>## Heading 2</code>, <code>[links](http://example.com)</code>, etc.
        </v-flex>
        <v-flex xs12>
          <v-textarea box rows='15' v-model="resource.description"></v-textarea>
        </v-flex>
        </md-field>
      </v-layout>
    </v-card-text>
     <v-toolbar transparent class='elevation-0 transparent' dense v-if='isStream'>
      <v-icon left small>power_input</v-icon>
      <span class='title font-weight-light'>Units</span>
     </v-toolbar>
     <v-divider></v-divider>
    <v-card-text class='md-caption' v-if='resource.baseProperties'>
      <span><strong>Units:</strong> {{resource.baseProperties.units}}</span>;
      <span><strong>Tolerance:</strong> {{resource.baseProperties.tolerance}}</span>.
    </v-card-text>
  </v-card>
</template>
<script>
import debounce from 'lodash.debounce'
import marked from 'marked'

export default {
  name: 'DetailDescription',
  props: {
    resource: Object,
  },
  computed: {
    title ( ) {
      if ( this.isStream ) return "Stream"
      else if ( this.isProcessor ) return "Processor"
      else return "Project"
    },
    compiledDescription( ) {
      return marked( this.resource.description, { sanitize: true } )
    },
    canEdit( ) {
      if (this.$store.state.user.role == 'admin') return true
      return this.isOwner ? true : this.resource.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.resource.owner === this.$store.state.user._id
    },
    isStream( ) {
      return this.resource.hasOwnProperty( 'streamId' )
    },
    isProcessor( ) {
      return this.resource.hasOwnProperty( 'blocks' )
    }
  },
  data( ) {
    return {
      editDescription: false
    }
  },
  methods: {
    updateDescription( ) {
      this.editDescription = false
      if ( this.isStream )
        this.$store.dispatch( 'updateStream', { streamId: this.resource.streamId, description: this.resource.description } )
      else if ( this.isProcessor )
        this.$store.dispatch( 'updateProcessor', { _id: this.resource._id, description: this.resource.description } )
      else
        this.$store.dispatch( 'updateProject', { _id: this.resource._id, description: this.resource.description } )
    },
  }
}

</script>
<style scoped lang='scss'>
</style>
