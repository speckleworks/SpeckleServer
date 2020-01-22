<template>
  <v-container grid-list-xl>
    <v-layout row wrap>
      <v-flex xs12 py-5 class='headline font-weight-light'>
        Manage Users, Projects, and Streams for this Speckle Server.
      </v-flex>
      <v-flex xs12>
        <v-tabs v-model="active" grow class='pa-0 ma-0' slider-color='primary'>
          <v-tab key="Users" ripple :to='{name:"admin users"}'>
            Users
          </v-tab>
          <v-tab key="Streams" ripple :to='{name:"admin streams"}'>
            Streams
          </v-tab>
          <v-tab key="Projects" ripple :to='{name:"admin projects"}'>
            Projects
          </v-tab>
        </v-tabs>
        <router-view></router-view>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>

export default {
  name: 'AdminView',
  components: {
  },
  computed: {
  },
  data( ) {
    return {
      active: '/'
    }
  },
  methods: {
  },
  created( ) {
      this.$store.dispatch( 'getStreamsAdmin' )
      this.$store.dispatch( 'getProjectsAdmin' )
      this.$store.dispatch( 'getUsersAdmin' )
  }
}

</script>
<style scoped lang='scss'>
</style>
