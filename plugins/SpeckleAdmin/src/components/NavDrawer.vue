<template>
  <div>
    <md-list v-if='$store.state.isAuth'>
      <md-list-item to='/'>
        <md-icon>home</md-icon>
        <span class="md-list-item-text">Home</span>
      </md-list-item>
      <md-list-item to='/streams'>
        <md-icon>import_export</md-icon>
        <span class="md-list-item-text">Streams</span>
      </md-list-item>
      <md-list-item to='/projects'>
        <md-icon>business</md-icon>
        <span class="md-list-item-text">Projects</span>
      </md-list-item>
      <md-list-item to='/trash'>
        <md-icon>delete_outline</md-icon>
        <span class="md-list-item-text">Trash</span>
      </md-list-item>
      <md-divider md-inset></md-divider>
      <md-list-item to='/profile'>
        <md-icon>face</md-icon>
        <span class="md-list-item-text">Profile</span>
      </md-list-item>
      <md-list-item to='/plugins'>
        <md-icon>category</md-icon>
        <span class="md-list-item-text">Plugins</span>
      </md-list-item>
      <md-list-item to='/feedback'>
        <md-icon>feedback</md-icon>
        <span class="md-list-item-text">Feedback</span>
      </md-list-item>
    </md-list>
    <md-list v-else>
      <md-list-item to='/login'>
        <md-icon>face</md-icon>
        <span class="md-list-item-text">Login</span>
      </md-list-item>
      <md-list-item to='/register'>
        <md-icon>add</md-icon>
        <span class="md-list-item-text">Register</span>
      </md-list-item>
    </md-list>
  </div>
</template>
<script>
export default {
  name: 'SiteNavigation'
}

</script>
<style lang='scss'>
$SpeckleBlue: #448aff;

.nav-sidebar {
  width: 200px !important;
  /*background-color: $SpeckleBlue !important;*/
  /*background-color: ghostwhite !important;*/
  padding-top: 30px;
}

ul {
  background-color: transparent !important;
}

.md-list-item-text {
  color: white !important;
  /*transition: none !important;*/
}

.is-active * {
  color: white !important;
  background-color: #3190FD;
}

</style>
