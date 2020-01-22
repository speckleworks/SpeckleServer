(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-2d21ed68"],{d6ee:function(t,a,e){"use strict";e.r(a);var n=function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("v-layout",{attrs:{row:"",wrap:""}},[e("v-flex",{attrs:{xs12:""}},[e("v-autocomplete",{attrs:{"return-object":"",items:t.libraries,"item-text":"name","item-value":"api",loading:0===t.libraries.length,label:"Select a library"},on:{input:t.selectLibrary},scopedSlots:t._u([{key:"item",fn:function(a){return[e("div",[t._v("\n          "+t._s(a.item.name)+"\n          "),e("br"),e("span",{staticClass:"caption"},[t._v("\n            "+t._s(a.item.api)+"\n          ")])])]}}]),model:{value:t.params.selectedLibrary,callback:function(a){t.$set(t.params,"selectedLibrary",a)},expression:"params.selectedLibrary"}})],1),t.params.selectedLibrary?e("v-flex",{attrs:{xs12:""}},[e("v-autocomplete",{attrs:{"return-object":"",items:t.functions,"item-text":"name","item-value":"api",loading:0===t.functions.length,label:"Select a function"},on:{input:t.selectFunction},scopedSlots:t._u([{key:"item",fn:function(a){return[e("div",[t._v("\n          "+t._s(a.item.name)+"\n          "),e("br"),e("span",{staticClass:"caption"},[t._v("\n            "+t._s(a.item.api)+"\n          ")])])]}}],null,!1,608326576),model:{value:t.params.selectedFunction,callback:function(a){t.$set(t.params,"selectedFunction",a)},expression:"params.selectedFunction"}})],1):t._e(),t.params.selectedLibrary&&t.params.selectedFunction&&t.functions.length>0?e("v-flex",{attrs:{"mt-0":"",xs12:""}},[e("v-card",[e("v-card-title",[e("span",{staticClass:"font-weight-light"},[t._v("\n          Inputs\n        ")])]),e("v-divider"),e("v-layout",{attrs:{row:"",wrap:"","pa-3":""}},t._l(t.params.selectedFunction.inputs,function(a){return e("v-flex",{key:a.name,attrs:{xs12:"",sm6:"",md3:""}},[e("v-tooltip",{attrs:{bottom:""},scopedSlots:t._u([{key:"activator",fn:function(n){var s=n.on;return[e("div",t._g({attrs:{"ma-0":"","pa-0":""}},s),[(a.values||"System.Boolean"===a.type)&&t.isInputByValue(a.name)?e("v-autocomplete",{attrs:{items:a.values?a.values:[!0,!1],label:a.name,"append-icon":t.isInputByValue(a.name)?"edit":"input",hint:t.isInputByValue(a.name)?"Input by value":"Input by object path","persistent-hint":!0,"error-messages":a.isOptional||t.inputs.hasOwnProperty(a.name)&&null!==t.inputs[a.name]?"":["Input required"]},on:{"click:append":function(e){return t.toggleInputSource({name:a.name,value:e})},change:function(e){return t.updateInput({name:a.name,value:e})}},model:{value:t.inputs[a.name],callback:function(e){t.$set(t.inputs,a.name,e)},expression:"inputs[input.name]"}}):e("v-text-field",{attrs:{label:a.name,"append-icon":t.isInputByValue(a.name)?"edit":"input",hint:t.isInputByValue(a.name)?"Input by value":"Input by object path","persistent-hint":!0,"error-messages":a.isOptional||t.inputs.hasOwnProperty(a.name)&&null!==t.inputs[a.name]?"":"Input required"},on:{"click:append":function(e){return t.toggleInputSource({name:a.name,value:e})},change:function(e){return t.updateInput({name:a.name,value:e})}},model:{value:t.inputs[a.name],callback:function(e){t.$set(t.inputs,a.name,e)},expression:"inputs[input.name]"}})],1)]}}],null,!0)},[e("div",[e("span",[e("b",[t._v("Description:")]),t._v(" "+t._s(a.description))]),e("br"),e("span",{staticClass:"caption"},[e("b",[t._v("Type:")]),t._v(" "+t._s(a.type))])])])],1)}),1),e("v-divider"),e("v-card-title",[e("span",{staticClass:"font-weight-light"},[t._v("\n          Output\n        ")])]),e("v-divider"),e("v-flex",{attrs:{xs12:""}},[e("v-text-field",{attrs:{label:"Output path",hint:"Object path to embed all results under","persistent-hint":!0},on:{change:function(a){return t.$emit("update-param",t.params)}},model:{value:t.params.outputPath,callback:function(a){t.$set(t.params,"outputPath",a)},expression:"params.outputPath"}})],1)],1)],1):t._e()],1)},s=[],i=(e("96cf"),e("3b8d")),r=(e("20d6"),e("7f7f"),e("55dd"),e("5176")),u=e.n(r),p=e("bc3a"),l=e.n(p),o=(e("6233"),{name:"ArupCompute",components:{},props:{block:Object,params:{}},data:function(){return{libraries:[],functions:[]}},computed:{inputs:function(){return u()({},this.params.valueData,this.params.pathData)},token:function(){return this.$store.state.tokens["msal|"+this.block.msal.clientId]}},methods:{selectLibrary:function(t){var a=this;this.functions.slice(0,this.functions.length),l.a.get("".concat(t.api,"?flat=true"),{baseURL:"https://compute.arup.digital/",headers:{Authorization:"Bearer "+this.token}}).then(function(e){a.functions=e.data,a.functions.sort(function(t,a){return t.name.toLowerCase()>a.name.toLowerCase()?1:-1}),a.params.selectedLibrary=t,a.params.selectedFunction&&-1===a.functions.findIndex(function(t){return t.api===a.params.selectedFunction.api})&&(a.params.selectedFunction=null),a.$emit("update-param",a.params)})},selectFunction:function(t){this.params.selectedFunction=t,this.params.valueData={},this.params.pathData={},this.params.outputPath="",this.$emit("update-param",this.params)},isInputByValue:function(t){return!(!this.params.valueData||!this.params.valueData.hasOwnProperty(t))},toggleInputSource:function(t){this.params.pathData||(this.params.pathData={}),this.params.valueData||(this.params.valueData={}),this.isInputByValue(t.name)?(this.params.pathData[t.name]=null,delete this.params.valueData[t.name]):(this.params.valueData[t.name]=null,delete this.params.pathData[t.name]),this.$emit("update-param",this.params)},updateInput:function(t){null!==t.value&&""!==t.value&&void 0!==t.value||(t.value=null),this.params.pathData||(this.params.pathData={}),this.params.valueData||(this.params.valueData={}),this.isInputByValue(t.name)?this.params.valueData[t.name]=t.value:this.params.pathData[t.name]=t.value,this.$emit("update-param",this.params)},getLibraries:function(){var t=Object(i["a"])(regeneratorRuntime.mark(function t(){var a,e=this,n=arguments;return regeneratorRuntime.wrap(function(t){while(1)switch(t.prev=t.next){case 0:a=n.length>0&&void 0!==n[0]&&n[0],l.a.get("api",{baseURL:"https://compute.arup.digital/",headers:{Authorization:"Bearer "+this.token}}).then(function(t){e.libraries=t.data,e.libraries.sort(function(t,a){return t.name.toLowerCase()>a.name.toLowerCase()?1:-1}),e.params.selectedLibrary&&e.selectLibrary(e.params.selectedLibrary)}).catch(function(t){console.log(t),401!==t.response.status||a?(console.log("Unable to access ArupCompute"),e.$store.commit("DELETE_TOKEN","msal|"+e.block.msal.clientId)):e.$store.dispatch("authenticateBlocks",[e.block]).then(function(t){e.getLibraries(!0)})});case 2:case"end":return t.stop()}},t,this)}));function a(){return t.apply(this,arguments)}return a}()},created:function(){this.getLibraries()}}),c=o,m=e("2877"),h=Object(m["a"])(c,n,s,!1,null,"6d154f9e",null);a["default"]=h.exports}}]);
//# sourceMappingURL=chunk-2d21ed68.a9718953.js.map