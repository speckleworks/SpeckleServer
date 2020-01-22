<template>
  <div id="clientGraph">
    <svg width="100%" :height="svgHeight" id="graphLayout">
      <g class="everything">
        <g v-show="!switchForce" id="hullDoc" />
        <g v-show="!switchForce" id="cenDoc" />
        <g v-show="!switchForce" id="textDoc" />
        <g v-show="switchForce" id="hullOwner" />
        <g v-show="switchForce" id="cenOwner" />
        <g v-show="switchForce" id="textOwner" />
        <g id="pathLink" />
        <g id="marker" />
        <g id="circleSender" />
        <g id="circleReceiver" />
        <!-- <g id="rectParcoords" /> -->
        <g id="rectStream" />
        <g id="text" />
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3"
import ParCoords from 'parcoord-es'


export default {
  name: "ForceDirectedLayout",

  props: {
    clientdata: Array,
    svgHeight: Number,
    showDocGroups: Array,
    clientdatafilter: Array,
    timeFilter: Array,
    toggleFix: Boolean,
    brush: Boolean,
    documentLinksForce: Number,
    switchForce: Boolean,
    inspectTimeframe: Boolean,
    inspectSelectedTags: Boolean,
    streamTags: Array,
    refocus: Boolean,
    selectedEdgesDisplay: String,
    selectedGraphLayout: String,
    parcoords_selstreams: Array,
  },

  watch: {
    // parcoords_selstreams: function(){
    //   let context = this
    //   Array.from(document.querySelector("#rectParcoords").children).forEach(
    //     function(d) {
    //       if(context.$props.parcoords_selstreams.includes(d3.select(d).datum()._id)){
    //         d.classList.add("parcoordsSelection")
    //       }else{
    //         d.classList.remove("parcoordsSelection")
    //       }

    //     }
    //   )
    // },
    selectedGraphLayout: function() {
      this.drawGraph.tick()
    },

    selectedEdgesDisplay: function() {
      this.drawGraph.tick()
    },

    refocus: function() {
      let container = d3.select(".everything")
      let zoom = d3
        .zoom()
        .scaleExtent([0, 0])
        .on("zoom", () => {
          container.attr("transform", d3.event.transform)
        })
      d3.select("#graphLayout").call(
        zoom.transform,
        d3.zoomIdentity.translate(0, 0).scale(1)
      ) 
    },
    inspectSelectedTags: function() {
      let taggedStreams = [] 
      Array.from(document.querySelector("#rectStream").children).forEach(
        function(d) {
          if (d.classList.contains("tagSelected")) {
            taggedStreams.push(d3.select(d).datum().streamId) 
          } else {
          }
        }
      ) 
      let base = new URL(this.$store.state.server)
      let viewerUrl = base.origin + `/#/view/${taggedStreams.join(",")}`
      window.open(viewerUrl, "_blank").focus() 
    },
    streamTags: function() {
      let context = this 
      Array.from(document.querySelector("#rectStream").children).forEach(
        function(d) {
          let myStreamTags = Array.from(d3.select(d).datum().tags) 
          let selected = context.findCommonElement(
            myStreamTags,
            context.streamTags
          ) 
          if (selected) {
            d.classList.remove("tagSelected") 
            //context.selectedTaggedStreams.splice( context.selectedTaggedStreams.indexOf(d3.select(d).datum().streamId), 1 )
            if (
              context.selectedTaggedStreams.indexOf(
                d3.select(d).datum().streamId
              ) != -1
            ) {
              context.selectedTaggedStreams.splice(
                context.selectedTaggedStreams.indexOf(
                  d3.select(d).datum().streamId
                ),
                1
              ) 
            }
            d.classList.add("tagSelected") 
            context.selectedTaggedStreams.push(d3.select(d).datum().streamId) 
          } else {
            d.classList.remove("tagSelected") 
            if (
              context.selectedTaggedStreams.indexOf(
                d3.select(d).datum().streamId
              ) != -1
            ) {
              context.selectedTaggedStreams.splice(
                context.selectedTaggedStreams.indexOf(
                  d3.select(d).datum().streamId
                ),
                1
              ) 
            }
          }
        }
      ) 
      context.$emit("triggeredTags", context.selectedTaggedStreams) 
    },
    inspectTimeframe: function() {
      let selectedStreams = [] 
      Array.from(document.querySelector("#rectStream").children).forEach(
        function(d) {
          if (d.classList.contains("selected")) {
            selectedStreams.push(d3.select(d).datum().streamId) 
          }
        }
      ) 

      let base = new URL(this.$store.state.server)
      let viewerUrl = base.origin + `/#/view/${selectedStreams.join(",")}`

      window.open(viewerUrl, "_blank").focus() 
    },
    brush: function() {
    },
    switchForce: function() {
      if (this.switchForce) {
        this.$data.simulation
          .force("link")
          .links(
            this.forceLinks.filter(d => d.type != "documentGuidForceGroup")
          ) 
        this.$data.simulation.alpha(1).restart() 
      } else {
        this.$data.simulation
          .force("link")
          .links(this.forceLinks.filter(d => d.type != "ownerForceGroup")) 
        this.$data.simulation.alpha(1).restart() 
      }
    },

    documentLinksForce: function() {
      this.$data.simulation.force("link").distance(d => {
        if (d.type == "ownerForceGroup") {
          return this.documentLinksForce 
        } else if (d.type == "documentGuidForceGroup") {
          return this.documentLinksForce 
        } else {
          return 116 
        }
      }) 
      this.$data.simulation.alpha(1).restart() 
    },
    toggleFix: function() {
      if (this.toggleFix) {
        this.$data.simulation.stop() 
        d3.selectAll("circle").classed("fixed", d => {
          d.fixed = true 
        }) 
        d3.selectAll("rect").classed("fixed", d => {
          d.fixed = true 
        }) 
      } else {
        this.$data.simulation.alphaTarget(0.3).restart() 
        d3.selectAll("circle").classed("fixed", d => {
          d.fixed = false 
        }) 
        d3.selectAll("rect").classed("fixed", d => {
          d.fixed = false 
        }) 
      }
    },
    clientdatafilter: function() {
 
    },

    timeFilter: function() {
      this.updateDisplayNodes("#circleSender") 
      this.updateDisplayNodes("#circleReceiver") 
      this.updateDisplayNodes("#rectStream") 
      this.updateDisplayNodes("#text") 
      this.updateDisplayLinks("#pathLink") 
    }
  },

  data: () => ({
    forceLinks: [],
    shiftKey: null,
    filteredNodes: null,
    colour: null,
    groupPath: null,
    simulation: null,
    selectedTaggedStreams: [],
    svgWidth: document.getElementById("appClientGraph").offsetWidth,
    context: this,


    hullPadding: 11,

    roundedHull: function(polyPoints) {
      
      // Returns the SVG path data string representing the polygon, expanded and rounded.

      // Handle special cases
      if (!polyPoints || polyPoints.length < 1) return "" 
      if (polyPoints.length === 1) return this.roundedHull1(polyPoints) 
      if (polyPoints.length === 2) return this.roundedHull2(polyPoints) 

      let segments = new Array(polyPoints.length) 

      // Calculate each offset (outwards) segment of the convex hull.
      for (
        let segmentIndex = 0;
        segmentIndex < segments.length;
        ++segmentIndex
      ) {
        let p0 =
          segmentIndex === 0
            ? polyPoints[polyPoints.length - 1]
            : polyPoints[segmentIndex - 1]
        let p1 = polyPoints[segmentIndex]

        // Compute the offset vector for the line segment, with length = hullPadding.
        let offset = vecScale(this.hullPadding, this.unitNormal(p0, p1))

        segments[segmentIndex] = [this.vecSum(p0, offset), this.vecSum(p1, offset)] 
      }

      let arcData = "A " + [this.hullPadding, this.hullPadding, "0,0,0,"].join(",") 

      segments = segments.map(function(segment, index) {
        let pathFragment = "" 
        if (index === 0) {
          let pathFragment = "M " + segments[segments.length - 1][1] + " " 
        }
        pathFragment += arcData + segment[0] + " L " + segment[1] 

        return pathFragment 
      }) 

      return segments.join(" ") 
    },
    roundedHull1: function(polyPoints) {
      // Returns the path for a rounded hull around a single point (a circle).
      let p1 = [polyPoints[0][0], polyPoints[0][1] - this.hullPadding] 
      let p2 = [polyPoints[0][0], polyPoints[0][1] + this.hullPadding] 
      return (
        "M " +
        p1 +
        " A " +
        [this.hullPadding, this.hullPadding, "0,0,0", p2].join(",") +
        " A " +
        [this.hullPadding, this.hullPadding, "0,0,0", p1].join(",")
      ) 
    },
    roundedHull2: function(polyPoints) {
      // Returns the path for a rounded hull around two points (a "capsule" shape).
      let offsetVector = this.vecScale(
        this.hullPadding,
        this.unitNormal(polyPoints[0], polyPoints[1])
      ) 
      let invOffsetVector = this.vecScale(-1, offsetVector) 
      let p0 = this.vecSum(polyPoints[0], offsetVector) 
      let p1 = this.vecSum(polyPoints[1], offsetVector) 
      let p2 = this.vecSum(polyPoints[1], invOffsetVector) 
      let p3 = this.vecSum(polyPoints[0], invOffsetVector) 
      return (
        "M " +
        p0 +
        " L " +
        p1 +
        " A " +
        [this.hullPadding, this.hullPadding, "0,0,0", p2].join(",") +
        " L " +
        p3 +
        " A " +
        [this.hullPadding, this.hullPadding, "0,0,0", p0].join(",")
      ) 
    },
    vecScale: function(scale, v) {
      // Returns the vector 'v' scaled by 'scale'.
      return [scale * v[0], scale * v[1]] 
    },
    vecSum: function(pv1, pv2) {
      // Returns the sum of two vectors, or a combination of a point and a vector.
      return [pv1[0] + pv2[0], pv1[1] + pv2[1]] 
    },
    unitNormal: function(p0, p1) {
      // Returns the unit normal to the line segment from p0 to p1.
      let n = [p0[1] - p1[1], p1[0] - p0[0]] 
      let nLength = Math.sqrt(n[0] * n[0] + n[1] * n[1]) 
      return [n[0] / nLength, n[1] / nLength] 
    }
  }),

  methods: {

    menuClient(){ 
      
      return [
        {
          title: "Client Info",
          action: function(d, i) {
            let data = d3.select(d).datum() 
            window.alert(
              d3.select(d).datum().documentType +
                ": " +
                d3.select(d).datum().documentName +
                "\n" +
                "Created at" +
                ": " +
                d3.select(d).datum().createdAt +
                "\n" +
                "Updated at" +
                ": " +
                d3.select(d).datum().updatedAt +
                "\n" +
                "Owner is" +
                ": " +
                d3.select(d).datum().owner
            ) 
          }
        }
      ]},
      menuStream(){ 
            
            let context = this
            
            return [
            
            {
              title: "View Stream in Viewer",
              action: function(d, i) {
                let data = d3.select(d).datum()
                let base = new URL(context.$store.state.server)
                let viewerUrl = base.origin + `/#/view/${data.streamId}`
                window.open(viewerUrl, "_blank").focus() 
              },
              disabled: false // optional, defaults to false
            },
            {
              title: "View Stream in Admin",
              action: function(d, i) {
                let data = d3.select(d).datum()
                let base = new URL(context.$store.state.server)
                let adminUrl = base.origin + `/#/streams/${data.streamId}`
                window.open(adminUrl, "_blank").focus()
              },
              disabled: false // optional, defaults to false
            },
            {
              title: "View Stream Data",
              action: function(d, i) {
                let data = d3.select(d).datum()
                let base = new URL(context.$store.state.server)
                let dataUrl = base + `/streams/${data.streamId}`
                window.open(dataUrl, "_blank").focus()
              }
            },
            {
              title: "View Connected Clients",
              action: function(d, i) {
                let data = d3.select(d).datum()
                let base = new URL(context.$store.state.server)
                let dataUrlClients = base + `/streams/${data.streamId}/clients`
                window.open(dataUrlClients, "_blank").focus() 
              }
            }
          ]},

    zoom_actions() {
      d3.select(".everything").attr("transform", d3.event.transform) 
    },

    findCommonElement(array1, array2) {
      for (let i = 0; i < array1.length; i++) {
        for (let j = 0; j < array2.length; j++) {
          if (array1[i] === array2[j]) {
            return true
          }
        }
      }
      return false
    },

    // Drag events for the whole d3 force simulation
    drag() {
      let parentContext = this 
      function dragstarted(d) {
        if (!d3.event.active)
          parentContext.simulation.alphaTarget(0.3).restart() 
        d.fx = d.x 
        d.fy = d.y 
      }

      function dragged(d) {
        d.fx = d3.event.x 
        d.fy = d3.event.y 
      }

      function dragended(d) {
        if (!d3.event.active) parentContext.simulation.alphaTarget(0) 
        d.fx = null 
        d.fy = null 
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) 
    },

    updateDisplayLinks(id) {

      let context = this 
      Array.from(document.querySelector(id).children).forEach(function(node) {
        let nodeTimeComparerSource =
          new Date(node.getAttribute("source_timestamp"))
            .toISOString()
            .split(".")[0] + ".000Z" 
        let nodeTimeComparerTarget =
          new Date(node.getAttribute("target_timestamp"))
            .toISOString()
            .split(".")[0] + ".000Z" 

        if (
          nodeTimeComparerSource >= context.timeFilter[0] &&
          nodeTimeComparerSource <= context.timeFilter[1] &&
          (nodeTimeComparerTarget >= context.timeFilter[0] &&
            nodeTimeComparerTarget <= context.timeFilter[1])
        ) {
          node.style.opacity = 1 
          node.style.transition = "visibility 0s, opacity 0.4s linear" 
        } else {
          node.style.opacity = 0.2 
          node.style.transition = "visibility 0s, opacity 0.4s linear" 
        }
      }) 
    },
    updateDisplayNodes(id) {
      let context = this 

      Array.from(document.querySelector(id).children).forEach(function(node) {
        let nodeTimeComparer =
          new Date(node.getAttribute("timestamp")).toISOString().split(".")[0] +
          ".000Z" 
        if (
          nodeTimeComparer >= context.timeFilter[0] &&
          nodeTimeComparer <= context.timeFilter[1]
        ) {
          node.classList.remove("unselected") 
          node.classList.add("selected") 
          node.style.transition = "visibility 0s, opacity 0.4s linear" 

          node.style.opacity = 1 
        } else {
          //node.style.display = "none"
          node.classList.remove("selected") 
          node.classList.add("unselected") 
          node.style.opacity = 0.2 
          node.style.transition = "visibility 0s, opacity 0.4s linear" 
        }
      }) 

      let selectedStreams = [] 
      Array.from(document.querySelector("#rectStream").children).forEach(
        function(d) {
          if (d.classList.contains("selected")) {
            selectedStreams.push(d3.select(d).datum().streamId) 
          }
        }
      ) 
      context.$emit("triggeredTimeFrame", selectedStreams) 
    },

    contextMenu(type, menu, openCallback) {
      // create the div element that will hold the context menu
      d3.selectAll(".d3-context-menu")
        .data([1])
        .enter()
        .append("div")
        .attr("class", "d3-context-menu") 

      // close menu
      d3.select(".application--wrap").on("click.d3-context-menu", function() {
        d3.select(".d3-context-menu").style("display", "none") 
      }) 

      // this gets executed when a contextmenu event occurs
      return function(data, index) {
        let elm = this 

        d3.selectAll(".d3-context-menu").html("") 
        let list = d3.selectAll(".d3-context-menu").append("ul") 
        list
          .selectAll("li")
          .data(menu)
          .enter()
          .append("li")
          .attr("class", type)
          .html(function(d) {
            return d.title 
          })
          .on("click", function(d, i) {
            d.action(elm, data, index) 
            d3.select(".d3-context-menu").style("display", "none") 
          }) 

        // the openCallback allows an action to fire before the menu is displayed
        // an example usage would be closing a tooltip
        if (openCallback) openCallback(data, index) 

        // display context menu.
        d3.select(".d3-context-menu")
          .style("left", d3.event.pageX - 2 + "px")
          .style("top", d3.event.pageY - 2 + "px")
          .style("display", "block") 

        d3.event.preventDefault() 
      } 
    },
    groupBy(arr, property) {
      return arr.reduce(function(memo, x) {
        if (!memo[x[property]]) {
          memo[x[property]] = [] 
        }
        memo[x[property]].push(x) 
        return memo 
      }, {}) 
    },

    drawGraph() {
      let _nodes = this.clientdata[0] 
      let links = this.clientdata[1] 

      // Sorts all nodes by creation timestamps
      _nodes.sort(function(a, b) {
        return a.createdAt < b.createdAt
          ? -1
          : a.createdAt > b.createdAt
          ? 1
          : 0 
      }) 

      let thisContext = this 

      for (let i = 0; i < links.length; i++) {
        if (links[i].action === "sending") {
          let source = _nodes
            .map(function(e) {
              if (e.type === "Client") {
                return e._id 
              }
            })
            .indexOf(links[i].source) 

          // defines a source per client
          let sourceClient = _nodes
            .map(function(e) {
              if (e.type === "Client") {
                return e._id 
              }
            })
            .indexOf(links[i].sourceClient) 

          // defines a source per document
          let sourceDoc = _nodes
            .map(function(e) {
              if (e.type === "Client") {
                return e.documentGuid 
              }
            })
            .indexOf(links[i].sourceDoc) 

          let target = _nodes
            .map(function(e) {
              return e._id 
            })
            .indexOf(links[i].target) 

          thisContext.forceLinks.push({
            source,
            sourceDoc,
            sourceClient,
            target,
            type: `sending`,
            display: true
          }) 
        }
        if (links[i].action === "receiving") {
          let source = _nodes
            .map(function(e) {
              return e._id 
            })
            .indexOf(links[i].source) 

          let target = _nodes
            .map(function(e) {
              if (e.type === "Client") {
                return e._id 
              }
            })
            .indexOf(links[i].target) 

          // defines a target per document
          let targetDoc = _nodes
            .map(function(e) {
              if (e.type === "Client") {
                return e.documentGuid 
              }
            })
            .indexOf(links[i].targetDoc) 

          // defines a target per client
          let targetClient = _nodes
            .map(function(e) {
              if (e.type === "Client") {
                return e._id 
              }
            })
            .indexOf(links[i].targetClient) 

          thisContext.forceLinks.push({
            source,
            target,
            targetDoc,
            targetClient,
            type: `receiving`,
            display: true
          }) 
        }
      }

      let clientNodes = _nodes.filter(data => data.type == "Client") 
      let parentGroups = this.groupBy(clientNodes, "owner") 

    
    let circleOwnerData = []
      for (let property in parentGroups) {
        let parGroup = parentGroups[property] 

        // let sumX = 0
        // let sumY = 0
        // for (let i = 0; i < parGroup.length; i++) {
        //   sumX += parGroup[i].x
        //   sumY += parGroup[i].y
        // }
        // let avX = sumX / parGroup.length
        // let avY = sumY / parGroup.length
        let circCenterOwner = {"radius": 4, "color": "#7ebff3", userInfo: parGroup[0].userInfo}
        circleOwnerData.push(circCenterOwner)
      }


      for (let property in parentGroups) {
        let parGroup = parentGroups[property] 
        for (let i = 0; i < parGroup.length - 1; i++) {
          for (let j = i + 1; j < parGroup.length; j++) {
            thisContext.forceLinks.push({
              source: parGroup[i],
              target: parGroup[j],
              type: "ownerForceGroup",
              display: false
            }) 
          }
        }
      }



    let childGroups = this.groupBy(clientNodes, "documentGuid") 

    
    let circleDocData = []
      for (let property in childGroups) {
        let childGroup = childGroups[property] 
        let infoDoc = ""

        if(childGroup[0].documentType === "Rhino"){
          infoDoc = `rhi`
          circleDocData.push({"radius": 4, "color": "hotpink", "infoDoc": `rhi`})
        }
        else if(childGroup[0].documentType === "Dynamo"){
          infoDoc = `dyn`
          circleDocData.push({"radius": 4, "color": "hotpink", "infoDoc": `dyn`})
        }
        else if(childGroup[0].documentType === "GSA"){
          infoDoc = `gsa`
          circleDocData.push({"radius": 4, "color": "hotpink", "infoDoc": `gsa`})
        }
        else if(childGroup[0].documentType === "Grasshopper"){
          infoDoc = `grasshopper`
          circleDocData.push({"radius": 4, "color": "hotpink", "infoDoc": `grasshopper`})

        }
        // if(childGroup[0].documentType === "Revit"){
        //   infoDoc = `Revit`
        // }
        // if(childGroup[0].documentType === "Excel"){
        //   infoDoc = `📊`
        // }
        
        
        // let sumX = 0
        // let sumY = 0
        // for (let i = 0; i < childGroup.length; i++) {
        //   sumX += childGroup[i].x
        //   sumY += childGroup[i].y
        // }
        // let avX = sumX / childGroup.length
        // let avY = sumY / childGroup.length

        //let circCenterDoc = {"radius": 4, "color": "hotpink", "infoDoc": infoDoc}
        
      }

      for (let property in childGroups) {
        let childGroup = childGroups[property];
        for (let i = 0; i < childGroup.length - 1; i++) {          
          for (let j = i + 1; j < childGroup.length; j++) {
            thisContext.forceLinks.push({
              source: childGroup[i],
              target: childGroup[j],
              type: "documentGuidForceGroup",
              display: false
            });
          }
        }
      }

      // d3.select("#graphLayout")
      //   .call( d3.brush()                     // Add the brush feature using the d3.brush function
      //     .extent( [ [0,0], [this.$data.svgWidth,this.$props.svgHeight] ] )       // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      //   )

      let svg = d3.select("#graphLayout") 

      // let brush = svg.append("g")
      //   .attr("class", "brush");

      // if(this.$props.brush){
      // brush.call(d3.brush()
      //       .extent([[0, 0], [this.$data.svgWidth, this.$props.svgHeight]])
      //       .on("start", brushstarted)
      //       .on("brush", brushed)
      //       .on("end", brushended));
      // }

      this.$data.simulation = d3
        .forceSimulation()
        .nodes(d3.values(_nodes))
        //.force("forceX", d3.forceX(0).strength(0.08))
        .force(
          "link",
          d3.forceLink(thisContext.forceLinks).distance(d => {
            if (d.type == "ownerForceGroup") {
              return this.documentLinksForce 
            } else if (d.type == "documentGuidForceGroup") {
              return this.documentLinksForce 
            } else {
              return 100 
            }
          })
        )
        .force(
          "center",
          d3.forceCenter(this.$data.svgWidth / 2, this.$props.svgHeight / 2)
        )
        .force(
          "charge",
          d3.forceManyBody().strength(function(d) {
            if (d.type == "ownerForceGroup") {
              return 200 
            } else if (d.type == "documentGuidForceGroup") {
              return 200 
            } else {
              return -700 
            }
          })
        )
        .on("tick", tick) 

      if (this.selectedGraphLayout == "Free") {
        this.$data.simulation
          .force("forceX", d3.forceX(0).strength(0))
          .force("forceY", d3.forceY(0).strength(0)) 
      }

      if (this.selectedGraphLayout == "Horizontal") {
        this.$data.simulation
          .force("forceX", d3.forceX(0).strength(0))
          .force("forceY", d3.forceY(0).strength(0.08)) 
      }

      if (this.selectedGraphLayout == "Vertical") {
        this.$data.simulation
          .force("forceX", d3.forceX(0).strength(0.08))
          .force("forceY", d3.forceY(0).strength(0)) 
      }

      //add zoom capabilities
      let zoom_handler = d3.zoom().on("zoom", this.zoom_actions) 

      zoom_handler(svg) 
      // REMOVE ZOOM
      svg.on("dblclick.zoom", null) 
      this.$data.simulation.nodes().forEach(function(d) {
        d.selected = false 
        d.previouslySelected = false 
      }) 

      if (this.switchForce) {
        // docs
        let filterLinks = this.forceLinks.filter(
          d => d.type != "documentGuidForceGroup"
        ) 
        this.$data.simulation.force("link").links(filterLinks) 
        this.$data.simulation.alpha(1).restart() 
      } else {
        let filterLinks = this.forceLinks.filter(
          d => d.type != "ownerForceGroup"
        ) 
        this.$data.simulation.force("link").links(filterLinks) 
        this.$data.simulation.alpha(1).restart() 
      }

      this.$data.colour = d3
        .scaleLinear()
        .domain([0, _nodes.length - 1])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb("lightgray"), d3.rgb("blue")]) 

      let xScale = d3
        .scaleLinear()
        .domain([0, this.svgWidth])
        .range([0, this.svgWidth]) 
      let yScale = d3
        .scaleLinear()
        .domain([0, this.svgHeight])
        .range([0, this.svgHeight]) 

      // Define the div for the tooltip
      let divCircle = d3.select(".tooltip").style("opacity", 0) 
      let divOwner = d3.select(".tooltipOwner").style("opacity", 0) 
      let divDoc = d3.select(".tooltipDoc").style("opacity", 0) 
      
      svg
        .select("#hullOwner")
        .selectAll("path")
        .data(Object.keys(parentGroups))
        .enter()
        .append("path")

        .attr("class", "subhullOwner")

        .on("mouseover", function(d) {
          
          divOwner.style("opacity", 0.8) 
          divOwner
            .html(`Owner: ${d.values[0].owner}`)
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY - 28 + "px") 
        })
        .on("mouseout", function(d) {
          divOwner.style("opacity", 0) 
        }) 
      svg.select("#hullOwner").selectAll("path") 

      // let childGroups = this.groupBy(clientNodes, "documentGuid");

      svg
        .select("#hullDoc")
        .selectAll("path")
        .data(Object.keys(childGroups))
        .enter()
        .append("path")
        .attr("class", "subhullDoc")
        .on("mouseover", function(d) {
          
          divDoc.style("opacity", 0.8) 
          divDoc
            .html(
              `DocumentGuid: ${d.values[0].documentGuid}<br/>
            DocumentType: ${d.values[0].documentType}<br/>
            DocumentName: ${d.values[0].documentName}`
            )
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY - 28 + "px") 
        })
        .on("mouseout", function(d) {
          divDoc.style("opacity", 0) 
        }) 

      let groupOwners = d3
        .nest()
        .key(function(d) {
          return d.owner 
        })
        .entries(this.simulation.nodes().filter(data => data.type == "Client")) 
      
      let groupDocs = d3
        .nest()
        .key(function(d) {
          return d.documentGuid 
        })
        .entries(this.simulation.nodes().filter(data => data.type == "Client")) 

      let context = this
      let groupPath = function(d) {
        if(d.values.length >= 3){
          return (
            "M" +
            d3
              .polygonHull(
                d.values.map(function(i) {
                  return [i.x, i.y] 
                })
              )
              .join("L") +
            "Z"
          )
        }
        else{
         return (
            context.$data.roundedHull(
                d.values.map(function(i) {
                  return [i.x, i.y] 
                })
              )
          )
        }
      } 

      //
      svg
        .select("#marker")
        .selectAll("marker")
        .data(
          this.$data.simulation
            .force("link")
            .links()
            .filter(data => data.display)
        )
        .enter()
        .append("svg:marker")
        .attr("source_timestamp", data => data.source.createdAt)
        .attr("target_timestamp", data => data.target.createdAt)
        .attr("id", data => data.type)
        .attr("viewBox", "0 -5 10 10")
        // handles the size difference between streams and client
        .attr("refX", data => {
          if (data.type === "sending") {
            return 21 
          } else if (data.type === "receiving") {
            return 15 
          }
        })
        .attr("refY", 0)
        .attr("markerWidth", 20)
        .attr("markerHeight", 12)
        .attr("orient", "auto")
        .attr("fill-opacity", 1)

        //.attr("fill", data => this.colour(data.target.index))
        .attr("markerUnits", "userSpaceOnUse")
        .attr("stroke-linecap", "round") 
      // .append("svg:path")
      // .attr("d", "M0,-5L10,0L0,5") 
      let path = svg
        .select("#pathLink")
        .selectAll("path")
        .data(
          this.$data.simulation
            .force("link")
            .links()
            .filter(data => data.display)
        )
        .enter()
        .append("svg:path")
        .attr("stroke-width", 1.5)
        .attr("stroke-width", data => {
          if (data.source.type === "Stream") {
            if (data.source.objectsNumber > 15) {
              return 8 
            } else if (data.source.objectsNumber < 2) {
              return 3 
            } else {
              return data.source.objectsNumber 
            }
          }
          if (data.target.type === "Stream") {
            if (data.target.objectsNumber > 15) {
              return 8 
            } else if (data.target.objectsNumber < 2) {
              return 3 
            } else {
              return data.target.objectsNumber 
            }
          }
        })
        .attr("stroke-linecap", "round")
        .attr("source_timestamp", data => data.source.createdAt)
        .attr("target_timestamp", data => data.target.createdAt)
        .attr("class", function(d) {
          return "link " + d.type 
        })

        .attr("marker-end", function(d) {
          return "url(#" + d.type + ")" 
        }) 
      //
      //
      let circleSender = svg
        .select("#circleSender")
        .selectAll("circle")
        .data(
          this.$data.simulation.nodes().filter(data => data.role == "Sender")
        )
        .enter()
        .append("svg:circle")
        .attr("class", "sender")
        .attr("class", "node")
        .attr("r", 6)
        .attr("timestamp", function(d) {
          return d.createdAt 
        })
        .on("dblclick", dblclick)
        .call(this.drag(this.$data.simulation))
        // .on("mouseover", function(d) {
        //   divCircle.
        //       style("opacity", .8) 
        //       divCircle.html(`Owner: ${d.owner}<br/>
        //       ${d.documentType}: ${d.documentName}<br/>
        //       Created at: ${d.createdAt}<br/>
        //       Updated at: ${d.updatedAt}`)
        //       .style("left", (d3.event.pageX) + "px")
        //       .style("top", (d3.event.pageY - 28) + "px") 
        //   })
        // .on("mouseout", function(d) {
        //   divCircle.style("opacity", 0) 
        // })
        //
        .on("contextmenu", this.contextMenu("client", this.menuClient)) 
      let circleReceiver = svg
        .select("#circleReceiver")
        .selectAll("circle")
        .data(
          this.$data.simulation.nodes().filter(data => data.role == "Receiver")
        )
        .enter()
        .append("svg:circle")
        .attr("class", "receiver")
        .attr("class", "node")
        .attr("r", 6)
        .attr("timestamp", function(d) {
          return d.createdAt 
        })
        .on("dblclick", dblclick)
        .call(this.drag(this.$data.simulation))
        // .on("mouseover", function(d) {
        //   divCircle.
        //       style("opacity", .8) 
        //       divCircle.html(`Owner: ${d.owner}<br/>
        //       ${d.documentType}: ${d.documentName}<br/>
        //       Created at: ${d.createdAt}<br/>
        //       Updated at: ${d.updatedAt}`)
        //       .style("left", (d3.event.pageX) + "px")
        //       .style("top", (d3.event.pageY - 28) + "px") 
        //   })
        // .on("mouseout", function(d) {
        //   divCircle.style("opacity", 0) 
        // })
        //
        .on("contextmenu", this.contextMenu("client", this.menuClient)) 
      const rectWidth = 24 
      const rectHeight = 24 
      

      
      // let rectParcoords = svg
      //   .select("#rectParcoords")
      //   .selectAll("rect")
      //   .data(this.$data.simulation.nodes().filter(d => d.type == "Stream"))
      //   .enter()
      //   .append("svg:rect")
      //   .attr("class", "parcoordsSelection")
      //   //.attr("class", "parcoordsSelection")
      //   .attr("x", -rectWidth*3 / 2)
      //   .attr("y", -rectHeight*3 / 2)
      //   .attr("width", rectWidth*3)
      //   .attr("height", rectHeight*3)
      //   .attr("rx", 3)
      //   .attr("ry", 3)
      //   .attr("fill", "none")
      //   .attr("timestamp", function(d) {
      //     return d.createdAt 
      //   })

      let rect = svg
        .select("#rectStream")
        .selectAll("rect")
        .data(this.$data.simulation.nodes().filter(d => d.type == "Stream"))
        .enter()
        .append("svg:rect")
        .attr("class", "node")
        .attr("x", -rectWidth / 2)
        .attr("y", -rectHeight / 2)
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("timestamp", function(d) {
          return d.createdAt 
        })
        .on("dblclick", dblclick)
        .call(this.drag(this.$data.simulation))
        .on("contextmenu", this.contextMenu("stream", this.menuStream)) 

      let text = svg
        .select("#text")
        .selectAll("g")
        .data(this.$data.simulation.nodes())
        .enter()
        .append("svg:g")
        .attr("timestamp", function(d) {
          return d.createdAt 
        }) 
      text
        .append("svg:text")
        .attr("x", 8)
        .attr("y", ".31em")
        .attr("class", "shadow")
        //.style("transform", "rotate(-45deg)")
        .style("font-size", function(d) {
          if (d.type == "Client") {
            return "30px"
          } else {
            return "30px" 
          }
        })
        .text(function(d) {
          return d.name 
        }) 
      text
        .append("svg:text")
        .attr("x", 8)
        .attr("y", ".31em")
        //.style("transform", "rotate(-45deg)")
        .style("font-size", function(d) {
          if (d.type == "Client") {
            return "30px"
          } else {
            return "30px" 
          }
        })
        .text(function(d) {
          return d.name 
        }) 




    let circleOwner = svg
        .select("#cenOwner")
        .selectAll("circle")
        // .data(circleOwnerData)
        // .enter()
        // .append("circle")
        // .attr("cx", function (d) { return d.cx  })
        // .attr("cy", function (d) { return d.cy  })
        // .attr("r", function (d) { return d.radius  })
        // .style("fill", function (d) { return d.color  })

      let textOwner = svg
        .select("#textOwner")
        .selectAll("text")
        
        .data(circleOwnerData)
        .enter()
        .append("svg:g")
        
      textOwner
        .append("svg:text")
        .attr("x", 0)
        .attr("y", 0)
        .style("font-size", "50px")
        .attr('x', 0)
        .attr('y', 0)
        .style("font-weight", "800")
        .text(function(d) { return `${d.userInfo.surname.charAt(0)}${d.userInfo.name.charAt(0)}`  })
        .append('svg:tspan')
        .attr('x', 90)
        .attr('y', 0)
        .style("font-size", "30px")
        .text(function(d) { return `(${d.userInfo.company})`  })
        .append('svg:tspan')


    let circleDoc = svg
        .select("#cenDoc")
        .selectAll("circle")
        // .data(circleDocData)
        // .enter()
        // .append("circle")
        // .attr("r", function (d) { return d.radius  })
        // .style("fill", function (d) { return d.color  })
        
    let textDoc = svg
        .select("#textDoc")
        .selectAll("text")
        .data(groupDocs)
        .enter()      
        .append("svg:g")
      textDoc
        .append("svg:text")
        .attr("x", -20)
        .attr("y", 20)
        .style("font-size", "50px")
        .text(function(d) {
          let docType = d.values[0].documentType
          if(docType === "Rhino"){
            return `🦏`
          }
          else if(docType === "Dynamo"){
            return `🔧`
          }
          else if(docType === "GSA"){
            return `💎`
          }
          else if(docType === "Grasshopper"){
            return `🦗`
          }else{
            return docType
          }
        })






      let parentContext = this 
      function brushstarted() {
        if (d3.event.sourceEvent.type !== "end") {
          svg
            .select("#rectStream")
            .selectAll("rect")
            .classed("selected", function(d) {
              return (d.selected = d.previouslySelected =
                parentContext.$data.shiftKey && d.selected) 
            }) 
        }
      }

      function brushed() {
        if (d3.event.sourceEvent.type !== "end") {
          let selection = d3.event.selection 
          svg
            .select("#rectStream")
            .selectAll("rect")
            .classed("selected", function(d) {
              return (d.selected =
                d.previouslySelected ^
                (selection != null &&
                  selection[0][0] <= d.x &&
                  d.x < selection[1][0] &&
                  selection[0][1] <= d.y &&
                  d.y < selection[1][1])) 
            }) 
        }
      }

      function brushended() {
        if (d3.event.selection != null) {
          d3.select(this).call(d3.event.target.move, null) 
        }
      }

      function dblclick(d) {
        d3.select(this).classed("fixed", (d.fixed = !d.fixed)) 
      }
      function dragstart(d) {
        if (this.toggleFix) {
          d3.select(this).classed("fixed", (d.fixed = true)) 
        } else {
          d3.select(this).classed("fixed", (d.fixed = false)) 
        }
      }

      //let parentContext = this 
      function tick() {
        
        svg
          .selectAll(".node")
          .attr("fill", 
          data => parentContext.colour(data.index)
          )
          .attr("cx", function(d) {
            return d.x 
          })
          .attr("cy", function(d) {
            return d.y 
          }) 
        

        svg
          .select("#hullOwner")
          .selectAll(".subhullOwner")
          .each(function (d,i) {

              let sumX = 0
              let sumY = 0
              for (let i = 0; i < Object.values(d)[1].length; i++) {
                sumX += Object.values(d)[1][i].x
                sumY += Object.values(d)[1][i].y
              }
              let avX = sumX / Object.values(d)[1].length
              let avY = sumY / Object.values(d)[1].length

              svg
                .select("#cenOwner")
                .selectAll("circle")
                .each(function (d, j) {
                  if (j === i && avX && avY) {
                    d3.select(this)
                      .attr("cx", avX)
                      .attr("cy", avY)    
                  }
                })
            
              svg
                .select("#textOwner")
                .selectAll("text")
                .each(function (d, j) {
                  if (j === i && avX && avY) {
                    d3.select(this)
                    .attr("transform", function(d) {
                      return "translate(" + avX + "," + avY + ")" 
                    })
                  }
                })
        }) 


        svg
          .select("#hullOwner")
          .selectAll(".subhullOwner")
          .data(groupOwners)
          .attr("d", groupPath)
          .enter()
          .insert("path")
          .attr("d", groupPath)
        
        
        svg
          .select("#hullDoc")
          .selectAll(".subhullDoc")
          .each(function (d,i) {

              let sumX = 0
              let sumY = 0
              for (let i = 0; i < Object.values(d)[1].length; i++) {
                sumX += Object.values(d)[1][i].x
                sumY += Object.values(d)[1][i].y
              }
              let avX = sumX / Object.values(d)[1].length
              let avY = sumY / Object.values(d)[1].length

              svg
                .select("#cenDoc")
                .selectAll("circle")
                .each(function (d, j) {
                  if (j == i && avX && avY) {
                    d3.select(this)
                      .attr("cx", avX)
                      .attr("cy", avY)    
                  }
                })
            
              svg
                .select("#textDoc")
                .selectAll("text")
                .each(function (d, j) {
                  if (j == i && avX && avY) {
                    d3.select(this)
                    .attr("transform", function(d) {
                      return "translate(" + avX + "," + avY + ")" 
                    })
                  }
                })
        }) 
        
                
        svg
          .select("#hullDoc")
          .selectAll(".subhullDoc")
          .data(groupDocs)
          .attr("d", groupPath)
          .enter()
          .insert("path")
          .attr("d", groupPath) 
        
        path
          .attr("d", function(d) {
            let dx = d.target.x - d.source.x,
              dy = d.target.y - d.source.y,
              dr = Math.sqrt(dx * dx + dy * dy) 
            let x0 = d.source.x 
            let y0 = d.source.y 
            let x1 = d.target.x 
            let y1 = d.target.y 
            let xcontrol = x1 * 0.5 + x0 * 0.5 
            let ycontrol = y1 * 0.5 + y0 * 0.5 
            let smartDiagonal 
            if (Math.abs(x0 - x1) > Math.abs(y0 - y1)) {
              smartDiagonal = [
                "M",
                x0,
                y0,
                "C",
                xcontrol,
                y0,
                xcontrol,
                y1,
                x1,
                y1
              ].join(" ") 
            }
            if (Math.abs(y0 - y1) > Math.abs(x0 - x1)) {
              smartDiagonal = [
                "M",
                x1,
                y1,
                "C",
                x1,
                ycontrol,
                x0,
                ycontrol,
                x0,
                y0
              ].join(" ") 
            }

            if (parentContext.selectedEdgesDisplay == "Diagonal Horizontal") {
              return [
                "M",
                x0,
                y0,
                "C",
                xcontrol,
                y0,
                xcontrol,
                y1,
                x1,
                y1
              ].join(" ") 
            }
            if (parentContext.selectedEdgesDisplay == "Diagonal Vertical") {
              return [
                "M",
                x1,
                y1,
                "C",
                x1,
                ycontrol,
                x0,
                ycontrol,
                x0,
                y0
              ].join(" ") 
            }
            if (parentContext.selectedEdgesDisplay == "Diagonal Smart") {
              return smartDiagonal 
            }
            if (parentContext.selectedEdgesDisplay == "Line") {
              return ["M", x0, y0, "L", x1, y1].join(" ") 
            }
            if (parentContext.selectedEdgesDisplay == "Arc") {
              return ["M", x0, y0, "A", dr, dr, " 0 0,1 ", x1, y1].join(" ") 
            }
          })
          .attr("stroke", data => parentContext.colour(data.source.index)) 
        //
        // svg.selectAll('marker')
        // .attr('fill', data =>
        //   colour(data.target.index)
        // ) 
        // circleSender.attr("transform", function(d) {
        //   return "translate(" + d.x + "," + d.y + ")" 
        // })
        //  
        // circleReceiver.attr("transform", function(d) {
        //   return "translate(" + d.x + "," + d.y + ")" 
        // }) 
        rect.attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")" 
        }) 
        text.attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")" 
        }) 

      }

      this.drawGraph.tick = tick  // create a reference to the inner function

      this.updateDisplayNodes("#circleSender") 
      this.updateDisplayNodes("#circleReceiver") 
      this.updateDisplayNodes("#rectStream") 
      this.updateDisplayNodes("#text") 
      this.updateDisplayLinks("#pathLink") 
    }
  },
  mounted() {
    this.svgWidth = document.getElementById("clientGraph").offsetWidth 
    this.drawGraph() 
  },

  computed: {
    myserver: function () {
      // `this` points to the vm instance
      return this
    }
      
  }
} 
</script>

<style>
.bar-positive {
  fill: steelblue;
  transition: r 0.2s ease-in-out;
}

.svg-container {
  display: inline-block;
  position: relative;
  width: 100%;
  padding-bottom: 1%;
  vertical-align: top;
  overflow: hidden;
}


#graphLayout {
  cursor: all-scroll;
}

#rectStream {
  cursor: pointer;
  stroke: lightgray;
  stroke-width: 2px;
}

.parcoordsSelection {
  stroke: black;
  stroke-width: 4px;
  stroke-dasharray: 20,5;
  /* transition: "visibility 0s, opacity 0.4s linear" */
}

.tagSelected {
  stroke: rgba(0, 255, 200, 0.4);
  stroke-width: 5px;

  fill: rgba(0, 255, 200, 0.4);
}

circle {
  cursor: pointer;
  stroke: lightgray;
  stroke-width: 2px;
}

text {
  font: 15px arial;
  pointer-events: none;
  opacity: 0.7;
}

text.shadow {
  stroke: #fff;
  stroke-width: 3px;
  stroke-opacity: 0.8;
}




.d3-context-menu {
  position: absolute;
  display: none;
  background-color: rgb(240, 240, 240);
  border-radius: 8px;
  box-shadow: rgb(73, 73, 73) 3px 3px 7px;
  font-family: Arial, sans-serif;
  font-size: 10px;
  min-width: 150px;
  border: 0px solid #d4d4d4;
  border: 0px solid #ffffff00;
  z-index: 1200;
  padding-top: 3px;
  padding-bottom: 3px;
}

.d3-context-menu ul {
  list-style-type: none;
  margin: 4px 0px;
  padding: 0px;
  cursor: pointer;
}

.d3-context-menu ul li {
  padding: 4px 16px;
}

.d3-context-menu ul li.stream:hover {
  background-color: hotpink;
  color: #fefefe;
  transition: 700ms;
}

.d3-context-menu ul li.client:hover {
  background-color: #0099ff;
  color: #fefefe;
  transition: 700ms;
}

.tooltip {
  position: absolute;
  text-align: center;
  width: 250px;
  height: 60px;
  padding: 2px;
  font: 12px sans-serif;
  background: #94e1ff;
  border: 2px;
  border-color: black;
  border-width: 2px;
  border-radius: 8px;
  pointer-events: none;
}

.tooltipOwner {
  position: absolute;
  text-align: center;
  width: 250px;
  height: 15px;
  padding: 2px;
  font: 12px sans-serif;
  background: #50ccfd;
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
}

.tooltipDoc {
  position: absolute;
  text-align: center;
  width: 350px;
  height: 45px;
  padding: 2px;
  font: 12px sans-serif;
  background: hotpink;
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
}

.hull {
  fill: steelblue;
  fill-opacity: 1;
  stroke: steelblue;
  stroke-width: 22px;
  stroke-opacity: 1;
  stroke-linejoin: round;
}

.subhullOwner {
  fill: rgb(126, 191, 243);
  stroke: rgb(126, 191, 243);
  stroke-width: 40;
  opacity: 0.5;
  stroke-linejoin: round;
}

.subhullDoc {
  fill: hotpink;
  stroke: hotpink;
  stroke-width: 40;
  opacity: 0.5;
  stroke-linejoin: round;
}

path.link {
  fill: none;
}

marker {
  stroke-width: 1000 !important;
}
.brush {
  stroke: #222;
  fill-opacity: 0.125;
  shape-rendering: crispEdges;
}
</style>
