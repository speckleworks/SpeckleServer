<template>
  <div>
    <div class='' v-if='project'>
      <div v-if='allUsersPop.length === 0'>
        No sharing buddies so far!
      </div>
      <div :class='{ "md-layout md-alignment-center-left user":true, "bg-ghost-white": user.isOwner}' v-for='user in allUsersPop' v-if='user'>
        <div class="md-layout-item md-size-10 md-small-hide">
          <md-avatar class="md-avatar-icon md-small" :style='{ "background" : getHexFromString( user.name ) }'>{{user.name.substring(0,1).toUpperCase()}}</md-avatar>
        </div>
        <div class="md-layout-item xxx-md-size-40 md-xsmall-size-100 text-center">
          {{user.name}} {{user.surname}}&nbsp<span v-if='user.company' class='md-caption'>({{user.company}})</span>&nbsp<span v-if='user.isOwner'><strong>owner</strong> </span>
        </div>
        <div class="md-layout-item text-center md-xsmall-size-100">
          <md-button :class='{ "md-dense md-raised-xx": true, "md-primary" : hasWritePermissionStreams(user._id)}' @click.native='changePermissionStreams(user._id)' :disabled='user.surname.includes(`(that is you!)`) || globalDisabled || user.isOwner'>
            {{ user.isOwner ? "write streams" : hasWritePermissionStreams(user._id) ? "write streams" : "read streams"}}
          </md-button>
        </div>
        <div class="md-layout-item text-center md-xsmall-size-100">
          <md-button :class='{ "md-dense md-raised-xx": true, "md-primary" : hasWritePermissionProject(user._id)}' @click.native='changePermissionProject(user._id)' :disabled='user.surname.includes(`(that is you!)`) || globalDisabled || user.isOwner'>
            {{ user.isOwner ? "write project" : hasWritePermissionProject(user._id) ? "write project" : "read project"}}
          </md-button>
        </div>
        <div class="md-layout-item text-center md-size-5 md-xsmall-size-100">
          <md-button class='md-dense-xxx md-icon-button md-accent' @click.native='removeUser(user._id)' :disabled='user.surname.includes(`(that is you!)`) || globalDisabled || user.isOwner'>
            <md-icon>delete</md-icon>
          </md-button>
        </div>
        <div class="md-layout-item md-size-100">
          <!-- <md-divider></md-divider> -->
        </div>
        <div class="md-layout-item md-size-100">
          <!-- <md-divider></md-divider> -->
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
    project: Object,
    globalDisabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    canReadProject( ) { return this.project.canRead },
    canWriteProject( ) { return this.project.canWrite },
    canReadStreams( ) { return this.project.permissions.canRead },
    canWriteStreams( ) { return this.project.permissions.canWrite },
    allUsers( ) {
      return uniq( [ ...this.canReadProject, ...this.canWriteProject, ...this.canReadStreams, ...this.canWriteProject, this.project.owner ] )
    },
    allUsersPop( ) {
      if ( this.allUsers.length === 0 ) return [ ]
      return this.allUsers.map( userId => {
        let u = this.$store.state.users.find( user => user._id === userId )
        if ( !u ) this.$store.dispatch( 'getUser', { _id: userId } )
        if ( u ) u.isOwner = u._id === this.project.owner
        return u
      } ).sort( ( a, b ) => a.name > b.name ? 1 : -1 )
    }
  },
  data( ) {
    return {}
  },
  methods: {
    hasWritePermissionStreams( _id ) {
      return this.canWriteStreams.indexOf( _id ) > -1
    },
    hasWritePermissionProject( _id ) {
      return this.canWriteProject.indexOf( _id ) > -1
    },
    changePermissionProject( userId ) {
      let canWrite = this.project.canWrite.indexOf( userId ) > -1 ? true : false
      let localCanWrite = [ ],
        localCanRead = [ ],
        streamCanWrite = this.project.permissions.canWrite,
        streamCanRead = this.project.permissions.canRead

      if ( canWrite ) {
        localCanWrite = this.project.canWrite.filter( uId => uId !== userId )
        localCanRead = uniq( [ ...this.project.canRead, userId ] )
      } else {
        localCanRead = this.project.canRead
        localCanWrite = uniq( [ ...this.project.canWrite, userId ] )
        // TODO: UPGRADE STREAMS CANWRITE TOO (otherwise user x can edit the project but not do much)
        streamCanWrite = uniq( [ ...streamCanWrite, userId ] )
        this.upgradeUser( userId )
      }
      this.$store.dispatch( 'updateProject', { _id: this.project._id, permissions: { canRead: streamCanRead, canWrite: streamCanWrite }, canRead: localCanRead, canWrite: localCanWrite } )
    },
    changePermissionStreams( userId ) {
      let hasWritePermission = this.project.permissions.canWrite.indexOf( userId ) > -1 ? true : false
      if ( !hasWritePermission ) this.upgradeUser( userId )
      else this.downgradeUser( userId )
    },
    upgradeUser( userId ) {
      this.$store.dispatch( 'upgradeUserInProject', { projectId: this.project._id, userId: userId } )
    },
    downgradeUser( userId ) {
      this.$store.dispatch( 'downgradeUserInProject', { projectId: this.project._id, userId: userId } )
    },
    removeUser( userId ) {
      this.$store.dispatch( 'removeUserInProject', { projectId: this.project._id, userId: userId } )
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
