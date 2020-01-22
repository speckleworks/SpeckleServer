<template>
  <v-container grid-list-xl>
      <v-flex xs12>
        <v-tabs grow class="pa-0 ma-0" slider-color="primary">
          <v-tab ripple>Server Plugins</v-tab>
          <v-tab ripple>SpeckleAdmin Plugins</v-tab>
          <v-tab-item>
            <v-flex xs12 py-5 class="headline font-weight-light">
              Server plugins are web applications that interact with your Speckle Server.
              <br />This page is part of the SpeckleAdmin server plugin!
            </v-flex>
            <!-- Empty state handler -->
            <v-flex xs12 v-if="plugins.length === 0">
              <p
                class="title font-weight-light"
              >Hmm, we didn't find any plugins... Which is odd since this page is part of the SpeckleAdmin plugin. 🤔</p>
            </v-flex>
            <v-layout row wrap>
              <v-flex xs12 sm6 v-for="(plugin, index) in plugins" :key="index">
                <plugin-card :plugin="plugin"></plugin-card>
              </v-flex>
            </v-layout>
          </v-tab-item>
          <v-tab-item>
            <v-flex xs12 py-5 class="headline font-weight-light">
              SpeckleAdmin plugins are components that extend the SpeckelAdmin web application.
            </v-flex>
            <!-- Empty state handler -->
            <v-flex xs12 v-if="adminPlugins.length === 0">
              <p
                class="title font-weight-light"
              >Hmm, we didn't find any speckleAdmin plugins... Are they registered in your `/plugins` folder? 🤔</p>
            </v-flex>
            <v-layout row wrap>
              <v-flex xs12 sm3 v-for="(plugin, index) in adminPlugins" :key="index">
                <v-card :to='plugin.route'>
                  <v-card-title class='subheading'>
                    {{plugin.name}}
                  </v-card-title>
                  <v-card-text class='caption'>
                    <b>Description:</b> {{plugin.description}}<br>
                    <b>Route:</b> <code>{{plugin.route}}</code>
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
          </v-tab-item>
        </v-tabs>
      </v-flex>
  </v-container>
</template>
<script>
import PluginCard from '../components/PluginCard'

export default {
  name: 'Plugins',
  components: {
    PluginCard
  },
  data: () => ({}),
  computed: {
    plugins() {
      return this.$store.state.plugins
    },
    adminPlugins() {
      return this.$store.state.adminPlugins
    }
  },
  mounted() {
    this.$store.dispatch('getPlugins')
  }
}
</script>
