(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-bea16dec"],{"2f25":function(t,e,s){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var r=s("44d8"),i=(0,r.twitterEmbedComponent)({embedComponent:function(t){for(var e,s=arguments.length,r=new Array(s>1?s-1:0),i=1;i<s;i++)r[i-1]=arguments[i];return(e=t.widgets).createMoment.apply(e,r)},props:{errorMessage:{type:String,default:"Whoops! We couldn't access this Moment."},errorMessageClass:{type:String,required:!1},widgetClass:{type:String,required:!1}}}),n=i;e.default=n},"44d8":function(t,e,s){"use strict";var r=0;function i(t){if(!r){var e=document.createElement("script");e.setAttribute("src",t),document.body.appendChild(e),r=new Promise(function(t,s){e.onload=function(){t(window.twttr)}})}return r}var n={id:{type:String,requred:!0},sourceType:{type:String},options:Object},a=function(t){return{data:function(){return{isLoaded:!1,isAvailable:!1}},props:Object.assign({},n,t.props),mounted:function(){var e=this,s=this.sourceType?{sourceType:this.sourceType,screenName:this.id}:this.id;Promise.resolve(window.twttr?window.twttr:i("//platform.twitter.com/widgets.js")).then(function(r){return t.embedComponent(r,s,e.$el,e.options)}).then(function(t){e.isAvailable=void 0!==t,e.isLoaded=!0})},render:function(t){if(this.isLoaded&&this.isAvailable)return t("div",{class:this.$props.widgetClass});if(this.isLoaded&&!this.isAvailable&&this.$props.errorMessage){var e=t("div",{class:this.$props.errorMessageClass},this.$props.errorMessage);return t("div",[e])}return t("div",{class:this.$props.widgetClass},this.$slots.default)}}};t.exports={addPlatformScript:i,twitterEmbedComponent:a}},7277:function(t,e,s){"use strict";s.r(e);var r=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("v-container",{attrs:{"grid-list-xl":""}},[s("v-layout",{attrs:{row:"",wrap:""}},[0!==t.streams.length||0!==t.projects.length?s("v-flex",{staticClass:"headline font-weight-light",attrs:{xs12:"","py-5":""}},[t._v("\n      👋 Hi "+t._s(t.$store.state.user.name)+"! You have "),s("router-link",{attrs:{to:"/streams"}},[s("strong",[t._v(t._s(t.streams.length))]),t._v(" streams")]),t._v(" and "),s("router-link",{attrs:{to:"/projects"}},[s("strong",[t._v(t._s(t.projects.length))]),t._v(" projects")]),t._v(" in total.\n    ")],1):t._e(),0===t.streams.length&&0===t.projects.length?s("v-flex",{attrs:{xs12:"","py-5":""}},[s("div",{staticClass:"headline font-weight-light mb-4"},[t._v("\n        👋 Hello "+t._s(t.$store.state.user.name)+"! It looks like it's your first time here. Don't forget to check out the "),s("a",{attrs:{href:"https://speckle.systems/docs/essentials/start",target:"_blank"}},[t._v("guide")]),t._v("!\n      ")]),s("v-divider"),s("div",{staticClass:"mt-4 subheading"},[t._v("\n        You can also get in touch with the rest of the speckle community via:\n        "),s("ul",[s("li",[s("a",{attrs:{href:"https://discourse.speckle.works",target:"_blank"}},[t._v("Discourse")])]),s("li",[s("a",{attrs:{href:"https://slacker.speckle.works",target:"_blank"}},[t._v("Slack")])]),s("li",[s("a",{attrs:{href:"https://twitter.com/speckle_works",target:"_blank"}},[t._v("Twitter")])])])])],1):t._e(),0!==t.streams.length||0!==t.projects.length?s("v-flex",{attrs:{xs12:""}},[s("search-everything")],1):t._e(),0!==t.streams.length||0!==t.projects.length?s("v-flex",{attrs:{xs12:"",md6:"",lg4:""}},[s("v-card",{staticClass:"elevation-1"},[s("v-card-title",[s("v-icon",{attrs:{left:""}},[t._v("\n            import_export\n          ")]),s("span",{staticClass:"title font-weight-light"},[t._v("Latest Streams")])],1),s("v-divider"),s("v-card-text",[s("v-list",{attrs:{"two-line":""}},t._l(t.latestStreams,function(e){return s("v-list-tile",{key:e.streamId,attrs:{to:"/streams/"+e.streamId}},[s("v-list-tile-content",[s("v-list-tile-title",[s("span",{staticClass:"caption"},[s("v-icon",{attrs:{small:""}},[t._v("fingerprint")]),t._v(" "+t._s(e.streamId)+"\n                     "),s("v-icon",{attrs:{small:""}},[t._v(t._s(e.private?"lock":"lock_open"))])],1),t._v(" \n                  "),s("span",[t._v(t._s(e.name))])]),s("v-list-tile-sub-title",{staticClass:"xxx-font-weight-thin caption"},[t._v("\n                  last changed "),s("timeago",{attrs:{datetime:e.updatedAt}}),t._v(", created on "+t._s(new Date(e.createdAt).toLocaleString())+"\n                ")],1)],1)],1)}),1)],1),s("v-card-actions",[s("v-spacer"),s("v-btn",{attrs:{to:"/streams/"}},[t._v("See all your "+t._s(t.streams.length)+" streams")])],1)],1)],1):t._e(),0!==t.streams.length||0!==t.projects.length?s("v-flex",{attrs:{xs12:"",md6:"",lg4:""}},[s("v-card",{staticClass:"elevation-1"},[s("v-card-title",[s("v-icon",{attrs:{left:""}},[t._v("\n            business\n          ")]),s("span",{staticClass:"title font-weight-light"},[t._v("Latest Projects")])],1),s("v-divider"),s("v-card-text",[s("v-list",{attrs:{"two-line":""}},t._l(t.latestProjects,function(e){return s("v-list-tile",{key:e._id,attrs:{to:"/projects/"+e._id}},[s("v-list-tile-content",[s("v-list-tile-title",[s("v-icon",{attrs:{small:""}},[t._v("person")]),s("span",{staticClass:"caption"},[t._v(t._s(e.canRead.length))]),s("v-icon",{attrs:{small:""}},[t._v("import_export")]),s("span",{staticClass:"caption"},[t._v(t._s(e.streams.length))]),t._v("\n                  "+t._s(e.name)+"\n                ")],1),s("v-list-tile-sub-title",{staticClass:"xxx-font-weight-thin caption"},[t._v("\n                  last changed "),s("timeago",{attrs:{datetime:e.updatedAt}}),t._v(", created on "+t._s(new Date(e.createdAt).toLocaleString())+"\n                ")],1)],1)],1)}),1)],1),s("v-card-actions",[s("v-spacer"),s("v-btn",{attrs:{to:"/projects/"}},[t._v("See all your "+t._s(this.$store.state.projects.length)+" projects")])],1)],1)],1):t._e(),s("v-flex",{attrs:{xs12:"",md6:"",lg4:""}},[s("v-toolbar",{staticClass:" ",attrs:{dense:""}},[s("v-icon",{attrs:{left:""}},[t._v("\n          fiber_new\n        ")]),s("span",{staticClass:"title font-weight-light"},[t._v("\n          Speckle News\n        ")]),s("v-spacer")],1),s("v-card",{staticStyle:{"max-height":"560px","overflow-y":"auto"}},[s("Timeline",{attrs:{id:"speckle_works",sourceType:"profile",options:{theme:t.$store.state.dark?"dark":"",tweetLimit:10}}})],1),s("v-btn",{attrs:{block:"",large:"",xxxcolor:"black",href:"https://twitter.com/speckle_works",target:"_blank"}},[t._v("Follow Speckle For More!")])],1)],1)],1)},i=[],n=(s("55dd"),s("7397")),a=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("v-layout",{staticClass:"mb-5",attrs:{row:"",wrap:"","justify-left":""}},[s("v-flex",{attrs:{xs12:""}},[s("v-text-field",{attrs:{solo:"",clearable:"",label:"Search for a stream or project","prepend-inner-icon":"search","append-icon":"refresh",spellcheck:"false",loading:t.isLoading},on:{input:t.updateSearch,"click:append":function(e){return t.refreshResources()}},model:{value:t.filterText,callback:function(e){t.filterText=e},expression:"filterText"}})],1),t.filterText?s("v-flex",{staticStyle:{position:"relative",top:"-30px"},attrs:{xs12:""}},[s("v-card",{staticClass:"xxxtransparent elevation-10"},[s("v-layout",{attrs:{row:"",wrap:""}},[s("v-flex",{attrs:{xs12:"",md6:"","pa-3":""}},[s("div",{staticClass:"title font-weight-light mb-3 pl-3"},[t._v("Streams ("+t._s(t.filteredStreams.length)+")")]),t.filteredStreams.length>0?s("v-list",{staticStyle:{"max-height":"210px","overflow-y":"auto","overflow-x":"hidden"},attrs:{"two-line":""}},t._l(t.filteredStreams,function(e){return s("v-list-tile",{key:e.streamId,attrs:{to:"/streams/"+e.streamId}},[s("v-list-tile-content",[s("v-list-tile-title",[t._v("\n                  "+t._s(e.name)+"\n                ")]),s("v-list-tile-sub-title",{staticClass:"caption"},[s("v-icon",{attrs:{small:""}},[t._v("fingerprint")]),s("span",{staticClass:"caption",staticStyle:{"user-select":"all"}},[t._v(t._s(e.streamId))]),t._v(" "),s("v-icon",{attrs:{small:""}},[t._v("edit")]),s("timeago",{attrs:{datetime:e.updatedAt}})],1)],1)],1)}),1):s("span",{staticClass:"caption pl-3"},[t._v("No streams with that name found.")])],1),s("v-flex",{attrs:{xs12:"",md6:"","pa-3":""}},[s("div",{staticClass:"title font-weight-light mb-3 pl-3"},[t._v("Projects ("+t._s(t.filteredProjects.length)+")")]),t.filteredProjects.length>0?s("v-list",{staticStyle:{"max-height":"210px","overflow-y":"auto","overflow-x":"hidden"},attrs:{"two-line":""}},t._l(t.filteredProjects,function(e){return s("v-list-tile",{key:e._id,attrs:{to:"/projects/"+e._id}},[s("v-list-tile-content",[s("v-list-tile-title",[t._v("\n                  "+t._s(e.name)+"\n                ")]),s("v-list-tile-sub-title",{staticClass:"caption"},[s("v-icon",{attrs:{small:""}},[t._v("fingerprint")]),s("span",{staticClass:"caption",staticStyle:{"user-select":"all"}},[t._v(t._s(e._id))]),t._v(" "),s("v-icon",{attrs:{small:""}},[t._v("edit")]),s("timeago",{attrs:{datetime:e.updatedAt}})],1)],1)],1)}),1):s("span",{staticClass:"caption pl-3"},[t._v("No projects with that name found.")])],1)],1)],1)],1):t._e()],1)},o=[],l=(s("6762"),s("2fdb"),s("28a5"),s("f7fe")),c=s.n(l),u={name:"SearchEverything",props:{},watch:{filterText:function(t){this.isLoading=!0}},computed:{projects:function(){return this.$store.state.projects.filter(function(t){return!1===t.deleted})},streams:function(){return this.$store.state.streams.filter(function(t){return null===t.parent&&!1===t.deleted}).sort(function(t,e){return new Date(e.updatedAt)-new Date(t.updatedAt)})},filteredStreams:function(){return this.$store.getters.filteredResources(this.filters,"streams")},filteredProjects:function(){return this.$store.getters.filteredResources(this.filters,"projects")}},data:function(){return{filterText:"",isLoading:!1,filters:[]}},methods:{updateSearch:c()(function(t){this.isLoading=!1,this.searchfilter=t;try{var e=this.searchfilter.split(" ").map(function(t){return t.includes(":")?{key:t.split(":")[0],value:t.split(":")[1]}:t.includes("public")||t.includes("private")||t.includes("mine")||t.includes("shared")?{key:t,value:null}:{key:"name",value:t}});this.filters=e,console.log(this.filters)}catch(s){this.filters=[{key:"name",value:t}]}},1e3),refreshResources:function(){this.$store.dispatch("getStreams","omit=objects,layers&isComputedResult=false&sort=updatedAt"),this.$store.dispatch("getProjects")}}},d=u,f=s("2877"),p=Object(f["a"])(d,a,o,!1,null,"6b7c8edc",null),v=p.exports,h={name:"HomeView",components:{SearchEverything:v,Timeline:n["Timeline"]},computed:{latestStreams:function(){return this.streams.slice(0,7)},latestProjects:function(){return this.projects.slice(0,7)},projects:function(){return this.$store.state.projects.filter(function(t){return!1===t.deleted})},streams:function(){return this.$store.state.streams.filter(function(t){return null==t.parent&&!1===t.deleted}).sort(function(t,e){return new Date(e.updatedAt)-new Date(t.updatedAt)})},currentCatFact:function(){return this.facts[this.currentFact].fact}},methods:{getAFact:function(){var t=0,e=this.facts.length-1;this.currentFact=Math.floor(Math.random()*(e-t+1))+t}},data:function(){return{}}},m=h,g=Object(f["a"])(m,r,i,!1,null,"64795438",null);e["default"]=g.exports},7397:function(t,e,s){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),Object.defineProperty(e,"Tweet",{enumerable:!0,get:function(){return r.default}}),Object.defineProperty(e,"Moment",{enumerable:!0,get:function(){return i.default}}),Object.defineProperty(e,"Timeline",{enumerable:!0,get:function(){return n.default}});var r=a(s("8fea")),i=a(s("2f25")),n=a(s("f088"));function a(t){return t&&t.__esModule?t:{default:t}}},"8fea":function(t,e,s){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var r=s("44d8"),i=(0,r.twitterEmbedComponent)({embedComponent:function(t){for(var e,s=arguments.length,r=new Array(s>1?s-1:0),i=1;i<s;i++)r[i-1]=arguments[i];return(e=t.widgets).createTweetEmbed.apply(e,r)},props:{errorMessage:{type:String,default:"Whoops! We couldn't access this Tweet."},errorMessageClass:{type:String,required:!1},widgetClass:{type:String,required:!1}}}),n=i;e.default=n},f088:function(t,e,s){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var r=s("44d8"),i=(0,r.twitterEmbedComponent)({embedComponent:function(t){for(var e,s=arguments.length,r=new Array(s>1?s-1:0),i=1;i<s;i++)r[i-1]=arguments[i];return(e=t.widgets).createTimeline.apply(e,r)},props:{errorMessage:{type:String,default:"Whoops! We couldn't access this Timeline."},errorMessageClass:{type:String,required:!1},widgetClass:{type:String,required:!1}}}),n=i;e.default=n},f7fe:function(t,e,s){(function(e){var s="Expected a function",r=NaN,i="[object Symbol]",n=/^\s+|\s+$/g,a=/^[-+]0x[0-9a-f]+$/i,o=/^0b[01]+$/i,l=/^0o[0-7]+$/i,c=parseInt,u="object"==typeof e&&e&&e.Object===Object&&e,d="object"==typeof self&&self&&self.Object===Object&&self,f=u||d||Function("return this")(),p=Object.prototype,v=p.toString,h=Math.max,m=Math.min,g=function(){return f.Date.now()};function _(t,e,r){var i,n,a,o,l,c,u=0,d=!1,f=!1,p=!0;if("function"!=typeof t)throw new TypeError(s);function v(e){var s=i,r=n;return i=n=void 0,u=e,o=t.apply(r,s),o}function _(t){return u=t,l=setTimeout(j,e),d?v(t):o}function y(t){var s=t-c,r=t-u,i=e-s;return f?m(i,a-r):i}function b(t){var s=t-c,r=t-u;return void 0===c||s>=e||s<0||f&&r>=a}function j(){var t=g();if(b(t))return k(t);l=setTimeout(j,y(t))}function k(t){return l=void 0,p&&i?v(t):(i=n=void 0,o)}function C(){void 0!==l&&clearTimeout(l),u=0,i=c=n=l=void 0}function S(){return void 0===l?o:k(g())}function T(){var t=g(),s=b(t);if(i=arguments,n=this,c=t,s){if(void 0===l)return _(c);if(f)return l=setTimeout(j,e),v(c)}return void 0===l&&(l=setTimeout(j,e)),o}return e=x(e)||0,w(r)&&(d=!!r.leading,f="maxWait"in r,a=f?h(x(r.maxWait)||0,e):a,p="trailing"in r?!!r.trailing:p),T.cancel=C,T.flush=S,T}function w(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}function y(t){return!!t&&"object"==typeof t}function b(t){return"symbol"==typeof t||y(t)&&v.call(t)==i}function x(t){if("number"==typeof t)return t;if(b(t))return r;if(w(t)){var e="function"==typeof t.valueOf?t.valueOf():t;t=w(e)?e+"":e}if("string"!=typeof t)return 0===t?t:+t;t=t.replace(n,"");var s=o.test(t);return s||l.test(t)?c(t.slice(2),s?2:8):a.test(t)?r:+t}t.exports=_}).call(this,s("c8ba"))}}]);
//# sourceMappingURL=chunk-bea16dec.4199e3a8.js.map