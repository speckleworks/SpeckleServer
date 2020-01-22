<template>
  <v-container grid-list-xl>
    <v-layout row wrap>
      <v-flex xs12 pt-5 pb-0 class='headline font-weight-light'>
        Hello!<hr class='my-4'>Your name is <editable-span :text='user.name' hint='edit your name' @update='updateName'></editable-span>&nbsp;<editable-span :text.sync='user.surname' hint='edit your surname' @update='updateSurname'></editable-span> and you work at <editable-span :text='user.company' hint='edit your company' @update='updateCompany'></editable-span>.
      </v-flex>
      <v-flex xs12>
        Your email is {{user.email}}.
        <!-- You are {{user.verfied}} verfied. -->
        <hr class='my-4'>
      </v-flex>
      <v-flex xs12 my>
        <v-layout row wrap align-top>
          <v-flex xs12>
            <v-btn small class='ma-0' @click.native='showToken = !showToken'>{{showToken ? "Hide" : "Show"}} API Token</v-btn depressed><br>&nbsp;
          </v-flex>
          <v-flex xs12 v-if='showToken'>
            <v-alert :value="true" type="warning">
              Take care, this token is unique to you. Do not share it with others as it grants full access on your behalf to the api.
            </v-alert>
<!--           </v-flex>
          <v-flex xs12> -->
            <code  class='pa-3' style="user-select:all; max-width:100%; overflow-wrap: break-word;">{{user.apitoken}}</code>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
export default {
  name: 'ProfileView',
  computed: {
    user( ) {
      return this.$store.state.user
    }
  },
  data( ) {
    return {
      showToken: false
    }
  },
  methods: {
    updateName( args ) {
      this.$store.dispatch( 'updateLoggedInUser', { _id: this.user._id, name: args.text } )
    },
    updateSurname( args ) {
      this.$store.dispatch( 'updateLoggedInUser', { _id: this.user._id, surname: args.text } )
    },
    updateCompany( args ) {
      this.$store.dispatch( 'updateLoggedInUser', { _id: this.user._id, company: args.text } )
    },
    logout( ) {
      this.$store.dispatch( 'logout' )
      this.$router.push( '/login' )
    }
  },
  mounted( ) {

  }
}

</script>
<style scoped lang='scss'>
</style>
