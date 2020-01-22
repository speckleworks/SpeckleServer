<template>
  <v-card tile class='pa-3 elevation-0 xxxmy-3' v-if='user' :class="{ disabled: user.archived }">
    <v-layout row justify-space-between align-center>
      <v-flex xs5><b>{{user.name}} {{user.surname}}</b></v-flex>
      <v-flex>
        <v-checkbox v-model="writeStreams" :label="`Edit Streams`" @click.native='changePermissionStreams()' :disabled='!canEdit'></v-checkbox>
      </v-flex>
      <v-flex>
        <v-checkbox v-model="writeProject" :label="`Edit Project`" @click.native='changePermissionProject()' :disabled='!canEdit'></v-checkbox>
      </v-flex>
      <v-flex class='text-xs-right'>
        <v-btn icon fab @click.native='removeUser()' :disabled='!canEdit' >
          <v-icon>close</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-card>
</template>
<script>
export default {
  name: 'UserPermissionProjectCard',
  props: {
    project: Object,
    user: Object,
    globalDisabled: Boolean
  },
  computed: {
    canEdit( ) {
      console.log( !this.user.archived )
      return ( this.user.surname.includes( `(that is you!)` ) || !this.globalDisabled || this.$store.state.user.role === 'admin' ) && !this.user.archived
    },
    hasWritePermissionStreams( ) {
      return this.project.permissions.canWrite.indexOf( this.user._id ) > -1
    },
    hasWritePermissionProject( ) {
      return this.project.canWrite.indexOf( this.user._id ) > -1
    }
  },
  data( ) {
    return {
      writeStreams: false,
      writeProject: false
    }
  },
  methods: {
    changePermissionStreams( ) {
      this.$emit( 'change-permission-streams', this.user._id )
    },
    changePermissionProject( ) {
      this.$emit( 'change-permission-project', this.user._id )
    },
    removeUser( ) {
      this.$emit( 'remove-user', this.user._id )
    },
  },
  mounted( ) {
    this.writeStreams = this.hasWritePermissionStreams
    this.writeProject = this.hasWritePermissionProject
  }
}

</script>
<style scoped lang='scss'>
.disabled {

  color: lightgrey;
}

</style>
