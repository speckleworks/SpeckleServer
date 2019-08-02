<template>
  <div class='md-layout client md-alignment-center-center'>
    <div class='md-layout-item md-size-10'>
      <md-icon :class='{"blue": icon === "cloud_upload"}'>{{icon}}</md-icon>
    </div>
    <div class='md-layout-item md-caption'>
      {{client.documentType}} <span v-if='client.documentName'>doc: {{client.documentName}}</span>
    </div>
    <div class='md-layout-item md-caption'>
      <!-- {{client.online ? "online" : "offline"}}, --> last seen: <strong><timeago :datetime='client.updatedAt'></timeago></strong>
    </div>
    <div class='md-layout-item md-caption'>
      <span v-if='owner'>{{ owner.name }} {{owner.surname}}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ClientCard',
  props: {
    client: Object
  },
  computed: {
    owner( ) {
      let found = this.$store.state.users.find( u => u._id === this.client.owner )
      if ( !found ) this.$store.dispatch( 'getUser', { _id: this.client.owner } )
      return found
    },
    icon( ) {
      if ( this.client.role.toLowerCase( ) === 'sender' ) return 'cloud_upload'
      if ( this.client.role.toLowerCase( ) === 'receiver' ) return 'cloud_download'
      return 'hearing'
    }
  },
  data( ) { return {} },
  methods: {}
}

</script>
<style scoped lang='scss'>
.client {
  padding-bottom: 5px;
  padding-top: 5px;
}
.blue  {
  color:#448aff !important;
}
</style>
