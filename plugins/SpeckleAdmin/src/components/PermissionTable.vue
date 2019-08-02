<template>
  <div>
    <div class=''>
      <div v-if='allUsersPop.length === 0'>
        No sharing buddies so far!
      </div>
      <div :class='{ "md-layout md-alignment-center-left user":true, "bg-ghost-white": user.isOwner}' v-for='user in allUsersPop' v-if='user'>
        <div class="md-layout-item md-size-10 md-small-hide">
          <md-avatar class="md-avatar-icon md-small" :style='{ "background" : getHexFromString( user.name ) }'>{{user.name.substring(0,1).toUpperCase()}}</md-avatar>
        </div>
        <div class="md-layout-item md-size-40 md-xsmall-size-100">
          {{user.name}} {{user.surname}}&nbsp<span v-if='user.company' class='md-caption'>({{user.company}})</span>&nbsp<span v-if='user.isOwner'><strong>owner</strong> </span>
        </div>
        <div class="md-layout-item text-right text-center-small">
          <md-button :class='{ "md-dense md-raised": true, "md-primary" : hasWritePermission(user._id)}' @click.native='changePermission(user._id)' :disabled='user.surname.includes(`(that is you!)`) || globalDisabled || isDisabled(user._id)'>{{hasWritePermission(user._id) ? "write" : "read"}}</md-button>
          <md-button class='md-dense-xxx md-icon-button md-accent' @click.native='removeUser(user._id)' :disabled='user.surname.includes(`(that is you!)`) || globalDisabled || isDisabled(user._id)'>
            <md-icon>delete</md-icon>
          </md-button>
        </div>
        <div class="md-layout-item md-size-100">

        </div>
      </div>
    </div>
  </div>
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
    canWrite( ) { return [...this.resource.canWrite, , this.resource.owner ] },
    allUsers( ) {
      return union( this.canRead, this.canWrite, [ this.resource.owner ] )
    },
    allUsersPop( ) {
      if ( this.allUsers.length === 0 ) return [ ]
      return this.allUsers.map( userId => {
        let u = this.$store.state.users.find( user => user._id === userId )
        if ( !u ) this.$store.dispatch( 'getUser', { _id: userId } )
        if ( u ) u.isOwner = u._id === this.resource.owner
        return u
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
