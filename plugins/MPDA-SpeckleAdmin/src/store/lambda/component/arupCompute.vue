<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-autocomplete
        return-object
        :items="libraries"
        item-text="name"
        item-value="api"
        v-model="params.selectedLibrary"
        v-on:input="selectLibrary"
        :loading="libraries.length === 0"
        label="Select a library">
        <template slot="item" slot-scope="libraries">
          <div>
            {{libraries.item.name}}
            <br>
            <span class="caption">
              {{libraries.item.api}}
            </span>
          </div>
        </template>
      </v-autocomplete>
    </v-flex>

    <v-flex xs12 v-if="params.selectedLibrary">
      <v-autocomplete
        return-object
        :items="functions"
        item-text="name"
        item-value="api"
        v-model="params.selectedFunction"
        v-on:input="selectFunction"
        :loading="functions.length === 0"
        label="Select a function">
        <template slot="item" slot-scope="functions">
          <div>
            {{functions.item.name}}
            <br>
            <span class="caption">
              {{functions.item.api}}
            </span>
          </div>
        </template>
      </v-autocomplete>
    </v-flex>

    <v-flex mt-0 v-if="params.selectedLibrary && params.selectedFunction && functions.length > 0" xs12>
      <v-card>
        <v-card-title>
          <span class='font-weight-light'>
            Inputs
          </span>
        </v-card-title>
        <v-divider/>
        <v-layout row wrap pa-3>
          <v-flex xs12 sm6 md3 v-for='input in params.selectedFunction.inputs' :key='input.name'>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <div v-on="on" ma-0 pa-0>
                  <v-autocomplete
                    v-if="(input.values || input.type === 'System.Boolean') && isInputByValue(input.name)"
                    :items="input.values ? input.values : [true, false]"
                    :label='input.name'
                    v-model='inputs[input.name]'
                    :append-icon="isInputByValue(input.name) ? 'edit' : 'input'"
                    :hint="isInputByValue(input.name) ? 'Input by value' : 'Input by object path'"
                    :persistent-hint="true"
                    :error-messages="!input.isOptional && (!inputs.hasOwnProperty(input.name) || inputs[input.name] === null) ? ['Input required'] : ''"
                    @click:append="toggleInputSource({name: input.name, value: $event})"
                    @change="updateInput({name: input.name, value: $event})">
                  </v-autocomplete> 
                  <v-text-field
                    v-else
                    :label='input.name'
                    v-model='inputs[input.name]'
                    :append-icon="isInputByValue(input.name) ? 'edit' : 'input'"
                    :hint="isInputByValue(input.name) ? 'Input by value' : 'Input by object path'"
                    :persistent-hint="true"
                    :error-messages="!input.isOptional && (!inputs.hasOwnProperty(input.name) || inputs[input.name] === null) ? 'Input required' : ''"
                    @click:append="toggleInputSource({name: input.name, value: $event})"
                    @change="updateInput({name: input.name, value: $event})">
                  </v-text-field>
                </div>
              </template>
              <div>
                <span><b>Description:</b> {{input.description}}</span>
                <br>
                <span class="caption"><b>Type:</b> {{input.type}}</span>
              </div>
            </v-tooltip>
          </v-flex>
        </v-layout>
        <v-divider/>
        <v-card-title>
          <span class='font-weight-light'>
            Output
          </span>
        </v-card-title>
        <v-divider/>
        <v-flex xs12>
          <v-text-field 
            label='Output path'
            v-model='params.outputPath'
            hint="Object path to embed all results under"
            :persistent-hint="true"
            @change="$emit('update-param', params)">
          </v-text-field>
        </v-flex>
      </v-card>
    </v-flex>

  </v-layout>
</template>
<script>

import Axios from 'axios'
import * as Msal from 'msal'

export default {
  name: 'ArupCompute',
  components: {
  },
  props: {
    block: Object,
    params: { },
  },
  data( ) {
    return {
      libraries: [ ],
      functions: [ ],
    }
  },
  computed: {
    inputs () {
      return Object.assign({ }, this.params.valueData, this.params.pathData)
    },
    token () {
      return this.$store.state.tokens['msal|' + this.block.msal.clientId]
    }
  },
  methods: {
    selectLibrary ( payload ) {
      this.functions.slice(0, this.functions.length)

      Axios.get(`${payload.api}?flat=true`, {
        baseURL: `https://compute.arup.digital/`,
        headers: {
          Authorization: 'Bearer ' + this.token
        }
      })
      .then ( res =>{
        this.functions = res.data
        this.functions.sort((x, y) => (x.name.toLowerCase() > y.name.toLowerCase()) ? 1 : -1)

        this.params.selectedLibrary = payload

        if (this.params.selectedFunction)
        {
          if (this.functions.findIndex(x => x.api === this.params.selectedFunction.api) === -1)
            this.params.selectedFunction = null
        }

        this.$emit('update-param', this.params)
      })
    },
    selectFunction ( payload ) {
      this.params.selectedFunction = payload

      this.params.valueData = {}
      this.params.pathData = {}
      this.params.outputPath = ''

      this.$emit('update-param', this.params)
    },
    isInputByValue ( paramName ) {
      if (this.params.valueData)
        if (this.params.valueData.hasOwnProperty(paramName))
          return true

      return false
    },
    toggleInputSource ( payload ) {
      if (!this.params.pathData)
        this.params.pathData = {}

      if (!this.params.valueData)
        this.params.valueData = {}
        
      if (this.isInputByValue(payload.name))
      {
        this.params.pathData[payload.name] = null
        delete this.params.valueData[payload.name]
      }
      else
      {
        this.params.valueData[payload.name] = null
        delete this.params.pathData[payload.name]
      }

      this.$emit('update-param', this.params)
    },
    updateInput ( payload ) {
      if (payload.value === null || payload.value === '' || payload.value === undefined)
        payload.value = null

      if (!this.params.pathData)
        this.params.pathData = {}

      if (!this.params.valueData)
        this.params.valueData = {}

      if (this.isInputByValue(payload.name))
        this.params.valueData[payload.name] = payload.value
      else
        this.params.pathData[payload.name] = payload.value
        
      this.$emit('update-param', this.params)
    },
    async getLibraries ( rerun = false ) {
      Axios.get(`api`, {
        baseURL: `https://compute.arup.digital/`,
        headers: {
          Authorization: 'Bearer ' + this.token
        }
      })
      .then ( res =>{
        this.libraries = res.data
        this.libraries.sort((x, y) => (x.name.toLowerCase() > y.name.toLowerCase()) ? 1 : -1)
        
        if (this.params.selectedLibrary)
          this.selectLibrary (this.params.selectedLibrary)
      })
      .catch (err => {
        console.log(err)
        if (err.response.status === 401 && !rerun)
        {
          this.$store.dispatch('authenticateBlocks', [ this.block ])
          .then(res => {
            this.getLibraries(true)
          })
        }
        else
        {
          console.log('Unable to access ArupCompute')
          this.$store.commit('DELETE_TOKEN', 'msal|' + this.block.msal.clientId)
        }
      })
    }
  },
  created () {
    this.getLibraries()
  }
}
</script>
<style scoped lang='scss'>
</style>