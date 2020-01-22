<template>
  <stream-detail-user-perms :stream='stream'></stream-detail-user-perms>
</template>
<script>
import debounce from 'lodash.debounce'
import union from 'lodash.union'

import StreamDetailUserPerms from '../components/StreamDetailUserPerms.vue'

export default {
  name: 'StreamEditView',
  components: {
    StreamDetailUserPerms
  },
  computed: {
    stream( ) {
      return this.$store.state.streams.find( s => s.streamId === this.$route.params.streamId )
    },
    canEdit( ) {
      if (this.$store.state.user.role == 'admin') return true
      return this.isOwner ? true : this.stream.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.stream.owner === this.$store.state.user._id
    }
  },
  data( ) {
    return {}
  },
  methods: {}
}

</script>
<style scoped lang='scss'>
</style>
