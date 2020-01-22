<template>
  <div class='transparent'>
    <vue-json-pretty :data='theObject' :deep='2' highlight-mouseover-node show-length :show-line='false' :show-double-quotes='false'></vue-json-pretty>
    <br>
    <v-divider></v-divider>
    <br>
  </div>
</template>
<script>
import VueJsonPretty from 'vue-json-pretty'

export default {
  name: 'ObjectDetails',
  components: { VueJsonPretty },
  props: {
    json: Object,
  },
  computed: {
    theObject() {
      return this.removeArraysRecursive( this.json )
    }
  },
  data( ) {
    return {}
  },
  methods: {
    removeArraysRecursive( foo ) {
      let bar = {}

      for ( let key in foo ) {
        if ( !foo.hasOwnProperty( key ) ) continue
        if( key.includes('__')) {
          /*SKIP*/
        }
        else if ( Array.isArray( foo[ key ] ) ) {
          /*DO FUCKALL */
          if( foo[key].length < 3 )
            bar[key] = foo[key]
          else {
            bar[key] = [ ...foo[key].slice(0, 3), `... (${foo[key].length - 3} more values)` ]
          }
        } else if ( typeof foo[ key ] === 'object' && foo[ key ] !== null ) {
          bar[ key ] = this.removeArraysRecursive( foo[ key ] )
        } else {
          bar[ key ] = foo[ key ]
        }
      }
      return bar
    }
  }
}

</script>
<style lang='scss'>
.vjs-tree.is-mouseover {
  background-color: rgba(255, 0, 0, 0.001) !important;
}

.vjs-tree {
  font-size: 12px !important;
}

.vjs-tree:hover {
  background-color: rgba(230, 247, 255, 0.02) !important;
}

</style>
