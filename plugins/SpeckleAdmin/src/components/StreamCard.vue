<template>
  <md-card md-with-hover :class="{'stream-card':true, 'selected':selected}">
    <md-card-header @click='selected=!selected'>
      <md-card-header-text>
        <router-link :to='"/streams/"+stream.streamId'>
          <div class="md-title">{{stream.name}}</div>
          <div class="md-subhead" stlye='user-select:all;'>{{stream.streamId}}</div>
          <div class="md-caption md-small-hide" v-html='compiledDescription'></div>
        </router-link>
      </md-card-header-text>
      <md-checkbox v-model="selected" value="1" @click.native='$emit("selected", stream)'></md-checkbox>
    </md-card-header>
    <md-card-content>
      <div class="md-layout md-alignment-center-center">
        <div class="md-layout-item md-size-10">
          <md-icon>access_time</md-icon>
        </div>
        <div class="md-layout-item md-caption">
          <strong><timeago :datetime='stream.updatedAt'></timeago></strong>
        </div>
        <div class="md-layout-item md-size-10">
          <md-icon>create</md-icon>
        </div>
        <div class="md-layout-item md-caption">
          {{createdAt}}
        </div>
        <div class='md-layout-item md-size-100 md-small-hide'>
          <md-chips v-model="stream.tags" @input='updateTags' md-placeholder="add tags" class='stream-chips'></md-chips>
        </div>
      </div>
    </md-card-content>
    <md-card-actions>
      <md-button class='md-accent' @click.native='deleteStream' v-show='isOwner'>Archive</md-button>
      <md-button class='md-raised-xxx' :to='"/streams/"+stream.streamId'>Details</md-button>
    </md-card-actions>
    <!-- {{stream.streamId}} -->
  </md-card>
</template>
<script>
import debounce from 'lodash.debounce'
import marked from 'marked'

export default {
  name: 'StreamCard',
  props: {
    stream: Object
  },
  watch: {
    selected( ) { this.$emit( "selected", this.stream ) }
  },
  computed: {
    createdAt( ) {
      let date = new Date( this.stream.createdAt )
      return date.toLocaleString( 'en', { year: 'numeric', month: 'long', day: 'numeric' } )
    },
    compiledDescription( ) {
      return marked( this.stream.description.substring( 0, 220 ) + ' ...', { sanitize: true } )
    },
    canEdit( ) {
      return this.isOwner ? true : this.stream.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.stream.owner === this.$store.state.user._id
    }
  },
  data( ) {
    return {
      selected: false,
    }
  },
  methods: {
    deleteStream( ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, deleted: true } )
      this.$emit( 'deleted' )
    },
    updateTags: debounce( function( e ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, tags: this.stream.tags } )
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

.selected .md-card-header {
  /*background-color: #CCCCCC !important;*/
}

/*.selected .xx-md-card-content, .selected .md-card-header, .selected .xxx-md-card-actions {
  background-color: #CCCCCC !important;
}*/

i {
  color: #4C4C4C;
}

</style>
