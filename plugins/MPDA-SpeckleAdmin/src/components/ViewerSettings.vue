<template>
  <v-layout row wrap>
    <v-list>
      <v-switch color="primary" v-model="castShadows" label="Shadows"></v-switch>
      <v-switch color="primary" v-model="showEdges" label="Show Edges"></v-switch>
      <v-slider v-show='showEdges' thumb-label min='0' max='180' step='1' v-model='edgesThreshold' label='Edge Display Threshold' />
      <v-slider min='0' thumb-label max='100' v-model='meshMaterialOpacity' label='Opacity' />
      <v-slider min='0' thumb-label max='100' v-model='meshMaterialSpecular' label='Specular' />
      </v-list-group>
    </v-list>
  </v-layout>
</template>
<script>
import debounce from 'lodash.debounce'

export default {
  name: "ViewerSettings",
  computed: {
    showEdges: {
      get( ) {
        return this.$store.state.viewer.showEdges
      },
      set( value ) {
        this.$store.commit( "TOGGLE_EDGES", value )
        this.$emit( 'update' )
      }
    },
    edgesThreshold: {
      get( ) {
        return this.$store.state.viewer.edgesThreshold
      },
      set: debounce( function ( value ) {
        this.$store.commit( "SET_EDGES_THRESHOLD", value )
        this.$emit( 'update' )
      }, 400 )
      // ( value ) {
      //   this.$store.commit( "SET_EDGES_THRESHOLD", value )
      //   this.$emit('update')
      // }
    },
    castShadows: {
      get( ) {
        return this.$store.state.viewer.castShadows
      },
      set( value ) {
        this.$store.commit( "TOGGLE_SHADOWS", value )
        this.$emit( 'update' )
      }
    },
    meshMaterialOpacity: {
      get( ) {
        return this.$store.state.viewer.meshOverrides.opacity
      },
      set( value ) {
        this.$store.commit( "SET_MESH_OPACITY", value )
        this.$emit( 'update' )
      }
    },
    meshMaterialSpecular: {
      get( ) {
        return this.$store.state.viewer.meshOverrides.specular
      },
      set( value ) {
        this.$store.commit( "SET_MESH_SPECULAR", value )
        this.$emit( 'update' )
      }
    }
  },
  data( ) {
    return {}
  },
  watch: {
    showEdges( ) {

    },
    castShadows( ) {}
  }
}

</script>
<style scoped>
.v-input--selection-controls {
  margin-top: 0px;
}

</style>
