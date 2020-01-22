<template>
  <v-layout row wrap align-center class='pa-2 my-5'>
    <v-flex xs12 md3 mb-3>
      <v-btn icon @click.native='removeLayer()'>
        <v-icon>delete_forever</v-icon>
      </v-btn>
      <span class='subheading font-weight-lightxxx'>
        <editable-span :text='layer.name' :data-key='layer.guid' @update='updateName'></editable-span>
      </span>
    </v-flex>
    <v-flex xs12 md9 pl-2>
      <v-text-field box v-model='rawData' :label='`Layer "${layer.name}" data`' hint='values will be separated by commas and parsed into their natural types (strings, numbers, booleans)' />
    </v-flex>
    <v-flex xs12>
      <v-divider></v-divider>
    </v-flex>
  </v-layout>
</template>
<script>
import debounce from 'lodash.debounce'

export default {
  name: 'StreamLayer',
  props: {
    layer: Object,
  },
  watch: {
    speckledData( ) {
      if ( this.firstCall ) return this.firstCall = false
      this.emitUpdate( )
    },
    layer( newValue ) {
      this.rawData = this.layer.objects.join( ', ' )
    }
  },
  computed: {
    speckledData( ) {
      // No need to generate hashes here as the server will generate them for us
      if ( !this.parsedData ) return [ ]
      let specklObjects = this.parsedData.map( val => {
        if ( val === 'the meaning of life' )
          return { type: 'Number', value: 42 } // lol
        if ( val === '0' )
          return { type: 'Number', value: 0 }
        if ( typeof val === 'boolean' )
          return { type: "Boolean", value: val }
        if ( typeof val === 'string' )
          return { type: "String", value: val } // TODO: Hash it please
        if ( typeof val === 'number' )
          return { type: "Number", value: val } // TODO: Hash it please
      } )
      return specklObjects
    },
    parsedData( ) {
      if ( !this.rawData ) return null
      let parsedData = [ ]
      if ( this.splitArray ) {
        parsedData = this.rawData.split( ',' ).map( s => s.trim( ) ).map( s => {
          let retVal = null
          retVal = parseFloat( s )
          if ( !retVal )
            retVal = s === 'true' ? true : ( s === 'false' ? false : s )
          return retVal
        } )
      } else
        parsedData = [ this.rawData ]
      return parsedData
    },
    // rawData() {
    //   return this.layer.objects
    // }
  },
  data( ) {
    return {
      rawData: '',
      expanded: false,
      splitArray: true,
      firstCall: true,
    }
  },
  methods: {
    removeLayer( ) {
      this.$emit( "remove", this.layer )
    },
    updateName( args ) {
      this.layer.name = args.text.trim( )
      this.emitUpdate( )
    },
    __emitUpdate( ) {
      this.$emit( 'update', { layer: this.layer, objects: this.speckledData } )
    },
    emitUpdate: debounce( function( ) {
      this.$emit( 'update', { layer: this.layer, objects: this.speckledData } )
    }, 1000 )
  },
  created( ) {
    // console.log('created layer')
    // console.log(this.layer.objects.join(', '))
    this.rawData = this.layer.objects.join( ', ' )
  }
}

</script>
<style scoped lang='scss'>
pre {
  font-size: 12px;
  line-height: 14px;
  padding: 5px;
  box-sizing: border-box;
  background-color: ghostwhite;
}

.layer {
  padding-top: 15px;
  padding-bottom: 15px;
  background-color: white;
  transition: all .3s ease;
  border-top: 1px solid #E6E6E6;
}

.layer:hover {
  background-color: #F4F4F4
}

</style>
