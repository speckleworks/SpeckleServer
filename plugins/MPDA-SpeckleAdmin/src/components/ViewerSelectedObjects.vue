<template>
  <v-layout row wrap>
    <v-flex xs12 class='caption' v-if='selectedObjectsId.length===0'>
        There are no selected objects. You can select objects in the 3d model:
        <ul>
          <li>by clicking on them;</li>
          <li>by clicking on them and holding down shift;</li>
          <li>by holding down left shift and dragging a selection box on the screen.</li>
        </ul>
      </p>
    </v-flex>
    <v-flex xs12>
      <object-details v-for='object in paginatedObjects' :key='object._id' :json='object'></object-details>
    </v-flex>
    <v-flex xs12>
      <v-btn icon small @click.native='pageNumber=0' :disabled='pageNumber===0'>
        <v-icon>first_page</v-icon>
      </v-btn>
      <v-btn icon small @click.native='pageNumber-=1' :disabled='pageNumber===0'>
        <v-icon>chevron_left</v-icon>
      </v-btn>
      <v-btn icon @click.native='pageNumber+=1' :disabled='pageNumber >= Math.round(selectedObjects.length/sliceSize)'>
        <v-icon>chevron_right</v-icon>
      </v-btn>
      <v-btn icon small @click.native='pageNumber=Math.round(selectedObjects.length/sliceSize)' :disabled='pageNumber >= Math.round(selectedObjects.length/sliceSize)'>
        <v-icon>last_page</v-icon>
      </v-btn>
      <span class='caption' xxxstyle="position: relative;top:8px;">{{pageNumber}} / {{(selectedObjects.length/sliceSize).toFixed(0)}}</span>
    </v-flex>
  </v-layout>
</template>
<script>
import ObjectDetails from '@/components/ViewerObjectDetails.vue'
export default {
  name: 'SelectedObjects',
  components: { ObjectDetails },
  props: {},
  watch: {
    selectedObjectsId( newVal ) {
      this.currentIndex = 0
      this.pageNumber = 0
    }
  },
  computed: {
    selectedObjectsId( ) {
      return this.$store.state.selectedObjects
    },
    selectedObjects( ) {
      if(this.$store.state.selectedObjects.length !== 0)
        return this.$store.state.objects.filter( o => this.$store.state.selectedObjects.indexOf( o._id ) !== -1 )
      return this.$store.state.objects
    },
    paginatedObjects( ) {
      return this.selectedObjects.slice( this.currentIndex + this.pageNumber * this.sliceSize, this.sliceSize * ( this.pageNumber + 1 ) )
    }
  },
  data( ) {
    return {
      currentIndex: 0,
      sliceSize: 5,
      pageNumber: 0,
    }
  },
  methods: {}
}

</script>
<style scoped lang='scss'>
</style>
