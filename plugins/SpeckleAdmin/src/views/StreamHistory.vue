<template>
  <div>
    <md-card class='md-elevation-3' md-with-hover>
      <md-card-header class='bg-ghost-white' v-if='stream.parent'>
        <md-card-header-text>
          <div class="md-title"><router-link :to='"/streams/" + stream.parent'>Parent: {{stream.parent}}</router-link></div>
        </md-card-header-text>
      </md-card-header>
      <md-card-header class='bg-ghost-white' v-if='stream.children.length>0'>
        <md-card-header-text>
          <div class="md-title">History</div>
        </md-card-header-text>
      </md-card-header>
      <md-card-content class='md-layout md-center-center' v-if='stream.children.length>0'>
        <div class="md-layout-item md-size-100 md-caption" style="height:50px">&nbsp</div>
        <div class="md-layout-item md-size-15 md-small-hide md-caption" style=''>Oldest</div>
        <div class="md-layout-item md-size-70 md-small-size-100 md-caption">
          <vue-slider ref="timeSlider" lazy @callback='sliderChanged' :data='dates' v-model='sliderValue' piecewise process-dragable :piecewise-label='dates.length < 5 ? true : false' xxxwidth='100%' xxxstyle='margin-left:10%;' :tooltipStyle="{ 'font-size':'11px' }" v-if='streamChildren.length>0'></vue-slider>
        </div>
        <div class="md-layout-item md-size-15 md-small-hide md-caption text-right">Latest</div>
        <div class="md-layout-item md-size-100 md-caption" style="height:10px">&nbsp</div>
        <div class="md-layout-item md-size-100 md-caption">Showing first {{currentMax > sizeBound.length ? sizeBound.length : currentMax}} out of {{timeFiltered.length}} streams in the specified time range.<br>&nbsp</div>
        <div class='md-layout-item md-size-100 md-layout' v-for='stream in sizeBound'>
          <div class="md-layout-item md-caption">
            <timeago :datetime='stream.updatedAt'></timeago>
          </div>
          <div class="md-layout-item md-caption">
            <router-link :to='"/streams/" + stream.streamId'>{{stream.streamId}}</router-link>
          </div>
          <div class="md-layout-item md-caption">
            {{stream.name}}
          </div>
          <div class="md-layout-item md-caption">
            {{stream.commitMessage ? stream.commitMessage : 'no commit message'}}
          </div>
          <div class="md-layout-item md-size-100" style="margin-top:10px;padding-bottom: 10px">
            <md-divider></md-divider>
          </div>
        </div>
        <!-- <stream-detail-history :stream='stream'></stream-detail-history> -->
      </md-card-content>
      <md-card-content v-else>
        <br>
        <p>This stream has no children.</p>
      </md-card-content>
    </md-card>
  </div>
</template>
<script>
import Axios from 'axios'
import debounce from 'lodash.debounce'
import union from 'lodash.union'

import VueSlider from 'vue-slider-component'
export default {
  name: 'StreamHistory',
  components: {
    VueSlider
  },
  watch: {
    'stream.children'() {
      this.fetchData()
    }
  },
  computed: {
    sizeBound( ) {
      return this.timeFiltered.slice( 0, this.currentMax ).reverse()
    },
    timeFiltered( ) {
      return this.streamChildren.slice( this.lowerIndex, this.upperIndex + 1 )
    },
    stream( ) {
      return this.$store.state.streams.find( s => s.streamId === this.$route.params.streamId )
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
      streamChildren: [ ],
      dates: [ ],
      sliderValue: [ ],
      lowerIndex: 0,
      upperIndex: 0,
      currentMax: 20
    }
  },
  methods: {
    sliderChanged( args ) {
      console.log( args )
      let ind = this.$refs.timeSlider.getIndex( )
      this.lowerIndex = ind[ 0 ]
      this.upperIndex = ind[ 1 ]
    },
    fetchData( ) {
      if ( !this.stream.children ) return
      if ( this.stream.children.length === 0 ) return

      this.stream.children.map( streamId => Axios.get( `streams/${streamId}?fields=streamId,updatedAt,owner,name,commitMessage` ) )
        .reduce( ( promiseChain, currentTask ) => {
          return promiseChain.then( chainResults => currentTask.then( currentResult => [ ...chainResults, currentResult.data.resource ] ) )
        }, Promise.resolve( [ ] ) ).then( arr => {
          this.streamChildren = arr
          this.streamChildren.push( this.stream )
          this.dates = this.streamChildren
            .map( c => c.updatedAt )
            .sort( ( a, b ) => new Date( b.updatedAt ) - new Date( a.updatedAt ) )
            .map( d => ( new Date( d ) ).toLocaleString( 'en' ) )
          this.sliderValue = [ this.dates[ 0 ], this.dates[ this.dates.length - 1 ] ]
          this.lowerIndex = 0
          this.upperIndex = this.dates.length - 1
        } )
    }
  },
  mounted( ) {
    console.log( 'hello data' )
    let stream = this.$store.state.streams.find( s => s.streamId === this.$route.params.streamId )
    this.fetchData( this.$route.params.streamId )
  }
}

</script>
<style lang='scss'>
.vue-slider-piecewise {
  z-index: 100 !important;
  pointer-events: none;
}

.vue-slider-piecewise-item {
  z-index: 100 !important;
}

</style>
