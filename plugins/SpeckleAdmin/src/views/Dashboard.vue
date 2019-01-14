<template>
  <div class='md-layout'>
    <md-card class="md-elevation-0 md-layout-item md-size-60 md-small-size-100">
      <md-card-content>
        <h1 class='md-display-2'>Hello {{$store.state.user.name}}!</h1>
        <h2 class='md-title'>You have <router-link to='/streams'><md-chip class='md-primary md-elevation-5' md-clickable><md-icon style='color:white;font-size: 16px !important;'>import_export</md-icon><strong>{{streams.length}}</strong>  streams &nbsp</md-chip></router-link> and <router-link to='/projects'>
          <md-chip class='md-primary md-elevation-5' md-clickable><md-icon style='color:white;font-size: 16px !important;'>business</md-icon><strong>{{projects.length}}</strong>  projects &nbsp</md-chip></router-link> in total.

        </h2>
        <br>
        <md-divider></md-divider>
        <p style="line-height: 50px;" v-if='latestStreams.length>0'>Your latest streams:
          <span v-for='stream in latestStreams' style="margin:5px;">
            <router-link :to='"/streams/" + stream.streamId'>
            <md-chip class='md-primary md-elevation-5' md-clickable> <strong>{{stream.name}}</strong>
            </md-chip>
          </router-link>
          </span>
          <router-link to='/streams'>more...</router-link>
        </p>
        <p v-else>You don't seem to have any streams. You can create them either via the existing <router-link to='/plugins'> application plugins</router-link> or right <router-link to='streams'>here!</router-link>
        </p>
        <p class='md-caption'> What are streams? Streams are the place where your design data lives: geometry, complex objects and other information come together here, either from any of the <router-link to='/plugins'>supported applications</router-link>, or created online to serve as central repositories for design parameters.</p>
        <br>
        <md-divider></md-divider>
        <p style="line-height: 50px;" v-if='latestProjects.length > 0'>Your latest projects:
          <span v-for='project in latestProjects' style="margin:5px;">
            <router-link :to='"/projects/" + project._id'>
            <md-chip class='md-primary md-elevation-5' md-clickable> <strong>{{project.name}}</strong>
            </md-chip>
          </router-link>
          </span>
          <router-link to='/projects'>more...</router-link>
        </p>
        <p v-else>You don't seem to have any projects. You can create them right <router-link to='projects'>here!</router-link>
        </p>
        <p class='md-caption'> What are projects? Projects help you group streams and teams together, and share permissions in bulk. This also allows you to group your streams in logical categories that you define.</p>
        <br>
        <md-divider></md-divider>
        <br>
        <p class="md-caption">Did you know that: <span class='catFact' @click='getAFact()' v-html='currentCatFact'></span></p>
      </md-card-content>
    </md-card>
  </div>
</template>
<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'HomeView',
  components: {},
  computed: {
    latestStreams( ) {
      return this.streams.slice( 0, 5 )
    },
    latestProjects( ) {
      return this.projects.slice( 0, 5 )
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
    return {
      currentFact: 0,
      facts: [ {
          "fact": "Cats come back to full alertness from the sleep state faster than any other creature."
        },
        {
          "fact": "Cats have supersonic hearing"
        },
        {
          "fact": "A cat's normal pulse is 140-240 beats per minute, with an average of 195."
        },
        {
          "fact": "A happy cat holds her tail high and steady."
        },
        {
          "fact": "It has been scientifically proven that stroking a cat can lower one's blood pressure."
        },
        {
          "fact": "A cat usually has about 12 whiskers on each side of its face."
        },
        {
          "fact": "Cats spend nearly 1/3 of their waking hours cleaning themselves."
        },
        {
          "fact": "A healthy cat has a temperature between 38 and 39 degrees Celcius."
        },
        {
          "fact": "On average, a cat will sleep for 16 hours a day."
        },
        {
          "fact": "Cats can jump up to 7 times their tail length."
        },
        {
          "fact": "Cats dislike citrus scent."
        },
        {
          "fact": "Cats walk on their toes."
        },
        {
          "fact": "A cat's field of vision is about 200 degrees."
        },
        {
          "fact": "Julius Ceasar, Henri II, Charles XI, and Napoleon were all afraid of cats."
        },
        {
          "fact": "The first cat show was organized in 1871 in London. Cat shows later became a worldwide craze."
        },
        {
          "fact": "A cat can sprint at about thirty-one miles per hour."
        },
        {
          "fact": "The cat's footpads absorb the shocks of the landing when the cat jumps."
        },
        {
          "fact": "Most cats adore sardines."
        },
        {
          "fact": "Cats purr at the same frequency as an idling diesel engine, about 26 cycles per second."
        },
        {
          "fact": "A cat can travel at a top speed of approximately 31 mph (49 km) over a short distance."
        },
        {
          "fact": "A cat has two vocal chords, and can make over 100 sounds."
        },
        {
          "fact": "A cat’s heart beats nearly twice as fast as a human heart, at 110 to 140 beats a minute."
        },
        {
          "fact": "Speckle is frequently misspelled as Speck, which means bacon in german."
        },
        {
          "fact": "Speckle has a <a href='https://twitter.com/speckle_works' target='_blank'>twitter account you should follow!</a>"
        }, {
          "fact": "Speckle is a recursive acronym for <strong>S</strong>peckle <strong>P</strong>refers <strong>E</strong>ating <strong>C</strong>hives, <strong>K</strong>ale, <strong>L</strong>ime, and <strong>E</strong>ggplant."
        },
        {
          "fact": "Speckle is a recursive acronym for <strong>S</strong>peckle <strong>P</strong>owered <strong>E</strong>ngines <strong>C</strong>urrently <strong>K</strong>nead <strong>L</strong>inear <strong>E</strong>nergies."
        },
        {
          "fact": "Speckle is a recursive acronym for <strong>S</strong>peckle <strong>P</strong>lanted <strong>E</strong>ggs <strong>C</strong>onvert <strong>K</strong>ey <strong>L</strong>anguage <strong>E</strong>rrors."
        },
        {
          "fact": "Speckle is a recursive acronym for <strong>S</strong>peckled, <strong>P</strong>urring, and <strong>E</strong>ffervescent <strong>C</strong>ats <strong>K</strong>indly <strong>L</strong>ick <strong>E</strong>ars."
        }
      ]
    }
  }
}

</script>
<style scoped lang='scss'>
.catFact {
  /*padding: 2px 10px;*/
  cursor: pointer;
  user-select: none;
}

</style>
