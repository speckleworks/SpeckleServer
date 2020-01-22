<template>
  <v-card class="elevation-0">
    <v-card-title class='title font-weight-light'>
      <div align="center">
      <v-icon small left>import_export</v-icon>&nbsp;
      <b>SpeckleViz&trade;</b>&nbsp;
      <v-btn class="ml-6" round href="https://speckle.systems/docs/web/speckleviz/" target="_blank">
        <v-icon left>help_outline</v-icon>
        need help? read the docs
        <v-icon right>arrow_right_alt</v-icon>
      </v-btn>
      </div>
  
    </v-card-title>
    <v-container fluid>
      <v-layout>
        <v-toolbar>
          <v-switch class="custom-switch" v-model="switchForce" color="blue lighten-2" hide-details>
            <template v-slot:label>
              <v-chip outline>
                Data flow per&nbsp;
                <v-icon v-if="switchForce">supervised_user_circle</v-icon>
                <v-icon v-if="!switchForce">folder</v-icon>
              </v-chip>
            </template>
          </v-switch>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon @click="refresh()" v-on="on">
                <v-icon>refresh</v-icon>
              </v-btn>
            </template>
            <span>Refresh</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon @click="saveAsPNG()" v-on="on">
                <v-icon>save_alt</v-icon>
              </v-btn>
            </template>
            <span>Save as PNG</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon @click="toggleFix = !toggleFix" v-on="on" v-model="toggleFix">
                <v-icon v-if="!toggleFix">center_focus_weak</v-icon>
                <v-icon v-if="toggleFix">filter_center_focus</v-icon>
              </v-btn>
            </template>
            <span>Fix/Release the graph</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon @click="refocus()" v-on="on">
                <v-icon>gps_fixed</v-icon>
              </v-btn>
            </template>
            <span>Recenter focus</span>
          </v-tooltip>
          <v-menu offset-y>
            <template v-slot:activator="{ on }">
              <v-btn small v-on="on">Edges Display</v-btn>
            </template>
            <v-list>
              <v-list-tile
                v-for="(item, index) in edgesdisplay"
                :key="index"
                @click="selectedEdgesDisplay = item.title"
              >
                <v-list-tile-title>
                  <b v-if="item.title==selectedEdgesDisplay">{{item.title}}</b>
                  <span v-else class="font-weight-light">{{item.title}}</span>
                </v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
          <v-menu offset-y>
            <template v-slot:activator="{ on }">
              <v-btn small v-on="on">Graph Layout</v-btn>
            </template>
            <v-list>
              <v-list-tile
                v-for="(item, index) in graphlayout"
                :key="index"
                @click="selectedGraphLayout = item.title; refresh()"
              >
                <v-list-tile-title>
                  <b v-if="item.title==selectedGraphLayout">{{item.title}}</b>
                  <span v-else class="font-weight-light">{{item.title}}</span>
                </v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
          <v-slider
            v-model="documentLinksForce"
            always-dirty
            :thumb-size="24"
            color="grey darken-1"
            append-icon="zoom_out_map"
            prepend-icon="group_work"
            @click:append="expandDocuments"
            @click:prepend="collapseDocuments"
            :max="300"
            :min="-50"
            hide-details
            label
          ></v-slider>
        </v-toolbar>
      </v-layout>
      <v-divider class="ml-2" vertical></v-divider>
      <br />
      <br />
      <vue-slider
        ref="timeSlider"
        :data="dates"
        v-model="sliderValue"
        process-dragable
        :piecewise-label="dates.length < 5 ? true : false"
        xxxwidth="100%"
        xxxstyle="margin-left:10%"
        :tooltipStyle="{ 'font-size':'11px' }"
        v-if="dates.length>0"
      ></vue-slider>
      <span
        class="font-weight-light caption"
      >Drag this slider to select and highlight a specific timeframe from your project!</span>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon @click="inspectTimeframe = !inspectTimeframe" v-on="on">
            <v-badge top>
              <span slot="badge" v-if="streamsInTimeFrame.length">{{streamsInTimeFrame.length}}</span>
              <v-icon>360</v-icon>
            </v-badge>
          </v-btn>
        </template>
        <span>Inspect the timeframe</span>
      </v-tooltip>
      <v-autocomplete
        v-model="allStreamTagsJSON_default"
        :items="allStreamTagsJSON"
        filled
        chips
        label="Select streams by tag(s)"
        item-text="name"
        item-value="name"
        multiple
        prepend-icon="search"
        dense
        item-color="black"
      >
        <template v-slot:selection="data">
          <v-chip
            outline
            :selected="data.selected"
            close
            class="chip--select-multi"
            @input="remove(data.item)"
          >{{ data.item.name }}</v-chip>
        </template>
        <template v-slot:item="data">
          <template v-if="typeof data.item !== 'object'">
            <v-list-tile-content v-text="data.item.name"></v-list-tile-content>
          </template>
          <template v-else>
            <v-list-tile-content>
              <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
            </v-list-tile-content>
          </template>
        </template>
        <template v-slot:append-outer>
          <v-slide-x-reverse-transition mode="out-in">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn icon @click="inspectSelectedTags = !inspectSelectedTags" v-on="on">
                  <v-badge top color="cyan">
                    <span slot="badge" v-if="taggedStreams.length">{{taggedStreams.length}}</span>
                    <v-icon>360</v-icon>
                  </v-badge>
                </v-btn>
              </template>
              <span>Inspect the tagged streams</span>
            </v-tooltip>
          </v-slide-x-reverse-transition>
        </template>
      </v-autocomplete>
      
    </v-container>
    <!-- END OF TOOLBAR / SVG CANVAS STARTS HERE -->
    <div id="appClientGraph">
      <svg v-if="!redrawToggle || !result" width="100%" :height="svgHeight" />
      <ForceDirectedLayout
        v-if="result && redrawToggle"
        :svgHeight="svgHeight"
        :showDocGroups="toggle_multiple"
        :clientdata="result"
        :clientdatafilter="filteredResult"
        :timeFilter="filteredTime"
        :toggleFix="toggleFix"
        :documentLinksForce="documentLinksForce"
        :switchForce="switchForce"
        :linearcs="linearcs"
        :brush="brush"
        :inspectTimeframe="inspectTimeframe"
        :inspectSelectedTags="inspectSelectedTags"
        :streamTags="allStreamTagsJSON_default"
        :refocus="focus"
        :selectedEdgesDisplay="selectedEdgesDisplay"
        :selectedGraphLayout="selectedGraphLayout"
        @triggeredTimeFrame="triggeredTimeFrame"
        @triggeredTags="triggeredTags"
        :parcoords_selstreams="parcoords_selstreams"
      />
    </div>
  </v-card>
</template>


<script>
import ForceDirectedLayout from "./ForceDirectedLayout.vue"
import VueSlider from "vue-slider-component"
import axios from "axios"
import Vue from "vue"
import AsyncComputed from "vue-async-computed"
import svgtopng from "save-svg-as-png"
import ParCoords from 'parcoord-es'

Vue.use(AsyncComputed)

export default {
  name: "ClientGraph",
  components: {
    ForceDirectedLayout,
    VueSlider
  },
  props: {
    project: Object
  },
  data: () => ({
    edgesdisplay: [
      { title: "Line" },
      { title: "Arc" },
      { title: "Diagonal Horizontal" },
      { title: "Diagonal Vertical" },
      { title: "Diagonal Smart" }
    ],

    graphlayout: [
      { title: "Free" },
      { title: "Horizontal" },
      { title: "Vertical" }
    ],

    friends: null,
    dialog: false,
    brush: true,
    switchForce: false,
    documentLinksForce: -50,
    toggleFix: false,
    dates: [],
    sliderValue: [],
    linearcs: false,
    showDocGroups: true,
    redrawToggle: true,
    result: null,
    inspectTimeframe: true,
    inspectSelectedTags: true,
    sortedNodesByCreationDate: null,
    svgHeight: 700,
    filteredResult: null,
    filteredTime: null,
    dateMinMax: [],
    allStreamTags: [],
    allStreamTagsJSON: [],
    allStreamTagsJSON_default: [],
    isUpdating: false,
    streamsInTimeFrame: [],
    taggedStreams: [],
    focus: false,
    selectedEdgesDisplay: "Diagonal Horizontal",
    selectedGraphLayout: "Horizontal",
    parcoords: null,
    all_userInfo: [],
    all_userCode: [],
    all_streamTags: [],
    all_streamCreatedAt: [],
    all_streamUpdatedAt: [],
    parcoords_rawData: [],
    parcoords_permut_data: [],
    parcoords_selstreams: [],
    parcoords_nodupdata: []
  }),
  computed: {
    toggle_multiple: function() {
      if (this.switchForce) {
        return [2]
      }
      if (!this.switchForce) {
        return [1]
      } else {
        return [1, 2]
      }
    }
  },

  watch: {
    selectedGraphLayout: function() {
      if (this.selectedGraphLayout == "Free") {
        this.$data.selectedEdgesDisplay = "Diagonal Smart"
      }
      if (this.selectedGraphLayout == "Horizontal") {
        this.$data.selectedEdgesDisplay = "Diagonal Horizontal"
      }
      if (this.selectedGraphLayout == "Vertical") {
        this.$data.selectedEdgesDisplay = "Diagonal Vertical"
      }
    },
    sliderValue: function() {
      
      this.filteredTime = this.sliderValue.map(d => new Date(d).toISOString())
    },

    isUpdating(val) {
      if (val) {
        setTimeout(() => (this.isUpdating = false), 3000)
      }
    }
  },

  methods: {
    redrawParcoords(){
      this.$data.parcoords_selstreams = []
      let context = this
      let parcoords = ParCoords()("#example")
          .data(
          context.$data.parcoords_nodupdata
          )
          .render()
          .createAxes()
          .reorderable()
          .brushMode("1D-axes-multi")
          parcoords.on('brushend', function(brushed, args){
          context.$data.parcoords_selstreams = Array.from(new Set(brushed.map(e => e.stream_id)))
      })
    },
    triggeredTimeFrame(val) {
      this.streamsInTimeFrame = val 
    },
    triggeredTags(val) {
      this.taggedStreams = val 
    },

    remove(item) {
      const index = this.allStreamTagsJSON_default.indexOf(item.name) 
      if (index >= 0) this.allStreamTagsJSON_default.splice(index, 1) 
    },

    flatten(arr) {
      let flat = [] 
      for (let i = 0; i < arr.length; i++) {
        flat = flat.concat(arr[i])
      }
      return flat
    },
    collapseDocuments() {
      this.documentLinksForce = this.documentLinksForce - 10 
    },
    expandDocuments() {
      this.documentLinksForce = this.documentLinksForce + 10 
    },
    getMin() {
      let createdAts = this.sortedNodesByCreationDate.map(d => d.createdAt) 
      return createdAts[this.value3[0]] 
    },
    getMax() {
      let createdAts = this.sortedNodesByCreationDate.map(d => d.createdAt) 
      return createdAts[this.value3[1]] 
    },
    mounted() {

      

    },
    saveAsPNG() {
      svgtopng.saveSvgAsPng(
        document.getElementById("graphLayout"),
        "diagram.png",
        { scale: 3 }
      ) 
    },
    refocus() {
      this.$data.focus = !this.$data.focus 
    },
    refresh() {
      this.$asyncComputed.myResolvedValue.update() 
      this.$data.redrawToggle = false 
      setTimeout(() => {
        this.$data.redrawToggle = true 
      }, 500) 
    },
    AddResizeListener() {
      //redraw the chart 300ms after the window has been resized
      let context = this
      window.addEventListener("resize", () => {
        this.$data.redrawToggle = false 
          

        setTimeout(() => {
          this.$data.redrawToggle = true 
        }, 1500) 
        
      }) 
    }
  },
  updated() {
    // this.redrawParcoords()
    this.AddResizeListener()
  },
  asyncComputed: {
    async myResolvedValue() {
      this.toggleFix = false 
      let streamLinks = [] 
      let nodes = [] 

      let resProject 
      try {
        resProject = await axios.get(
          `${this.$store.state.server}/projects/${this.project._id}`
        ) 
      } catch (err) {
        console.log(err) 
        return 
      }
      
      let allusersSet = new Set([resProject.data.resource.owner, resProject.data.resource.canRead, resProject.data.resource.canWrite])
      let allusers = [...allusersSet].flat()
      allusers = [...new Set(allusers)]
      //this.$data.all_userInfo = allusers
      
      
      for (let i = 0; i < allusers.length; i++) {   
          let user = allusers[i]
          let resOwner
          try {
            resOwner = await axios.get(
              `${this.$store.state.server}/accounts/${user}`
            )
          }catch (error) {
            console.log("Can't access user info") 
          }
          let userInfo = resOwner.data.resource 
          //console.log(userInfo)

          let userCode = `${userInfo.name} ${userInfo.surname} @ ${userInfo.company}`
          this.$data.all_userCode.push(userCode)
          this.$data.all_userInfo.push(userInfo)
      }

      let projectStreams = resProject.data.resource.streams 
      let projectPermissions = resProject.data.resource.permissions 

      let alltags = [] 
      for (let i = 0; i < projectStreams.length; i++) {
        let streamShortID = projectStreams[i] 
        let stream_id 
        let resStream 

        try {
          resStream = await axios.get(
            `${this.$store.state.server}/streams/${streamShortID}`
          ) 


          let streamOwnerID = resStream.data.resource.owner 
          let resOwner
          try {
            resOwner = await axios.get(
              `${this.$store.state.server}/accounts/${streamOwnerID}`
            )
          }catch (error) {
            console.log("Can't access user info") 
          }
          let userInfo = resOwner.data.resource


          stream_id = resStream.data.resource._id
          let streamCanRead = resStream.data.resource.canRead
          let streamCanWrite = resStream.data.resource.canWrite
          let streamCreatedAt = resStream.data.resource.createdAt
          let streamUpdatedAt = resStream.data.resource.updatedAt
          let streamName = resStream.data.resource.name
          let streamTags = resStream.data.resource.tags
          let objectsNumber = resStream.data.resource.objects.length
          let units = resStream.data.resource.baseProperties.units
          let tolerance = resStream.data.resource.baseProperties.tolerance
          

          let rawData = {stream_id: stream_id, canRead: streamCanRead, canWrite: streamCanWrite, tags: streamTags, objNum: objectsNumber, owner: streamOwnerID, createdAt: new Date(streamCreatedAt).toLocaleString("en-GB"), updatedAt: new Date(streamUpdatedAt).toLocaleString("en-GB"), units: units, tol: tolerance}

          // handles empty array exception
          Object.keys(rawData).forEach((key,i) => 
            {if(Array.isArray(rawData[key]) && (rawData[key].length < 1)){
              rawData[key] = ["undefined"]
            }
          })

          this.$data.parcoords_rawData.push(rawData)

          for (let j = 0; j < streamTags.length; j++) {
            this.$data.allStreamTagsJSON.push({ name: streamTags[j] })
          }
          alltags.push(streamTags) 

          nodes.push({
            type: "Stream",
            _id: stream_id,
            streamId: streamShortID,
            owner: streamOwnerID,
            createdAt: streamCreatedAt,
            updatedAt: streamUpdatedAt,
            size: "10",
            objectsNumber: objectsNumber,
            name: `🛰️📦${streamName}`,
            tags: streamTags,
            canRead: streamCanRead,
            canWrite: streamCanWrite,
            units: units,
            tolerance: tolerance
          }) 
        } catch (error) {
          console.log("Can't access stream: " + streamShortID)
        }

        //
        let resClient 
        try {
          resClient = await axios.get(
            `${this.$store.state.server}/streams/${streamShortID}/clients`
          )

          for (let j = 0; j < resClient.data.resources.length; j++) {
            let client_id = resClient.data.resources[j]._id 
            let clientOwnerID = resClient.data.resources[j].owner 
            
            let resOwner
            try {
              resOwner = await axios.get(
                `${this.$store.state.server}/accounts/${clientOwnerID}`
              )
            }catch (error) {
              console.log("Can't access user info") 
            }

            
            let userInfo = resOwner.data.resource
            let clientCanRead = resClient.data.resources[j].canRead 
            let clientCreatedAt = resClient.data.resources[j].createdAt 
            let clientUpdatedAt = resClient.data.resources[j].updatedAt 
            let clientRole = resClient.data.resources[j].role 
            let clientDocumentType = resClient.data.resources[j].documentType 
            let clientDocumentName = resClient.data.resources[j].documentName 
            let clientDocumentID = resClient.data.resources[j].documentGuid 
            let customName = `` 

            if (clientRole == "Sender") {
              customName = `🚀` 
            }
            if (clientRole == "Receiver") {
              customName = `📡` 
            }

            nodes.push({
              type: "Client",
              _id: client_id,
              owner: clientOwnerID,
              userInfo: userInfo,
              createdAt: clientCreatedAt,
              updatedAt: clientUpdatedAt,
              role: clientRole,
              size: "10",
              documentType: clientDocumentType,
              documentName: clientDocumentName,
              documentGuid: clientDocumentID,
              name: customName // S or R labels for Senders and Receivers
            }) 
            

            if (clientRole == "Receiver") {
              streamLinks.push({
                source: stream_id,
                target: client_id,

                targetClient: client_id,
                targetDoc: clientDocumentID,
                action: "receiving"
              }) 
            } else if (clientRole == "Sender") {
              streamLinks.push({
                source: client_id,
                target: stream_id,

                sourceClient: client_id,
                sourceDoc: clientDocumentID,
                action: "sending"
              }) 
            }
          }
        } catch (error) {
          console.log("Can't access stream's client from " + streamShortID) 
        }
      }


      this.allStreamTags = this.flatten(alltags) 
      this.sortedNodesByCreationDate = nodes 
      this.sortedNodesByCreationDate.sort(function(a, b) {
        return a.createdAt < b.createdAt
          ? -1
          : a.createdAt > b.createdAt
          ? 1
          : 0 
      }) 

      let createdAts = this.sortedNodesByCreationDate.map(d => d.createdAt) 

      this.result = [nodes, streamLinks] 
      //this.value3 = [0,this.result[0].length-1]
      this.dates = createdAts 
      this.dates = createdAts.map(d => new Date(d).toLocaleString("en")) 
      this.dates = [...new Set(this.dates)]

      
      this.sliderValue = [this.dates[0], this.dates[this.dates.length - 1]] 


      // find all permutations
      for (let i = 0; i < this.$data.parcoords_rawData.length; i++) {
        for(let j = 0; j < this.$data.parcoords_rawData[i].canRead.length; j++){
          for(let k = 0; k < this.$data.parcoords_rawData[i].canWrite.length; k++){
            for(let l = 0; l < this.$data.parcoords_rawData[i].tags.length; l++){
              let index_canRead = this.$data.all_userInfo.map(e => e._id).indexOf(this.$data.parcoords_rawData[i].canRead[j]) 
              let index_canWrite = this.$data.all_userInfo.map(e => e._id).indexOf(this.$data.parcoords_rawData[i].canWrite[k]) 
              let index_owner = this.$data.all_userInfo.map(e => e._id).indexOf(this.$data.parcoords_rawData[i].owner) 
              if(index_canRead == "-1" || index_canWrite == "-1"){
                  // HANDLE CASE IF MORE USER PERMISSIONS IN STREAMS
              }else{
                let parcoord_permut = {stream_id: this.$data.parcoords_rawData[i].stream_id, canRead: this.$data.all_userCode[index_canRead].split('@')[0], canWrite: this.$data.all_userCode[index_canWrite].split('@')[0], tags: this.$data.parcoords_rawData[i].tags[l], objNum: this.$data.parcoords_rawData[i].objNum, owner: this.$data.all_userCode[index_owner], "owner's company": this.$data.all_userInfo[index_owner].company, createdAt: this.$data.parcoords_rawData[i].createdAt, updatedAt: this.$data.parcoords_rawData[i].updatedAt, units: this.$data.parcoords_rawData[i].units, tol: this.$data.parcoords_rawData[i].tol} 
                this.$data.parcoords_permut_data.push(parcoord_permut) 
              }
            }
          }
        }
      }
      
      this.$data.parcoords_nodupdata = Array.from(new Set(this.$data.parcoords_permut_data))

      let context = this
      let parcoords = ParCoords()("#example")
          .data(
          context.$data.parcoords_nodupdata
          )
          .render()
          .createAxes()
          .reorderable()
          .brushMode("1D-axes-multi")
          parcoords.on('brushend', function(brushed, args){
          context.$data.parcoords_selstreams = Array.from(new Set(brushed.map(e => e.stream_id)))
      })
      return [nodes, streamLinks] 
    }
  }
} 
</script>

<style lang='scss'>
#appClientGraph {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 30px;
}
.vue-slider-piecewise {
  z-index: 100 !important;
  pointer-events: none;
}

.vue-slider-piecewise-item {
  z-index: 100 !important;
}

.custom-switch .v-input--selection-controls__input div {
  color: #f06292;
}
// .v-list--dense {
//   background: transparent !important;
// }

// .v-select-list {
//   background: transparent !important;
// }

// .transparent {
//    background-color: white!important;
//    opacity: 0.65;
//    border-color: transparent!important;
//  }

</style>
