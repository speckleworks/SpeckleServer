<template>
  <v-container grid-list-xl>
    <div style='position: absolute; top:0; left: 0; width: 100%;'>
      <v-progress-linear :indeterminate="true" v-show='!processor' height='2' class='ma-0'></v-progress-linear>
    </div>
    <v-layout row wrap v-if="processor">
      <v-flex xs12>
        <v-card class="pa-3">
          <v-layout row wrap>
            <v-flex xs12 class='display-1 font-weight-light text-capitalize my-5'>
              <editable-span :text='processor.name' @update='updateName'></editable-span>
            </v-flex>
            <v-flex xs12 class='ma-0 py-0 mb-2'>
              <v-combobox :menu-props='{"maxHeight":0, "zIndex":"0"}' @input='updateTags' v-model="processor.tags" :items='processor.tags' hint='add or remove tags' solo persistent-hint small-chips deletable-chips multiple tags>
                <template v-slot:no-data>processor has no tags.</template>
              </v-combobox>
            </v-flex>
          </v-layout>
          <v-card-actions>
            <v-dialog
              max-width="500">
              <template v-slot:activator="{ on }">
                <v-btn round small depressed v-on="on">
                  <v-icon>share</v-icon>
                  <span class="mx-2">share</span>
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class='font-weight-light'>
                    Share link
                  </span>
                </v-card-title>
                <v-card-text>
                  <v-text-field :readonly="true" v-model="shareLink" class='font-weight-light'></v-text-field>
                </v-card-text>
              </v-card>
            </v-dialog>
          </v-card-actions>
        </v-card>
      </v-flex>
      <v-flex xs12>
        <v-card class="my-4">
          <detail-description :resource='processor'></detail-description>
        </v-card>
      </v-flex>
      <v-flex>
        <v-card>
          <v-flex mb-3 class="pa-4">
            <v-icon class="mr-2">
              code
            </v-icon>
            <span class='title font-weight-light mr-2'>
              Processor
            </span>
          </v-flex>
        </v-card>
        <v-flex xs12 v-for='(block, index) in processor.blocks' :key='index'>
          <processor-block
            :index='index'
            :block='block'
            :output='blockOutput[index]'
            :status='blockStatus[index]'
            :params='processor.params[index]'
            v-on:remove-block="removeBlock"
            v-on:update-param="updateParam"
            v-on:rerun-block="rerunBlock"/>
        </v-flex>
        <v-flex xs12 mb-3 pa-0 v-if='processor.blocks.length > 0'>
          <v-card>
            <v-flex ma-0 pa-3>
              <v-icon small class="mr-2">
                receipt
              </v-icon>
              <span class='font-weight-light mr-2'>
                Output
              </span>
            </v-flex>
            <v-divider v-if="successRun"></v-divider>
            <v-flex v-if="successRun" pa-3>
              <vue-json-pretty :data='responseObject' :deep='1' highlight-mouseover-node show-length :show-line='false' :show-double-quotes='false'>
              </vue-json-pretty>
            </v-flex>
          </v-card>
        </v-flex>
        <v-card>
          <v-flex xs12>
            <v-autocomplete
              return-object
              :items="lambdas"
              item-text="name"
              item-value="name"
              v-on:input="addBlock"
              label="Add new block">
              <template slot="selection">
                {{null}}
              </template>
              <template slot="item" slot-scope="lambdas">
                <v-icon class="mr-2">
                  {{lambdas.item.icon ? lambdas.item.icon : 'code'}}
                </v-icon>
                {{lambdas.item.name}}
              </template>
            </v-autocomplete>
          </v-flex>
        </v-card>
      </v-flex>
    </v-layout>
    <v-btn color="primary" dark fixed large bottom right fab @click="runProcessor">
      <v-progress-circular v-if="isRunning" indeterminate>
      </v-progress-circular>
      <v-icon v-else>
        {{this.successRun ? "replay" : "play_arrow"}}
      </v-icon>
    </v-btn>
  </v-container>
</template>
<script>

import debounce from 'lodash.debounce'
import ProcessorBlock from '../components/ProcessorBlock.vue'
import DetailDescription from '../components/DetailDescription.vue'
import VueJsonPretty from 'vue-json-pretty'

import Axios from 'axios'

export default {
  name: 'ProcessorView',
  components: {
    ProcessorBlock,
    DetailDescription,
    VueJsonPretty,
  },
  computed: {
    lambdas( ) {
      return this.$store.state.lambdas.sort((x, y) => (x.name > y.name) ? 1 : -1)
    },
    shareLink( ) {
      let copy = Object.assign({}, this.processor)

      delete copy._id
      delete copy.owner
      delete copy.private
      delete copy.canRead
      delete copy.canWrite
      delete copy.anonymousComments
      delete copy.comments

      return window.location.origin + "/#/processors/import?processor=" + btoa(encodeURI(JSON.stringify(copy)))
    },
    successRun( ) {
      if (this.blockStatus.length > 0 && this.blockStatus.length == this.processor.blocks.length)
        return this.blockStatus[this.blockStatus.length - 1] == 'success'

      return false
    },
    responseObject( ) {
      if (!this.successRun)
        return null

      if (typeof this.blockOutput[this.blockOutput.length - 1] == 'string')
        return this.blockOutput[this.blockOutput.length - 1]
      else if (Object.keys(this.blockOutput[this.blockOutput.length - 1]).length <= 10)
        return this.removeArraysRecursive( this.blockOutput[this.blockOutput.length - 1] )
      else
      {
        let bar = {}
        for ( let key in this.blockOutput[this.blockOutput.length - 1] ) {
          bar[key] = this.blockOutput[this.blockOutput.length - 1][key]

          if (Object.keys(bar).length > 10)
            break
        }
        bar['_hidden'] = `... (${Object.keys(this.blockOutput[this.blockOutput.length - 1]).length - 10} more objects)`
        return this.removeArraysRecursive( bar )
      }
    }
  },
  data( ) {
    return {
      initInput: "",

      isRunning: false,

      id: "",
      processor: null,

      blockStatus: [ ],
      blockOutput: [ ],
      
      toRequest: [ ],
      requestBuckets: [ ],
      isRequesting: false,
      pauseRequesting: false,
      bucketInProgress: false,
    }
  },
  mutations: {

  },
  methods: {
    async runProcessor ( ) {
      if (this.isRunning)
        return

      this.isRunning = true
      
      var blockInput = this.initInput
      var i = 0

      if (this.successRun)
      {
        this.blockOutput.splice(0, this.blockOutput.length)
        this.blockStatus.splice(0, this.blockStatus.length)
      }
      else if (this.blockStatus.length > 0)
      {
        i = this.blockStatus.filter(x => x == 'success').length

        if (i > 0)
          blockInput = this.blockOutput[i - 1]

        this.blockOutput.splice(i, this.blockOutput.length - i)
        this.blockStatus.splice(i, this.blockStatus.length - i)
      }

      for (; i < this.processor.blocks.length; i++)
      {
        this.blockStatus.push('running')

        var token = this.getToken(this.processor.blocks[i])

        var params = this.processor.params[i] ? this.processor.params[i] : new Object
        
        if (this.processor.blocks[i].allowBucketing && blockInput.constructor === Array)
        {
          // Try to chunk the payload if it is an array
          var bucket = [ ],
            maxReq = 250 // magic number; maximum objects to request in a bucket

          var output = [ ]

          for (let j = 0; j < blockInput.length; j++)
          {
            bucket.push( blockInput[j] )

            if ( j % maxReq === 0 && j !== 0 ) {
              try
              {
                let result = await this.callLambda( this.processor.blocks[i].function, bucket, params, token )
                if (result.data.constructor === Array)
                  output.push(...result.data)
                else
                  output.push(result.data)
              }
              catch (err)
              {
                this.blockStatus.pop()
                this.blockStatus.push('error')
                this.blockOutput.push(err.response.data)
                this.isRunning = false
                return
              }

              bucket = [ ]
            }
          }

          if ( bucket.length > 0 ) {
            try
            {
              let result = await this.callLambda( this.processor.blocks[i].function, bucket, params, token )

              if (result.data.constructor === Array)
                output.push(...result.data)
              else
                output.push(result.data)
            }
            catch (err) 
            {
              this.blockStatus.pop()
              this.blockStatus.push('error')
              this.blockOutput.push(err.response.data)
              this.isRunning = false
              return
            }

            bucket = [ ]
          }

          this.blockStatus.pop()
          this.blockStatus.push('success')
          this.blockOutput.push(output)
          blockInput = output
        }
        else
        {
          try
          {
            let result = await this.callLambda( this.processor.blocks[i].function, blockInput, params, token )
            this.blockStatus.pop()
            this.blockStatus.push('success')
            this.blockOutput.push(result.data)
            blockInput = result.data
          }
          catch (err) 
          {
            this.blockStatus.pop()
            this.blockStatus.push('error')
            this.blockOutput.push(err.response.data)
            this.isRunning = false
            return
          }
        }
      }

      this.isRunning = false
    },

    callLambda( func, input, params, token ) {
      return new Promise((resolve, reject) => {
        Axios({
          method: 'POST',
          url: `.netlify/functions/${func}`,
          baseURL: location.protocol + '//' + location.host,
          data: {
            baseUrl: this.$store.state.server,
            token: token,
            input: input,
            parameters: params,
          },
        })
          .then( res => resolve(res) )
          .catch ( err => reject(err) )
      })
    },

    rerunBlock ( index ) {
      if (this.isRunning)
        return

      this.blockOutput.splice(index, this.blockOutput.length - index)
      this.blockStatus.splice(index, this.blockStatus.length - index)

      this.runProcessor()
    },

    addBlock ( sender ) {
      if (sender != null)
      {
        this.processor.blocks.push( sender )
        this.processor.params.push({})
      }
      this.updateBlock ( )
    },

    removeBlock ( index ) {
      this.blockOutput.splice(index, this.blockOutput.length - index)
      this.blockStatus.splice(index, this.blockStatus.length - index)

      this.processor.params.splice(index, 1)
      this.processor.blocks.splice(index, 1)
      this.updateBlock ( )
    },

    updateParam ( payload ) {
      this.blockOutput.splice(payload.index, this.blockOutput.length - payload.index)
      this.blockStatus.splice(payload.index, this.blockStatus.length - payload.index)
      
      this.processor.params[payload.index] = Object.assign({}, ...
        Object.entries(payload.params).filter(([k,v]) => {
          if (v === null)
            return false

          if (typeof v == 'boolean')
            return v
          
          return Object.keys(v).length > 0
        }).map(([k,v]) => ({[k]:v}))
      )
      this.updateBlock ( )
    },

    updateName( args ) {
      this.processor.name = args.text
      this.$store.dispatch( 'updateProcessor', { _id: this.id, name: this.processor.name } )
    },

    updateTags: debounce( function( e ) {
      this.$store.dispatch( 'updateProcessor', { _id: this.id, tags: this.processor.tags } )
    }, 1000 ),

    updateBlock ( ) {
      this.$store.dispatch('updateProcessor',
        {
          _id: this.id,
          blocks: this.processor.blocks,
          params: this.processor.params,
        }
      )
    },
    
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

    getToken( block ) {
      if (block.msal)
      {
        var tokenID = 'msal|' + block.msal.clientId

        if (this.$store.state.tokens.hasOwnProperty(tokenID))
          return this.$store.state.tokens[tokenID]
      }

      return Axios.defaults.headers.common[ 'Authorization' ]
    }
  },
  activated( ) {
    this.id = this.$route.params.processorId

    if (this.id == 'import')
    {
      var parsed = null
      
      try
      {
        console.log(this.$route.query.processor)
        parsed = JSON.parse(decodeURI(atob(this.$route.query.processor)))
      }
      catch
      {
        console.log( 'failed to import' )
        this.$router.push( `/processors/` )
      }

      if (parsed)
      {
        parsed.name = 'Imported: ' + parsed.name
        this.$store.dispatch( 'createProcessor', parsed )
          .then( res => {
            this.processor = res
            this.id = this.processor._id
            this.$router.replace( `${this.id}` )

            console.log( 'activated' )
            this.isLoading = false
          })
          .catch( err => {
            console.log( 'failed to import' )
            this.$router.push( `/processors/` )
          })
      }
    }
    else
    {
      this.$store.dispatch('getProcessor', { _id: this.id })
        .then( res => {
          if (res == null)
            this.$router.push( `/processors/` )
          
          this.processor = res

          console.log( 'activated' )
        })
    }
  },
  deactivated( ) {
    this.processor = null

    this.blockStatus.splice(0, this.blockStatus.length) 
    this.blockOutput.splice(0, this.blockOutput.length) 
    
    console.log( 'de-activated' )
  },
}
</script>
<style scoped lang='scss'>
</style>
