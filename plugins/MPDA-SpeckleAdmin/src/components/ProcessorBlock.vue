<template>
  <v-layout row wrap>
    <v-flex xs12 ma-0 pa-0>
      <v-card>
        <v-card-title>
          <v-icon small class="ml-2 mr-2">
            {{block.icon ? block.icon : 'code'}}
          </v-icon>
          <span class='font-weight-light mr-2'>
            {{ block.name }}
          </span>
          <v-dialog
            max-width="500">
            <template v-slot:activator="{ on }">
              <v-btn round small depressed color="primary" v-on="on">
                <span>help</span>
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class='font-weight-light'>Description</span>
              </v-card-title>
              <v-card-text>
                {{ block.description }}
              </v-card-text>
            </v-card>
          </v-dialog>
          <v-spacer></v-spacer>
          <span>
            <v-btn round small depressed color="primary" v-if="status == 'success'" @click="$emit('rerun-block', index)">
              <v-icon small>replay</v-icon>
              <span class="mx-2">re-run</span>
            </v-btn>
            <v-btn fab small depressed color="primary" @click="$emit('remove-block', index)">
              <v-icon>close</v-icon>
            </v-btn>
          </span>
        </v-card-title>
        <v-divider v-if="this.block.parameters.length > 0" class='mx-0 my-0'></v-divider>
        <div v-if="isAuthenticated">
          <v-card-text v-if="this.block.customComponent">
            <component
              :block='block'
              :params='params'
              v-bind:is="customComponent"
              v-on:update-param="updateParams">
            </component>
          </v-card-text>
          <v-card-text v-else-if="this.block.parameters.length > 0 && isAuthenticated">
            <v-layout row wrap>
              <v-flex xs12 sm6 md3 v-for='param in arrayParams' :key='param.name'>
                <v-combobox multiple small-chips :label='param.name' v-model='params[param.name]' @change="$emit('update-param', {index: index, params: params})">
                </v-combobox>
              </v-flex>
              <v-flex xs12 sm6 md3 v-for='param in genericParams' :key='param.name'>
                <v-text-field :label='param.name' v-model='params[param.name]' @change="$emit('update-param', {index: index, params: params})">
                </v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md3 v-for='param in booleanParams' :key='param.name'>
                <v-checkbox :label='param.name' v-model='params[param.name]' @change="$emit('update-param', {index: index, params: params})">
                </v-checkbox>
              </v-flex>
              <v-flex xs12 sm12 md12 v-for='param in objectarrayParams' :key='param.name'>
                <v-card outlined>
                  <v-flex>
                    <span class='font-weight-light mr-3'>{{param.name}}</span>
                    <v-dialog :persistent='true' v-model="displayDialog[param.name]" max-width='300'>
                      <template v-slot:activator="{ on }">
                        <v-btn round small v-on="on">
                          <v-icon small>add</v-icon>
                          <span class="mx-2">new entry</span>
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title class='title font-weight-light'>
                          {{objectArrayIndex == -1 ? 'New Entry' : 'Modify Entry'}}
                        </v-card-title>
                        <v-card-text>
                          <v-layout row wrap>
                            <v-flex xs12 sm12 md12 v-for='header in param.headers' :key='param.name + "_" + header'>
                              <v-text-field :label='header' v-model='objectArrayItem[header]'>
                              </v-text-field>
                            </v-flex>
                          </v-layout>
                        </v-card-text>
                        <v-card-actions>
                          <v-btn flat color='primary' @click='addObjectArrayItem(param)'>
                            {{objectArrayIndex == -1 ? 'Add' : 'Modify'}}
                          </v-btn>
                          <v-btn flat color='primary' @click='resetObjectArrayDialog(param)'>
                            Cancel
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-flex>
                  <v-data-table disable-initial-sort hide-actions :headers='tableHeader(param.headers)' :items='params[param.name]'>
                    <template v-slot:items="props">
                      <td v-for='p in Object.entries(props.item)' :key='p[0]'>{{p[1]}}</td>
                      <td width='200px'>
                        <v-btn flat icon small @click="deleteObjectArrayItem(param, props.index)">
                          <v-icon small>
                            delete
                          </v-icon>
                        </v-btn>
                        <v-btn flat icon small @click="editObjectArrayItem(param, props.index)">
                          <v-icon small>
                            edit
                          </v-icon>
                        </v-btn>
                      </td>
                    </template>
                    <template v-slot:no-data>
                      <td v-for='h in param.headers' :key='h'></td>
                      <td width='10%'></td>
                    </template>
                  </v-data-table>
                </v-card>
              </v-flex>
            </v-layout>
          </v-card-text>
        </div>
        <div v-else>
          <v-card-text>
            <v-layout row wrap>
              <v-flex xs12 class="text-xs-center">
                <v-btn v-if="!isAuthenticating" @click="authenticate()" round depressed color="primary">
                  Authenticate
                </v-btn>
                <v-progress-circular v-else indeterminate color="primary">
                </v-progress-circular>
              </v-flex>
            </v-layout>
          </v-card-text>
        </div>
        <v-progress-linear
          color='primary'
          v-bind:indeterminate="this.status == 'running'">
        </v-progress-linear>
      </v-card>
    </v-flex>
    <v-flex xs12 ma-0 pa-0 text-xs-center class="title font-weight-black">
      |
    </v-flex>
    <v-flex xs12 mt-0 pa-0 text-xs-center>
      <v-dialog
        v-if="output != null"
        max-width="500">
        <template v-slot:activator="{ on }">
          <v-btn round small dark depressed v-on="on" :color="status == 'success' ? 'green' : 'red'">
            <v-icon class="ml-2" small>{{status == "success" ? "check" : "stop"}}</v-icon>
            <span class="mx-2">view output</span>
          </v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class='font-weight-light'>
              {{status == "error" ? "Error" : "Response"}}
            </span>
          </v-card-title>
          <v-card-text>
            <vue-json-pretty :data='responseObject' :deep='1' highlight-mouseover-node show-length :show-line='false' :show-double-quotes='false'>
            </vue-json-pretty>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-btn v-else round small dark depressed :color="status == 'running' ? 'orange' : 'primary'">
        <v-icon class="ml-2" small>{{status == "running" ? "timer" : "drafts"}}</v-icon>
        <span class="mx-2">{{status == "running" ? "waiting" : "no output"}}</span>
      </v-btn>
    </v-flex>
    <v-flex xs12 pa-0 text-xs-center class="title font-weight-black">
      <v-icon>arrow_downward</v-icon>
    </v-flex>
  </v-layout>
</template>
<script>

import VueJsonPretty from 'vue-json-pretty'

export default {
  name: 'ProcessorBlock',
  components: {
    VueJsonPretty
  },
  props: {
    index: null,
    block: Object,
    output: null,
    status: '',
    params: { },
  },
  computed: {
    isAuthenticated () {
      // Maybe add other auth methods?
      if (this.block.msal)
      {
        var tokenID = 'msal|' + this.block.msal.clientId
        if (this.$store.state.tokens.hasOwnProperty(tokenID))
          return true

        return false
      }

      return true
    },
    customComponent () {
      return () => import(`../store/lambda/component/${this.block.function}.vue`)
    },
    arrayParams( ) {
      return this.block.parameters.filter(p => p.type == 'array')
    },
    booleanParams( ) {
      return this.block.parameters.filter(p => p.type == 'boolean')
    },
    genericParams( ) {
      return this.block.parameters.filter(p => ['string', 'int', 'double'].includes(p.type))
    },
    objectarrayParams( ) {
      return this.block.parameters.filter(p => p.type == 'objectarray')
    },
    numOutput( ) {
      if (this.output == null)
        return 0
      if (typeof this.output == 'string')
        return 1
      else
        return Object.keys(this.output).length
    },
    responseObject() {
      if (this.numOutput <= 10)
        return this.removeArraysRecursive( this.output )
      else
      {
        let bar = {}
        for ( let key in this.output ) {
          bar[key] = this.output[key]

          if (Object.keys(bar).length >= 10)
            break
        }
        bar['_hidden'] = `... (${this.numOutput - 10} more objects)`
        return this.removeArraysRecursive( bar )
      }
    }
  },
  data( ) {
    return {
      displayDialog: { },
      objectArrayItem: { },
      objectArrayIndex: -1,

      isAuthenticating: false,
    }
  },
  methods: {
    removeArraysRecursive( foo ) {
      let bar = {}

      if (typeof foo == 'string')
        return foo

      for ( let key in foo ) {
        if ( !foo.hasOwnProperty( key ) ) continue

        if ( Array.isArray( foo[ key ] ) ) {
          /*DO FUCKALL */
          if( foo[key].length < 3 )
            bar[key] = foo[key]
          else {
            bar[key] = [ ...foo[key].slice(0, 3), `... (${foo[key].length - 3} more values)` ]
          }
        } else if ( typeof foo[ key ] === 'object' && foo[ key ] !== null ) {
          bar[ key ] = this.removeArraysRecursive( foo[ key ] )
        } else {
          bar[ key ] = foo[ key ]
        }
      }
      return bar
    },
    tableHeader( headers ) {
      var formatedHeaders = [ ]
      headers.forEach(h => {
        formatedHeaders.push({text: h, value: h, sortable: false})
      })
      formatedHeaders.push({text: 'actions', value: 'actions', sortable: false})
      return formatedHeaders
    },
    resetObjectArrayDialog (param) {
      this.objectArrayItem = { }
      this.displayDialog[param.name] = false
      this.objectArrayIndex = -1
    },
    addObjectArrayItem (param) {
      if (Object.values(this.objectArrayItem).length == param.headers.length)
      {
        if (!this.params.hasOwnProperty(param.name)) this.params[param.name] = []

        if (this.objectArrayIndex == -1)
          this.params[param.name].push(this.objectArrayItem)
        else
          this.params[param.name].splice(this.objectArrayIndex, 1, this.objectArrayItem)
        this.objectArrayItem = { }
        this.$emit('update-param', {index: this.index, params: this.params})
      }
      this.resetObjectArrayDialog(param)
    },
    deleteObjectArrayItem (param, index) {
      this.params[param.name].splice(index, 1)
      this.$emit('update-param', {index: this.index, params: this.params})
    },
    editObjectArrayItem (param, index) {
      this.objectArrayItem = Object.assign({}, this.params[param.name][index])
      this.objectArrayIndex = index
      this.displayDialog[param.name] = true
    },
    updateParams ( payload ) {
      this.params = payload
      this.$emit('update-param', {index: this.index, params: this.params})
    },
    authenticate ( ) {
      if (this.isAuthenticated)
        return

      this.isAuthenticating = true
      this.$store.dispatch('authenticateBlocks', [this.block])
      .then( res => {
        this.isAuthenticating = false
      })
      .catch( err => {
        console.log(err)
        this.isAuthenticated = false
      })
    }

  },
  created () {
  }
}
</script>
<style scoped lang='scss'>
</style>
