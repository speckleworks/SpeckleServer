<template>
  <v-card>
    <v-card-title>
      <span class='title font-weight-light'>{{plugin.name ? plugin.name : "No Name"}}</span>
    </v-card-title>
    <v-divider class='mx-0 my-0'></v-divider>
    <v-layout row wrap>
      <v-flex xs12 class='caption' ma-2>
        <div v-if='plugin.desc'>
          <v-icon small>subject</v-icon> {{plugin.desc}}
        </div>
        <div v-if='plugin.version'>
          <v-icon small>timeline</v-icon> {{plugin.version }}
        </div>
        <div v-if='plugin.author'>
          <v-icon small>person</v-icon> {{plugin.author}}
        </div>
        <div v-if='plugin.homepage'>
          <v-icon small>link</v-icon> <a :href='plugin.homepage'>{{plugin.homepage}}</a>
        </div>
        <div v-if='plugin.git'>
          <v-icon small>link</v-icon> <a :href='plugin.git'>{{plugin.git}}</a>
        </div>
        <div v-if='plugin.contact'>
          <v-icon small>mail</v-icon> <a :href="'mailto:'+plugin.contact">{{plugin.contact}}</a>
        </div>
      </v-flex>
    </v-layout>
    <v-card-actions>
      <v-btn color='primary' :href='plugin.canonicalUrl'>Go to plugin</v-btn>
    </v-card-actions>
  </v-card>
</template>

</template>
<script>
export default {
  name: 'PluginCard',
  props: {
    plugin: Object
  }
}
</script>