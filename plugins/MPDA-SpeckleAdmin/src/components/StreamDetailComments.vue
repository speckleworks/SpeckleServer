<template>
  <md-card class='md-elevation-3'>
    <md-card-content>
      <div class="md-title">Comments</div>
      <md-divider md-inset></md-divider>
      <p>TODO</p>
    </md-card-content>
  </md-card>
</template>
<script>
import debounce from 'lodash.debounce'

export default {
  name: 'StreamDetailUserComments',
  props: {
    stream: Object, // can be alert or info
  },
  computed: {
    canEdit( ) {
      return this.isOwner ? true : this.stream.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.stream.owner === this.$store.state.user._id
    }
  },
  methods: {
  }
}

</script>
<style scoped lang='scss'>
</style>
