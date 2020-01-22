<template>
  <v-container grid-list-xl v-if='allUsersPop.length > 0' class='pa-0 ma-0'>
    <v-layout row wrap>
      <v-flex xs12 sm6 lg4 v-for='user in allUsersPop' v-if='user' :key='user._id'>
        <v-card tile class='pa-3 elevation-1'>
          <v-layout row wrap align-center justify-space-between>
            <v-flex xs8>
              <v-avatar size='21' dark :color="getHexFromString( user.name )">
                {{user.name.substring(0,1).toUpperCase()}}
              </v-avatar>&nbsp;
              <span>{{user.name}} {{user.surname}}</span>&nbsp;
              <span class='caption'>{{user.company}}</span>
            </v-flex>
            <v-flex xs4 class='text-xs-right'>
              <v-btn depressed :color='hasWritePermission(user._id)?"primary":""' @click.native='changePermission(user._id)' :disabled='user.surname.includes(`(that is you!)`) || globalDisabled || isDisabled(user._id)'>{{hasWritePermission(user._id) ? "edit" : "view"}}</v-btn>
              <v-btn depressed @click.native='removeUser(user._id)' :disabled='user.surname.includes(`(that is you!)`) || globalDisabled || isDisabled(user._id)'>
                <v-icon>close</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import union from 'lodash.union'
import uniq from 'lodash.uniq'

export default {
  name: 'PermissionTable',
  props: {
    resource: Object,
    globalDisabled: {
      type: Boolean,
      default: false
    },
    disabledUsers: {
      type: Array,
      default: ( ) => [ ]
    }
  },
  computed: {
    canRead( ) { return [ ...this.resource.canRead, this.resource.owner ] },
    canWrite( ) { return [ ...this.resource.canWrite, , this.resource.owner ] },
    allUsers( ) {
      return union( this.canRead, this.canWrite, [ this.resource.owner ] )
    },
    allUsersPop( ) {
      if ( this.allUsers.length === 0 ) return [ ]
      return this.allUsers.map( userId => {
        if ( !userId ) {} else {
          let u = this.$store.state.users.find( user => user._id === userId )
          if ( !u ) this.$store.dispatch( 'getUser', { _id: userId } )
          if ( u ) u.isOwner = u._id === this.resource.owner
          return u
        }
      } ).sort( ( a, b ) => a.name > b.name ? 1 : -1 )
    }
  },
  data( ) {
    return {}
  },
  methods: {
    isDisabled( _id ) {
      return this.disabledUsers.indexOf( _id ) > -1
    },
    hasWritePermission( _id ) {
      return this.canWrite.indexOf( _id ) > -1
    },
    changePermission( _id ) {
      let localCanWrite = [ ],
        localCanRead = [ ]

      // check in which perm cat the user is right now
      let index = this.canWrite.indexOf( _id )

      // canWrite -> canRead
      if ( index > -1 ) {
        localCanWrite = this.canWrite.filter( uId => uId !== _id )
        localCanRead = uniq( [ ...this.canRead, _id ] )
        // this.$emit('move-user')
        // TODO: this.$emit('move-user', { userId:x, from:'W->R' }) // for projects
        // canRead -> canWrite
      } else {
        localCanRead = this.canRead.filter( uId => uId !== _id )
        localCanWrite = uniq( [ ...this.canWrite, _id ] )
        // TODO: this.$emit('move-user', { userId:x, from:'R->W' }) // for projects
      }

      // emit one global event
      this.$emit( 'update-table', { canRead: localCanRead, canWrite: localCanWrite } )
    },
    removeUser( _id ) {
      let localCanWrite = this.canWrite.filter( uId => uId !== _id )
      let localCanRead = this.canRead.filter( uId => uId !== _id )
      this.$emit( 'remove-user', { userId: _id } )
      this.$emit( 'update-table', { canRead: localCanRead, canWrite: localCanWrite } )
    }
  },
  mounted( ) {}
}

</script>
<style scoped lang='scss'>
.user {
  padding: 2px 10px;
}

</style>
