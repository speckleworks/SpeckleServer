<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-autocomplete box label='select a property to group objects by' clearable v-model="groupKey" :items="allKeys"></v-autocomplete>
      <v-text-field v-show='isTextProperty' label="filter" v-model='filterText' hint='Search through the layers below' append-icon='filter_list' clearable></v-text-field>
    </v-flex>
    <!--     <v-flex xs12 v-if='$store.getters["hasStructuralProperties"]'>
      <v-btn block>Show structural</v-btn>
    </v-flex> -->
    <v-flex xs12 v-if='isTextProperty && groupKey'>
      <v-card v-for='group in myFilteredGroups' :key='group.name' :class='`mb-3 ${ group.isolated ? "elevation-15" : "elevation-1"} ${ group.visible ? "elevation-1" : "elevation-0" }`' v-if='group.objects.length>0'>
        <v-card-text>
          <v-layout align-center>
            <v-flex xs2>
              <v-avatar size="20" :color="getHexFromString(group.name)"></v-avatar>
            </v-flex>
            <v-flex class='caption text-truncate'>
              <b>{{group.name}}</b>&nbsp;<span class='font-weight-light'>({{group.objects.length}} objects)</span>
            </v-flex>
            <v-flex xs4 class='text-xs-right'>
              <v-btn flat icon small @click.native='toggleVisible(group.name)' :color='group.visible ? "":"grey"'>
                <v-icon>remove_red_eye</v-icon>
              </v-btn>
              <v-btn flat icon small @click.native='toggleIsolation(group.name)' :color='group.isolated ? "":"grey"'>
                <v-icon>location_searching</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-flex>
    <v-flex xs12 v-if='!isTextProperty && groupKey'>
      <v-card :class='`mb-3 ${ orphanGroup.isolated ? "elevation-15" : "elevation-1"} ${ orphanGroup.visible ? "elevation-1" : "elevation-0" }`' v-if='orphanGroup'>
        <v-card-text>
          <v-layout align-center>
            <v-flex xs1>
              <!-- <v-avatar size="20" :color="getHexFromString(orphanGroup.name)"></v-avatar> -->
            </v-flex>
            <v-flex class='caption'>
              <b>{{orphanGroup.name}}</b>&nbsp;<span class='font-weight-light'>({{orphanGroup.objects.length}} objects)</span>
            </v-flex>
            <v-flex xs4 class='text-xs-right'>
              <v-btn flat icon small @click.native='toggleVisible(orphanGroup.name)' :color='orphanGroup.visible ? "":"grey"'>
                <v-icon>remove_red_eye</v-icon>
              </v-btn>
              <v-btn flat icon small @click.native='toggleIsolation(orphanGroup.name)' :color='orphanGroup.isolated ? "":"grey"'>
                <v-icon>location_searching</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
      <!-- <v-divider></v-divider> -->
      <v-card class='' v-if='groupKey !== undefined && !isTextProperty && $store.state.legend' xxxv-if="$store.state.legend && selectedRange.length !== 0">
        <v-card-text v-if='selectedRange'>
          <h1 class='font-weight-light'>Min: <b>{{selectedRange[0].toLocaleString()}}</b>, Max: <b>{{selectedRange[1].toLocaleString()}}</b></h1>
        </v-card-text>
        <v-card-text>
          <v-layout align-center row wrap>
            <v-flex xs-12 pa-2 v-if='legend.isNumeric'>
              <v-range-slider v-model="selectedRange" :max="$store.state.legend.max" :min="$store.state.legend.min" :step="0" @end='filterProp'></v-range-slider>
            </v-flex>
            <v-flex xs12 class='caption' v-if='$store.state.legend'>
              Legend key: <b>{{groupKey}}</b><br> min: <b>{{$store.state.legend.min}}</b>, max: <b>{{$store.state.legend.max}}.</b>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import get from 'lodash.get'
export default {
  name: 'ObjectGroups',
  props: {
    groupKeySeed: {
      type: String,
      default: null
    }
  },
  watch: {
    groupKeySeed( newVal, oldVal ) {
      if ( newVal !== null && this.init === false ) {
        this.init = true
        this.groupKey = newVal
      }
    },
    groupKey: {
      immediate: true,
      handler( newVal, oldVal ) {
        if ( newVal === null ) return
        console.log( "TEST " + newVal )
        this.filterText = ''
        window.renderer.showObjects( [ ] )

        window.renderer.resetColors( { propagateLegend: true } )

        if ( this.structuralKeys.indexOf( newVal ) !== -1 ) {
          console.log( 'its a structural propertyyyyyy' )
          this.generateGroups( 'structural.result.' + newVal )
          this.appendInfoToUrl( "groups", { key: newVal } )
          window.renderer.colorByVertexArray( { propertyName: newVal, colors: this.rainbowColors } )
          return
        }

        if ( newVal ) {
          this.generateGroups( newVal )
          this.appendInfoToUrl( "groups", { key: newVal } )
          window.renderer.colorByProperty( { propertyName: newVal, propagateLegend: true, colors: this.coolColors } )
        }

        if ( newVal === undefined ) {
          this.appendInfoToUrl( "groups", null )
          window.renderer.showObjects( [ ] )
        }

      }
    },
    legend: {
      handler: function ( newVal, oldVal ) {
        if ( !newVal ) return
        this.min = this.$store.state.legend.min
        this.max = this.$store.state.legend.max
        this.selectedRange = [ this.min, this.max ]
      },
      deep: true
    }
  },
  computed: {
    myFilteredGroups( ) {
      let filteredGroups = {}
      if ( !this.filterText || this.filterText === '' ) return this.myGroups
      return this.myGroups.filter( gr => gr.name.toLowerCase( ).includes( this.filterText.toLowerCase( ) ) )
    },
    orphanGroup( ) {
      let orphans = this.myGroups.find( gr => gr.name === "Orphaned Objects" )
      return orphans
      // return this.myGroups[ 0 ] ? this.myGroups[ 0 ] : null
    },
    keys( ) {
      return this.$store.getters.objectPropertyKeys
    },
    allKeys( ) {
      return [ ...this.$store.getters.objectPropertyKeys.allKeys, ...this.$store.getters.structuralKeys ]
    },
    structuralKeys( ) {
      return this.$store.getters.structuralKeys
    },
    isTextProperty( ) {
      return this.keys.stringKeys.indexOf( this.groupKey ) !== -1
    },
    legend( ) {
      return this.$store.state.legend
    }
  },
  data( ) {
    return {
      groupKey: null,
      myGroups: [ ],
      loading: false,
      filterText: null,
      selectedRange: [ 0, 1000 ],
      rainbowColors: [ "#9400D3", "#4B0082", "#0000FF", "#00FF00", "#FFFF00", "#FF7F00", "#FF0000" ],
      coolColors: [ "#0A66FF", "#FF008A" ],
      init: false
    }
  },
  methods: {
    generateGroups( key ) {
      this.myGroups = [ ]
      this.loading = true

      let groups = { orphans: { key: 'orphans', name: 'Orphaned Objects', objects: [ ], visible: true, isolated: false } }

      if ( this.isTextProperty ) {

        this.$store.state.objects.forEach( ( obj, index ) => {
          let propValue = get( obj.properties, key )
          if ( propValue ) {
            // if we have the group already
            if ( groups.hasOwnProperty( propValue ) ) {
              groups[ propValue ].objects.push( obj._id )
            } else {
              groups[ propValue ] = {
                key: key,
                name: propValue,
                objects: [ obj._id ],
                visible: true,
                isolated: false
              }
            }
          } else {
            groups.orphans.objects.push( obj._id )
          }
          if ( index === this.$store.state.objects.length - 1 ) {
            this.loading = false
          }
        } )

      }
      Object.keys( groups ).forEach( key => this.myGroups.push( groups[ key ] ) )
    },
    filterProp( ) {
      let objIds = [ ]

      this.$store.state.objects.forEach( ( obj, index ) => {
        let propValue = get( obj.properties, this.groupKey )
        if ( propValue )
          if ( propValue >= this.selectedRange[ 0 ] && propValue <= this.selectedRange[ 1 ] )
            objIds.push( obj._id )


        if ( index === this.$store.state.objects.length - 1 ) {
          if ( this.myGroups[ 0 ] && this.myGroups[ 0 ].visible )
            objIds = [ ...objIds, ...this.myGroups[ 0 ].objects ]

          window.renderer.isolateObjects( objIds )
          window.renderer.resetColors( { propagateLegend: false } )
          window.renderer.colorByProperty( { propertyName: this.groupKey, propagateLegend: false, colors: this.coolColors } )
        }
      } )
    },
    toggleVisible( groupName ) {
      let group = this.myGroups.find( gr => gr.name === groupName )
      if ( group.visible ) {
        window.renderer.hideObjects( group.objects )
        group.visible = false
      } else {
        window.renderer.showObjects( group.objects )
        group.visible = true
      }
    },
    toggleIsolation( groupName ) {
      let group = this.myGroups.find( gr => gr.name === groupName )
      if ( group.isolated ) {
        window.renderer.showObjects( [ ] )
        group.isolated = false
      } else {
        group.visible = true
        group.isolated = true
        window.renderer.isolateObjects( group.objects )
      }

      this.myGroups.forEach( gr => {
        if ( gr.name === groupName ) return
        if ( group.isolated ) {
          gr.isolated = false
          gr.visible = false
        } else {
          gr.visible = true
          window.renderer.showObjects( gr.objects )
        }
      } )
    },

  },
  mounted( ) {
    // console.log( 'mounted - object groups' )
    // console.log( this.groupKeySeed )
    // if ( this.groupKeySeed !== null ) {
    //   this.groupKey = this.groupKeySeed
    // }
  },
  activated( ) {
    if ( this.groupKey ) {
      this.appendInfoToUrl( "groups", { key: this.groupKey } )
    }
  }
}

</script>
<style scoped lang='scss'>
</style>
