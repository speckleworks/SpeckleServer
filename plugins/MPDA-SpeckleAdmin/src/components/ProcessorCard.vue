<template>
  <v-card :class="{'elevation-10':selected, 'elevation-1': true}">
    <v-card-title>
      <span class='title font-weight-light'>{{resource.name ? resource.name : "No Name"}}</span>
      <v-spacer></v-spacer>
      <span></span>
      <span>
        <v-checkbox color='primary' v-model="selected"></v-checkbox>
      </span>
    </v-card-title>
    <v-divider class='mx-0 my-0'></v-divider>
    <v-layout row wrap>
      <v-flex xs12 ma-2 v-if='resource.tags && resource.tags.length > 0'>
        <v-chip small outline v-for='tag in resource.tags' :key='tag'>{{tag}}</v-chip>
      </v-flex>
      <v-flex xs12 ma-2>
        <div class="md-caption md-small-hide" v-html='compiledDescription'> </div>
      </v-flex>
    </v-layout>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn depressed class='transparent' @click.native='deleteProcessor'>Delete</v-btn>
      <v-btn color='primary' :to='"/processors/"+resource._id'>Details</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import debounce from 'lodash.debounce'
import uniq from 'lodash.uniq'
import union from 'lodash.union'
import marked from 'marked'

export default {
  name: 'ProcessorCard',
  props: {
    resource: Object
  },
  watch: {
    selected( ) { this.$emit( "selected", this.processor ) }
  },
  computed: {
    processor( ) {
      return this.resource
    },
    createdAt( ) {
      let date = new Date( this.processor.createdAt )
      return date.toLocaleString( 'en', { year: 'numeric', month: 'long', day: 'numeric' } )
    },
    compiledDescription( ) {
      return marked( this.processor.description.substring( 0, 400 ) + ' ...', { sanitize: true } )
    },
  },
  data( ) {
    return {
      selected: false,
    }
  },
  methods: {
    deleteProcessor( ) {
      this.$store.dispatch( 'deleteProcessor', { _id: this.processor._id })
    },
    updateTags: debounce( function( e ) {
      this.$store.dispatch( 'updateProcessor', { _id: this.processor._id, tags: this.processor.tags } )
    }, 1000 )
  },
  mounted( ) {
    bus.$on( 'select-processor', id => {
      if ( id === this.processor._id ) this.selected = true
    } )
    bus.$on( 'unselect-all-processors', ( ) => {
      this.selected = false
    } )
  }
}

</script>
<style scoped lang='scss'>
</style>
