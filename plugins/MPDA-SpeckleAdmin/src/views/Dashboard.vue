<template>
  <v-container grid-list-xl>
    <v-layout row wrap>
      <v-flex xs12 py-5 class='headline font-weight-light' v-if='streams.length !== 0 || projects.length !== 0'>
        👋 Hi {{$store.state.user.name}}! You have <router-link to='/streams'><strong>{{streams.length}}</strong> streams</router-link> and <router-link to='/projects'>
          <strong>{{projects.length}}</strong> projects</router-link> in total.
      </v-flex>
      <v-flex xs12 py-5 class='' v-if='streams.length === 0 && projects.length === 0'>
        <div class='headline font-weight-light mb-4'>
          👋 Hello {{$store.state.user.name}}! It looks like it's your first time here. Don't forget to check out the <a href='https://speckle.systems/docs/essentials/start' target='_blank'>guide</a>!
        </div>
        <v-divider></v-divider>
        <div class='mt-4 subheading'>
          You can also get in touch with the rest of the speckle community via:
          <ul>
            <li><a href='https://discourse.speckle.works' target="_blank">Discourse</a></li>
            <li><a href='https://slacker.speckle.works' target="_blank">Slack</a></li>
            <li><a href='https://twitter.com/speckle_works' target="_blank">Twitter</a></li>
          </ul>
        </div>
      </v-flex>
      <v-flex xs12 v-if='streams.length !== 0 || projects.length !== 0'>
        <search-everything />
      </v-flex>
      <v-flex xs12 md6 lg4 v-if='streams.length !== 0 || projects.length !== 0'>
        <v-card class="elevation-1">
          <v-card-title>
            <v-icon left>
              import_export
            </v-icon>
            <span class="title font-weight-light">Latest Streams</span>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-list two-line>
              <v-list-tile v-for='stream in latestStreams' :to='"/streams/" + stream.streamId' :key='stream.streamId'>
                <v-list-tile-content>
                  <v-list-tile-title>
                    <span class='caption'>
                      <v-icon small>fingerprint</v-icon> {{stream.streamId}}
                      &nbsp;<v-icon small>{{stream.private ? "lock" : "lock_open"}}</v-icon>
                    </span>&nbsp;
                    <span>{{stream.name}}</span>
                  </v-list-tile-title>
                  <v-list-tile-sub-title class='xxx-font-weight-thin caption'>
                    last changed <timeago :datetime='stream.updatedAt'></timeago>, created on {{new Date( stream.createdAt ).toLocaleString()}}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn to='/streams/' class=''>See all your {{streams.length}} streams</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
      <v-flex xs12 md6 lg4 v-if='streams.length !== 0 || projects.length !== 0'>
        <v-card class="elevation-1">
          <v-card-title>
            <v-icon left>
              business
            </v-icon>
            <span class="title font-weight-light">Latest Projects</span>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-list two-line>
              <v-list-tile v-for='project in latestProjects' :to='"/projects/" + project._id' :key='project._id'>
                <v-list-tile-content>
                  <v-list-tile-title>
                    <!-- <code>{{stream.streamId}}</code> -->
                    <v-icon small>person</v-icon> <span class='caption'>{{project.canRead.length}}</span>
                    <v-icon small>import_export</v-icon> <span class='caption'>{{project.streams.length}}</span>
                    {{project.name}}
                  </v-list-tile-title>
                  <v-list-tile-sub-title class='xxx-font-weight-thin caption'>
                    last changed <timeago :datetime='project.updatedAt'></timeago>, created on {{new Date( project.createdAt ).toLocaleString()}}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn to='/projects/' class=''>See all your {{this.$store.state.projects.length}} projects</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
      <v-flex xs12 md6 lg4>
        <v-toolbar dense class=' '>
          <v-icon left>
            fiber_new
          </v-icon>
          <span class='title font-weight-light'>
            Speckle News
          </span>
          <v-spacer></v-spacer>
          <!-- <v-toolbar-items>
            <v-btn flat href='https://twitter.com/speckle_works' target='_blank'>Follow Speckle!</v-btn>
          </v-toolbar-items> -->
        </v-toolbar>
        <v-card style='max-height: 560px; overflow-y: auto;'>
          <Timeline :id="'speckle_works'" :sourceType="'profile'" :options="{ theme: $store.state.dark ? 'dark' : '', tweetLimit: 10 }" />
        </v-card>
        <v-btn block large xxxcolor='black' href='https://twitter.com/speckle_works' target='_blank'>Follow Speckle For More!</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import { Timeline } from 'vue-tweet-embed'
import SearchEverything from '@/components/SearchEverything.vue'

export default {
  name: 'HomeView',
  components: { SearchEverything, Timeline },
  computed: {
    latestStreams( ) {
      return this.streams.slice( 0, 7 )
    },
    latestProjects( ) {
      return this.projects.slice( 0, 7 )
    },
    projects( ) {
      return this.$store.state.projects.filter( p => p.deleted === false )
    },
    streams( ) {
      return this.$store.state.streams.filter( stream => stream.parent == null && stream.deleted === false ).sort( ( a, b ) => {
        return new Date( b.updatedAt ) - new Date( a.updatedAt );
      } )
    },
    currentCatFact( ) {
      return this.facts[ this.currentFact ].fact
    }
  },
  methods: {
    getAFact( ) {
      let min = 0
      let max = this.facts.length - 1
      this.currentFact = Math.floor( Math.random( ) * ( max - min + 1 ) ) + min
    }
  },
  data( ) {
    return {}
  }
}

</script>
<style scoped lang='scss'>
</style>
