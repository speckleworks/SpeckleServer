<template>
  <md-card class='md-layout md-layout-item md-size-100 md-alignment-top-left md-elevation-0' style='height:90vh'>
    <md-card-content class="md-layout-item md-size-55 md-large-size-65 md-medium-size-100">
      <h1 class="md-layout-item md-size-100 md-display-2">
        Plugins & Integrations
      </h1>
      <div class="md-layout-item md-size-100">
        <!-- <p>
          Speckle currently has a bunch of application integration plugins for getting data in and out:
        </p> -->
        <p class='md-title'>
          <a target="_blank" href='https://github.com/speckleworks/speckleinstaller/releases/latest'>Dynamo, Grasshopper and Rhino</a>
        </p>
        <p>
          The above come bundled with an installer which you can <a target="_blank" href='https://github.com/speckleworks/speckleinstaller/releases/latest'>download from here</a>.
          <br>&nbsp
        </p>
        <p class='md-title'>
          <a target="_blank" href="https://github.com/speckleworks/SpeckleBlender">Blender</a>, <a target="_blank" href="https://github.com/speckleworks/SpeckleUnity">Unity</a>, Grevit/Revit and others
        </p>
        <p>
          Blender integration is available <a target="_blank" href="https://github.com/speckleworks/SpeckleBlender">from here</a>. Unity is found <a target="_blank" href="https://github.com/speckleworks/SpeckleUnity">here</a>. Many other "in-development" plugins are <a target="_blank" href="https://github.com/speckleworks">under heavy construction on github</a>. If you have the time, do help along!
        </p>
      </div>
    </md-card-content>
  </md-card>
</template>
<script>
export default {
  name: 'PluginsView',
  computed: {},
  data( ) {
    return {

    }
  },
  methods: {},
  mounted( ) {

  }
}

</script>
<style scoped lang='scss'>
</style>
