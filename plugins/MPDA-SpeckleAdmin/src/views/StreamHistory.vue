<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card class='elevation-0'>
        <v-toolbar class='elevation-0 transparent' v-if='stream.parent'>
          <v-icon small left>home</v-icon>&nbsp;
          <span class="title font-weight-light">
            Parent stream: <router-link :to='"/streams/" + stream.parent'>{{stream.parent}}</router-link>
          </span>
        </v-toolbar>
        <v-toolbar class='elevation-0 transparent'>
          <v-icon small left>history</v-icon>&nbsp;
          <span class='title font-weight-light' v-if='stream.children.length>0'>
            Showing max 30 versions (total: {{streamChildren.length}} versions).
          </span>
          <span class='title font-weight-light' v-else>
            This stream has no history.
          </span>
        </v-toolbar>
        <v-layout row wrap>
          <v-flex xs12 pa-3>
            <v-timeline clipped dense>
              <v-timeline-item v-for="(stream, index) in sizeBound" :key="stream.streamId" small :color="hexFromString(stream.streamId)">
                <div :class='`${index===0 ? "elevation-5" : "elevation-0"} py-3 px-4`'>
                  <v-btn icon @click.native='$router.push(`/view/${stream.streamId}`)'>
                    <v-icon>360</v-icon>
                  </v-btn>
                  <span :class="`headline font-weight-bold ${hexFromString(stream.streamId)}--text`" v-if='index===0'>
                    Latest
                  </span>
                  <span :class="`headline ${index===0 ? 'font-weight-bold' : ''} ${hexFromString(stream.streamId)}--text`" v-else>
                    {{getDate(stream.createdAt)}} {{getTime(stream.createdAt)}}
                  </span>
                  <timeago :datetime='stream.updatedAt'></timeago>
                  <p :class="`xxxheadline font-weight-light mb-3 ${hexFromString(stream.streamId)}--text`">
                    <v-icon small>{{stream.private ? "lock" : "lock_open"}}</v-icon> &nbsp;
                    <v-icon small>fingerprint</v-icon> {{stream.streamId}}
                    <span class='text-capitalize font-weight-bold'>{{stream.name}}</span>
                  </p>
                  <div>
                    <v-combobox @input='updateTags({tags: stream.tags, streamId: stream.streamId})' v-model="stream.tags" :items='allTags' hint='tags' solo persistent-hint small-chips deletable-chips multiple tags>
                      <template v-slot:no-data>
                        <p>Add a new tag!</p>
                      </template>
                    </v-combobox>
                    {{stream.commitMessage ? stream.commitMessage : "No commit message."}}
                  </div>
                  <v-divider class='my-3'></v-divider>
                  <div v-if='stream.diffResult'>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <span class='green--text' v-on="on">
                          <v-icon small class='green--text'>add_circle_outline</v-icon><b> {{stream.diffResult.data.objects.inA.length}}</b>
                        </span> &nbsp;
                      </template>
                      <span>Added objects</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <span class='red--text' v-on="on">
                          <v-icon small class='red--text'>remove_circle_outline</v-icon><b> {{stream.diffResult.data.objects.inB.length}}</b>
                        </span> &nbsp;
                      </template>
                      <span>Removed objects</span>
                    </v-tooltip>
                    </v-tooltip>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <span class='' v-on="on"><b><span style='font-size: 20px'>∩</span> {{stream.diffResult.data.objects.common.length}}</b></span> &nbsp;
                      </template>
                      <span>Common objects</span>
                    </v-tooltip>
                    </v-tooltip>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <span class='grey--text' v-on="on"><b>Σ {{stream.diffResult.data.objects.inA.length + stream.diffResult.data.objects.common.length}}</b></span>
                      </template>
                      <span>Total object count</span>
                    </v-tooltip>
                  </div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-flex>
        </v-layout>
      </v-card>
    </v-flex>
  </v-layout>
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
    'stream.children'( ) {
      this.fetchData( )
    }
  },
  computed: {
    allTags( ) {
      return this.$store.getters.allTags
    },
    sizeBound( ) {
      return this.streamChildren.slice( 0, 30 )
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
      parentStream: null,
      streamChildren: [ ],
    }
  },
  methods: {
    getDate( dateeee ) {
      let date = new Date( dateeee )
      return date.toLocaleString( 'en', { year: 'numeric', month: 'long', day: 'numeric' } )
    },
    getTime( dateeee ) {
      let date = new Date( dateeee )
      return date.toLocaleString( 'en', { timeStyle: "short" } )
    },
    updateTags: debounce( function ( e ) {
      this.$store.dispatch( 'updateStream', { streamId: e.streamId, tags: e.tags } )
    }, 500 ),

    sliderChanged( args ) {
      console.log( args )
      let ind = this.$refs.timeSlider.getIndex( )
      this.lowerIndex = ind[ 0 ]
      this.upperIndex = ind[ 1 ]
    },
    fetchData( ) {
      if ( !this.stream.children ) return
      if ( this.stream.children.length === 0 ) return

      this.stream.children.map( streamId => Axios.get( `streams/${streamId}?fields=streamId,updatedAt,createdAt,owner,tags,name,commitMessage,description` ) )
        .reduce( ( promiseChain, currentTask ) => {
          return promiseChain.then( chainResults => currentTask.then( currentResult => [ ...chainResults, currentResult.data.resource ] ) )
        }, Promise.resolve( [ ] ) ).then( async arr => {

          arr.forEach( s => s.diffResult = { data: { objects: { inA: [ ], common: [ ], inB: [ ] } } } )

          this.streamChildren = arr
          this.streamChildren.push( this.parentStream )
          this.streamChildren = this.streamChildren.sort( ( a, b ) => new Date( b.updatedAt ) - new Date( a.updatedAt ) )
          let stringRes = `${this.stream.streamId}\n`

          for ( let i = 0; i < this.streamChildren.length - 1; i++ ) {
            let currStream = this.streamChildren[ i ]
            let nextStream = this.streamChildren[ i + 1 ]
            this.streamChildren[ i ].diffResult = await Axios.get( `streams/${currStream.streamId}/diff/${nextStream.streamId}` )
            let stats = this.streamChildren[ i ].diffResult.data
            stringRes += ` \t${stats.objects.inA.length}\t${stats.objects.inB.length}\t${stats.objects.common.length}\t${stats.objects.inA.length + stats.objects.common.length} \n`
          }
          console.log( stringRes )
        } )
    }
  },
  mounted( ) {
    console.log( 'hello data' )
    this.parentStream = this.$store.state.streams.find( s => s.streamId === this.$route.params.streamId )
    this.fetchData( this.$route.params.streamId )
  }
}

</script>
<style lang='scss'>
</style>
