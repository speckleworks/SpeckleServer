<template>
  <v-layout row wrap justfiy-space-between class='text-xs-left'>
    <v-flex class='caption'>
      <strong>{{client.documentType}}</strong>&nbsp;<span v-if='client.documentName'>doc name: {{client.documentName}}</span>
    </v-flex>
    <v-flex class='caption' xs3>
      <!-- {{client.online ? "online" : "offline"}}, -->
      last seen: <strong>
        <timeago :datetime='client.updatedAt'></timeago>
      </strong>
    </v-flex>
    <v-flex class='caption' xs4>
      <span v-if='owner'>Client Owner: <strong>{{ owner.name }} {{owner.surname}}</strong></span>
    </v-flex>
  </v-layout>
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

.blue {
  color: #448aff !important;
}

</style>
