<template>
  <div class='md-layout layer md-alignment-center-space-between' v-if='layer'>
    <div class="md-layout-item md-size-20 md-body-2" style="padding-left:12px; box-sizing:border-box;">
      <span class="md-caption">Name: </span><editable-span :text='layer.name' :data-key='layer.guid' @update='updateName'></editable-span>
    </div>
    <div class="md-layout-item md-size-60" style="box-sizing: border-box; padding-left: 10px">
      <md-field v-if='!expanded'>
        <label>data</label>
        <md-input v-model='rawData'></md-input>
      </md-field>
    </div>
    <div class="md-layout-item md-size-10 text-right">
      <md-button class='md-icon-button md-dense md-primary' @click.native='expanded=!expanded'>
        <md-icon>{{ expanded ? "expand_less" : "expand_more" }}</md-icon>
      </md-button>
      <md-button class='md-icon-button md-dense md-accent' @click.native='removeLayer()'>
        <md-icon>delete_forever</md-icon>
      </md-button>
    </div>
    <div class='md-layout-item md-size-100 md-layout md-gutter' style="box-sizing: border-box; padding: 10px" v-if='expanded'>
      <div class="md-layout-item md-size-100">
        <md-switch v-model="splitArray">{{splitArray ? "split at commas" : "single"}}</md-switch>
      </div>
      <div class="md-layout-item md-size-50">
        <md-field>
          <label>data</label>
          <md-textarea v-model='rawData'></md-textarea>
        </md-field>
      </div>
      <div class="md-layout-item md-size-50">
        <span class='md-caption'>Parsed data:</span>
        <pre>{{parsedData}}</pre>
      </div>
    </div>
  </div>
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
    __emitUpdate() {
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
