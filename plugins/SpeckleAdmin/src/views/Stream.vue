<template>
  <div>
    <div class='md-layout md-alignment-center-center' v-if='stream'>
      <div class="md-layout-item md-size-100 text-center sticky-top" v-if='stream.deleted'>
        <md-content class='md-accent md-caption  md-layout md-alignment-center-center' style='width:100%;padding:10px; border-radius: 2px;'>
          <div class='md-layout-item'>This stream is in your trashbin.</div>
          <div class='md-layout-item'>
            <md-button class='md-dense md-raised' v-if='canEdit' @click.native='restore'> Restore? </md-button>
          </div>
        </md-content>
      </div>
      <div class="md-layout-item md-size-100">
        <div class='md-layout md-alignment-center-center'>
          <div class="md-layout-item md-size-55 md-large-size-65 md-medium-size-100">
            <stream-detail-title :stream='stream'></stream-detail-title>
          </div>
          <div class="md-layout-item md-layout md-size-55 md-large-size-65 md-medium-size-100" style="padding-left:16px; padding-right:16px; box-sizing: border-box">
            <!-- <div class='md-layout md-alignment-center-center' style='width:90%;'> -->
            <div class='md-layout-item'>
              <md-button :to='{name:"streamoverview"}' class='link-button'>
                Overview
              </md-button>
            </div>
            <div class='md-layout-item'>
              <md-button :to='{name:"streamsharing"}' class='link-button'>
                Sharing
              </md-button>
            </div>
            <div class='md-layout-item' v-if='stream.onlineEditable'>
              <md-button :to='{name:"streamdata"}' class='link-button'>
                Edit Data
              </md-button>
            </div>
            <div class='md-layout-item'>
              <md-button :to='{name:"streamhistory"}' class='link-button'>
                History <span class='md-caption'>({{stream.children.length}})</span>
              </md-button>
            </div>
            <!--       <div class='md-layout-item'>
                <md-button xxx-to='{name:"streamdata"}' class='link-button'>
                  Discussion
                </md-button>
              </div> -->
            <!-- </div> -->
          </div>
          <div class="md-layout-item md-size-55 md-large-size-65 md-medium-size-100">
            <br>
            <keep-alive>
              <router-view></router-view>
            </keep-alive>
          </div>
        </div>
      </div>
    </div>
    <div class='md-layout md-alignment-center-center' style="height: 95vh" v-else>
      <div class='md-layout-item md-size-50'>
        <md-progress-bar md-mode="indeterminate"></md-progress-bar>
      </div>
    </div>
  </div>
</template>
<script>
import debounce from 'lodash.debounce'
import union from 'lodash.union'

import StreamDetailTitle from '../components/StreamDetailTitle.vue'
import DetailDescription from '../components/DetailDescription.vue'
import StreamDetailUserPerms from '../components/StreamDetailUserPerms.vue'
import StreamDetailNetwork from '../components/StreamDetailNetwork.vue'
import StreamDetailComments from '../components/StreamDetailComments.vue'

export default {
  name: 'StreamDetailView',
  components: {
    StreamDetailTitle,
    DetailDescription,
    StreamDetailUserPerms,
    StreamDetailNetwork,
    StreamDetailComments
  },
  watch: {
    stream( ) {
      this.fetchData()
    }
  },
  computed: {
    stream( ) {
      let stream = this.$store.state.streams.find( s => s.streamId === this.$route.params.streamId )
      if ( stream === null ) {
        console.log( 'null fukcing stream' )
      }
      return stream
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
      error: '',
      editDescription: false
    }
  },
  methods: {
    getEndRoute( ) {
      let ending = this.$route.path.split( '/' ).reverse( )[ 0 ]
      if ( ending === this.$route.params.streamId || ending === '' ) return 'overview'
      else return ending
    },
    restore( ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, deleted: false } )
    },
    fetchData( ) {
      let stream = this.$store.state.streams.find( s => s.streamId === this.$route.params.streamId )
      if ( !stream ) {
        this.$store.dispatch( 'getStream', { streamId: this.$route.params.streamId } )
          .then( res => {
            this.$store.dispatch( 'getUser', { _id: res.data.resource.owner } )
            union( res.data.resource.canRead, res.data.resource.canWrite ).forEach( _id => this.$store.dispatch( 'getUser', { _id: _id } ) )
          } )
          .catch( err => {
            if ( err.message.includes( '404' ) ) this.error = `Stream ${this.$route.params.streamId} was not found.`
            if ( err.message.includes( '401' ) ) this.error = `Stream ${this.$route.params.streamId} is not accessible to you due to its protection level.`
          } )
      } else {
        this.$store.dispatch( 'getUser', { _id: stream.owner } )
        union( stream.canRead, stream.canWrite ).forEach( _id => this.$store.dispatch( 'getUser', { _id: _id } ) )
      }
    }
  },
  mounted( ) {
    this.fetchData()
  }
}

</script>
<style scoped lang='scss'>
.link-button {
  width: 100%;
  height: 60px;
  border-bottom: 2px solid white;
  transition: all .3s ease;
  margin: 0;
}

.link-button.is-active {
  border-bottom: 2px solid #448aff;
  color: #448aff !important;
  background-color: ghostwhite;
}

.detail-card {
  margin-bottom: 20px;
}

.md-content {
  padding: 30px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

a:hover {
  cursor: pointer;
}

</style>
