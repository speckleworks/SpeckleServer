(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-6e5b3d4a"],{"369b":function(e,t,r){var i,n,s;
/* @license
Papa Parse
v4.6.2
https://github.com/mholt/PapaParse
License: MIT
*/Array.isArray||(Array.isArray=function(e){return"[object Array]"===Object.prototype.toString.call(e)}),function(r,a){n=[],i=a,s="function"===typeof i?i.apply(t,n):i,void 0===s||(e.exports=s)}(0,function(){"use strict";var e,t,r="undefined"!=typeof self?self:"undefined"!=typeof window?window:void 0!==r?r:{},i=!r.document&&!!r.postMessage,n=i&&/(\?|&)papaworker(=|&|$)/.test(r.location.search),s=!1,a={},o=0,h={parse:function(t,i){var n=(i=i||{}).dynamicTyping||!1;if(C(n)&&(i.dynamicTypingFunction=n,n={}),i.dynamicTyping=n,i.transform=!!C(i.transform)&&i.transform,i.worker&&h.WORKERS_SUPPORTED){var u=function(){if(!h.WORKERS_SUPPORTED)return!1;if(!s&&null===h.SCRIPT_PATH)throw new Error("Script path cannot be determined automatically when Papa Parse is loaded asynchronously. You need to set Papa.SCRIPT_PATH manually.");var t=h.SCRIPT_PATH||e;t+=(-1!==t.indexOf("?")?"&":"?")+"papaworker";var i=new r.Worker(t);return i.onmessage=v,i.id=o++,a[i.id]=i}();return u.userStep=i.step,u.userChunk=i.chunk,u.userComplete=i.complete,u.userError=i.error,i.step=C(i.step),i.chunk=C(i.chunk),i.complete=C(i.complete),i.error=C(i.error),delete i.worker,void u.postMessage({input:t,config:i,workerId:u.id})}var l=null;return h.NODE_STREAM_INPUT,"string"==typeof t?l=i.download?new c(i):new f(i):!0===t.readable&&C(t.read)&&C(t.on)?l=new p(i):(r.File&&t instanceof File||t instanceof Object)&&(l=new d(i)),l.stream(t)},unparse:function(e,t){var r=!1,i=!0,n=",",s="\r\n",a='"',o=!1;!function(){"object"==typeof t&&("string"!=typeof t.delimiter||h.BAD_DELIMITERS.filter(function(e){return-1!==t.delimiter.indexOf(e)}).length||(n=t.delimiter),("boolean"==typeof t.quotes||Array.isArray(t.quotes))&&(r=t.quotes),"boolean"!=typeof t.skipEmptyLines&&"string"!=typeof t.skipEmptyLines||(o=t.skipEmptyLines),"string"==typeof t.newline&&(s=t.newline),"string"==typeof t.quoteChar&&(a=t.quoteChar),"boolean"==typeof t.header&&(i=t.header))}();var u=new RegExp(a,"g");if("string"==typeof e&&(e=JSON.parse(e)),Array.isArray(e)){if(!e.length||Array.isArray(e[0]))return c(null,e,o);if("object"==typeof e[0])return c(l(e[0]),e,o)}else if("object"==typeof e)return"string"==typeof e.data&&(e.data=JSON.parse(e.data)),Array.isArray(e.data)&&(e.fields||(e.fields=e.meta&&e.meta.fields),e.fields||(e.fields=Array.isArray(e.data[0])?e.fields:l(e.data[0])),Array.isArray(e.data[0])||"object"==typeof e.data[0]||(e.data=[e.data])),c(e.fields||[],e.data||[],o);throw"exception: Unable to serialize unrecognized input";function l(e){if("object"!=typeof e)return[];var t=[];for(var r in e)t.push(r);return t}function c(e,t,r){var a="";"string"==typeof e&&(e=JSON.parse(e)),"string"==typeof t&&(t=JSON.parse(t));var o=Array.isArray(e)&&0<e.length,h=!Array.isArray(t[0]);if(o&&i){for(var u=0;u<e.length;u++)0<u&&(a+=n),a+=d(e[u],u);0<t.length&&(a+=s)}for(var l=0;l<t.length;l++){var c=o?e.length:t[l].length,f=!1,p=o?0===Object.keys(t[l]).length:0===t[l].length;if(r&&!o&&(f="greedy"===r?""===t[l].join("").trim():1===t[l].length&&0===t[l][0].length),"greedy"===r&&o){for(var m=[],_=0;_<c;_++){var g=h?e[_]:_;m.push(t[l][g])}f=""===m.join("").trim()}if(!f){for(var v=0;v<c;v++){0<v&&!p&&(a+=n);var y=o&&h?e[v]:v;a+=d(t[l][y],v)}l<t.length-1&&(!r||0<c&&!p)&&(a+=s)}}return a}function d(e,t){if(null==e)return"";if(e.constructor===Date)return JSON.stringify(e).slice(1,25);e=e.toString().replace(u,a+a);var i="boolean"==typeof r&&r||Array.isArray(r)&&r[t]||function(e,t){for(var r=0;r<t.length;r++)if(-1<e.indexOf(t[r]))return!0;return!1}(e,h.BAD_DELIMITERS)||-1<e.indexOf(n)||" "===e.charAt(0)||" "===e.charAt(e.length-1);return i?a+e+a:e}}};if(h.RECORD_SEP=String.fromCharCode(30),h.UNIT_SEP=String.fromCharCode(31),h.BYTE_ORDER_MARK="\ufeff",h.BAD_DELIMITERS=["\r","\n",'"',h.BYTE_ORDER_MARK],h.WORKERS_SUPPORTED=!i&&!!r.Worker,h.SCRIPT_PATH=null,h.NODE_STREAM_INPUT=1,h.LocalChunkSize=10485760,h.RemoteChunkSize=5242880,h.DefaultDelimiter=",",h.Parser=g,h.ParserHandle=m,h.NetworkStreamer=c,h.FileStreamer=d,h.StringStreamer=f,h.ReadableStreamStreamer=p,r.jQuery){var u=r.jQuery;u.fn.parse=function(e){var t=e.config||{},i=[];return this.each(function(e){if("INPUT"!==u(this).prop("tagName").toUpperCase()||"file"!==u(this).attr("type").toLowerCase()||!r.FileReader||!this.files||0===this.files.length)return!0;for(var n=0;n<this.files.length;n++)i.push({file:this.files[n],inputElem:this,instanceConfig:u.extend({},t)})}),n(),this;function n(){if(0!==i.length){var t,r,n,a,o=i[0];if(C(e.before)){var l=e.before(o.file,o.inputElem);if("object"==typeof l){if("abort"===l.action)return t="AbortError",r=o.file,n=o.inputElem,a=l.reason,void(C(e.error)&&e.error({name:t},r,n,a));if("skip"===l.action)return void s();"object"==typeof l.config&&(o.instanceConfig=u.extend(o.instanceConfig,l.config))}else if("skip"===l)return void s()}var c=o.instanceConfig.complete;o.instanceConfig.complete=function(e){C(c)&&c(e,o.file,o.inputElem),s()},h.parse(o.file,o.instanceConfig)}else C(e.complete)&&e.complete()}function s(){i.splice(0,1),n()}}}function l(e){this._handle=null,this._finished=!1,this._completed=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},function(e){var t=b(e);t.chunkSize=parseInt(t.chunkSize),e.step||e.chunk||(t.chunkSize=null),this._handle=new m(t),(this._handle.streamer=this)._config=t}.call(this,e),this.parseChunk=function(e,t){if(this.isFirstChunk&&C(this._config.beforeFirstChunk)){var i=this._config.beforeFirstChunk(e);void 0!==i&&(e=i)}this.isFirstChunk=!1;var s=this._partialLine+e;this._partialLine="";var a=this._handle.parse(s,this._baseIndex,!this._finished);if(!this._handle.paused()&&!this._handle.aborted()){var o=a.meta.cursor;this._finished||(this._partialLine=s.substring(o-this._baseIndex),this._baseIndex=o),a&&a.data&&(this._rowCount+=a.data.length);var u=this._finished||this._config.preview&&this._rowCount>=this._config.preview;if(n)r.postMessage({results:a,workerId:h.WORKER_ID,finished:u});else if(C(this._config.chunk)&&!t){if(this._config.chunk(a,this._handle),this._handle.paused()||this._handle.aborted())return;a=void 0,this._completeResults=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(a.data),this._completeResults.errors=this._completeResults.errors.concat(a.errors),this._completeResults.meta=a.meta),this._completed||!u||!C(this._config.complete)||a&&a.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),u||a&&a.meta.paused||this._nextChunk(),a}},this._sendError=function(e){C(this._config.error)?this._config.error(e):n&&this._config.error&&r.postMessage({workerId:h.WORKER_ID,error:e,finished:!1})}}function c(e){var t;(e=e||{}).chunkSize||(e.chunkSize=h.RemoteChunkSize),l.call(this,e),this._nextChunk=i?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(e){this._input=e,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(t=new XMLHttpRequest,this._config.withCredentials&&(t.withCredentials=this._config.withCredentials),i||(t.onload=w(this._chunkLoaded,this),t.onerror=w(this._chunkError,this)),t.open("GET",this._input,!i),this._config.downloadRequestHeaders){var e=this._config.downloadRequestHeaders;for(var r in e)t.setRequestHeader(r,e[r])}if(this._config.chunkSize){var n=this._start+this._config.chunkSize-1;t.setRequestHeader("Range","bytes="+this._start+"-"+n),t.setRequestHeader("If-None-Match","webkit-no-cache")}try{t.send()}catch(e){this._chunkError(e.message)}i&&0===t.status?this._chunkError():this._start+=this._config.chunkSize}},this._chunkLoaded=function(){4===t.readyState&&(t.status<200||400<=t.status?this._chunkError():(this._finished=!this._config.chunkSize||this._start>function(e){var t=e.getResponseHeader("Content-Range");return null===t?-1:parseInt(t.substr(t.lastIndexOf("/")+1))}(t),this.parseChunk(t.responseText)))},this._chunkError=function(e){var r=t.statusText||e;this._sendError(new Error(r))}}function d(e){var t,r;(e=e||{}).chunkSize||(e.chunkSize=h.LocalChunkSize),l.call(this,e);var i="undefined"!=typeof FileReader;this.stream=function(e){this._input=e,r=e.slice||e.webkitSlice||e.mozSlice,i?((t=new FileReader).onload=w(this._chunkLoaded,this),t.onerror=w(this._chunkError,this)):t=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var e=this._input;if(this._config.chunkSize){var n=Math.min(this._start+this._config.chunkSize,this._input.size);e=r.call(e,this._start,n)}var s=t.readAsText(e,this._config.encoding);i||this._chunkLoaded({target:{result:s}})},this._chunkLoaded=function(e){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(e.target.result)},this._chunkError=function(){this._sendError(t.error)}}function f(e){var t;l.call(this,e=e||{}),this.stream=function(e){return t=e,this._nextChunk()},this._nextChunk=function(){if(!this._finished){var e=this._config.chunkSize,r=e?t.substr(0,e):t;return t=e?t.substr(e):"",this._finished=!t,this.parseChunk(r)}}}function p(e){l.call(this,e=e||{});var t=[],r=!0,i=!1;this.pause=function(){l.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){l.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(e){this._input=e,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){i&&1===t.length&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),t.length?this.parseChunk(t.shift()):r=!0},this._streamData=w(function(e){try{t.push("string"==typeof e?e:e.toString(this._config.encoding)),r&&(r=!1,this._checkIsFinished(),this.parseChunk(t.shift()))}catch(e){this._streamError(e)}},this),this._streamError=w(function(e){this._streamCleanUp(),this._sendError(e)},this),this._streamEnd=w(function(){this._streamCleanUp(),i=!0,this._streamData("")},this),this._streamCleanUp=w(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function m(e){var t,r,i,n=/^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i,s=/(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/,a=this,o=0,u=0,l=!1,c=!1,d=[],f={data:[],errors:[],meta:{}};if(C(e.step)){var p=e.step;e.step=function(t){if(f=t,y())v();else{if(v(),0===f.data.length)return;o+=t.data.length,e.preview&&o>e.preview?r.abort():p(f,a)}}}function m(t){return"greedy"===e.skipEmptyLines?""===t.join("").trim():1===t.length&&0===t[0].length}function v(){if(f&&i&&(w("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+h.DefaultDelimiter+"'"),i=!1),e.skipEmptyLines)for(var t=0;t<f.data.length;t++)m(f.data[t])&&f.data.splice(t--,1);return y()&&function(){if(f){for(var t=0;y()&&t<f.data.length;t++)for(var r=0;r<f.data[t].length;r++){var i=f.data[t][r];e.trimHeaders&&(i=i.trim()),d.push(i)}f.data.splice(0,1)}}(),function(){if(!f||!e.header&&!e.dynamicTyping&&!e.transform)return f;for(var t=0;t<f.data.length;t++){var r,i=e.header?{}:[];for(r=0;r<f.data[t].length;r++){var n=r,s=f.data[t][r];e.header&&(n=r>=d.length?"__parsed_extra":d[r]),e.transform&&(s=e.transform(s,n)),s=k(n,s),"__parsed_extra"===n?(i[n]=i[n]||[],i[n].push(s)):i[n]=s}f.data[t]=i,e.header&&(r>d.length?w("FieldMismatch","TooManyFields","Too many fields: expected "+d.length+" fields but parsed "+r,u+t):r<d.length&&w("FieldMismatch","TooFewFields","Too few fields: expected "+d.length+" fields but parsed "+r,u+t))}return e.header&&f.meta&&(f.meta.fields=d),u+=f.data.length,f}()}function y(){return e.header&&0===d.length}function k(t,r){return i=t,e.dynamicTypingFunction&&void 0===e.dynamicTyping[i]&&(e.dynamicTyping[i]=e.dynamicTypingFunction(i)),!0===(e.dynamicTyping[i]||e.dynamicTyping)?"true"===r||"TRUE"===r||"false"!==r&&"FALSE"!==r&&(n.test(r)?parseFloat(r):s.test(r)?new Date(r):""===r?null:r):r;var i}function w(e,t,r,i){f.errors.push({type:e,code:t,message:r,row:i})}this.parse=function(n,s,a){var o=e.quoteChar||'"';if(e.newline||(e.newline=function(e,t){e=e.substr(0,1048576);var r=new RegExp(_(t)+"([^]*?)"+_(t),"gm"),i=(e=e.replace(r,"")).split("\r"),n=e.split("\n"),s=1<n.length&&n[0].length<i[0].length;if(1===i.length||s)return"\n";for(var a=0,o=0;o<i.length;o++)"\n"===i[o][0]&&a++;return a>=i.length/2?"\r\n":"\r"}(n,o)),i=!1,e.delimiter)C(e.delimiter)&&(e.delimiter=e.delimiter(n),f.meta.delimiter=e.delimiter);else{var u=function(t,r,i,n){for(var s,a,o,u=[",","\t","|",";",h.RECORD_SEP,h.UNIT_SEP],l=0;l<u.length;l++){var c=u[l],d=0,f=0,p=0;o=void 0;for(var _=new g({comments:n,delimiter:c,newline:r,preview:10}).parse(t),v=0;v<_.data.length;v++)if(i&&m(_.data[v]))p++;else{var y=_.data[v].length;f+=y,void 0!==o?1<y&&(d+=Math.abs(y-o),o=y):o=y}0<_.data.length&&(f/=_.data.length-p),(void 0===a||d<a)&&1.99<f&&(a=d,s=c)}return{successful:!!(e.delimiter=s),bestDelimiter:s}}(n,e.newline,e.skipEmptyLines,e.comments);u.successful?e.delimiter=u.bestDelimiter:(i=!0,e.delimiter=h.DefaultDelimiter),f.meta.delimiter=e.delimiter}var c=b(e);return e.preview&&e.header&&c.preview++,t=n,r=new g(c),f=r.parse(t,s,a),v(),l?{meta:{paused:!0}}:f||{meta:{paused:!1}}},this.paused=function(){return l},this.pause=function(){l=!0,r.abort(),t=t.substr(r.getCharIndex())},this.resume=function(){l=!1,a.streamer.parseChunk(t,!0)},this.aborted=function(){return c},this.abort=function(){c=!0,r.abort(),f.meta.aborted=!0,C(e.complete)&&e.complete(f),t=""}}function _(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function g(e){var t,r=(e=e||{}).delimiter,i=e.newline,n=e.comments,s=e.step,a=e.preview,o=e.fastMode,u=t=void 0===e.quoteChar?'"':e.quoteChar;if(void 0!==e.escapeChar&&(u=e.escapeChar),("string"!=typeof r||-1<h.BAD_DELIMITERS.indexOf(r))&&(r=","),n===r)throw"Comment character same as delimiter";!0===n?n="#":("string"!=typeof n||-1<h.BAD_DELIMITERS.indexOf(n))&&(n=!1),"\n"!==i&&"\r"!==i&&"\r\n"!==i&&(i="\n");var l=0,c=!1;this.parse=function(e,h,d){if("string"!=typeof e)throw"Input must be a string";var f=e.length,p=r.length,m=i.length,_=n.length,g=C(s),v=[],y=[],k=[],b=l=0;if(!e)return F();if(o||!1!==o&&-1===e.indexOf(t)){for(var w=e.split(i),E=0;E<w.length;E++){if(k=w[E],l+=k.length,E!==w.length-1)l+=i.length;else if(d)return F();if(!n||k.substr(0,_)!==n){if(g){if(v=[],D(k.split(r)),M(),c)return F()}else D(k.split(r));if(a&&a<=E)return v=v.slice(0,a),F(!0)}}return F()}for(var S,R=e.indexOf(r,l),x=e.indexOf(i,l),I=new RegExp(u.replace(/[-[\]\/{}()*+?.\\^$|]/g,"\\$&")+t,"g");;)if(e[l]!==t)if(n&&0===k.length&&e.substr(l,_)===n){if(-1===x)return F();l=x+m,x=e.indexOf(i,l),R=e.indexOf(r,l)}else if(-1!==R&&(R<x||-1===x))k.push(e.substring(l,R)),l=R+p,R=e.indexOf(r,l);else{if(-1===x)break;if(k.push(e.substring(l,x)),P(x+m),g&&(M(),c))return F();if(a&&v.length>=a)return F(!0)}else for(S=l,l++;;){if(-1===(S=e.indexOf(t,S+1)))return d||y.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:v.length,index:l}),L();if(S===f-1)return L(e.substring(l,S).replace(I,t));if(t!==u||e[S+1]!==u){if(t===u||0===S||e[S-1]!==u){var O=A(-1===x?R:Math.min(R,x));if(e[S+1+O]===r){k.push(e.substring(l,S).replace(I,t)),l=S+1+O+p,R=e.indexOf(r,l),x=e.indexOf(i,l);break}var T=A(x);if(e.substr(S+1+T,m)===i){if(k.push(e.substring(l,S).replace(I,t)),P(S+1+T+m),R=e.indexOf(r,l),g&&(M(),c))return F();if(a&&v.length>=a)return F(!0);break}y.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:v.length,index:l}),S++}}else S++}return L();function D(e){v.push(e),b=l}function A(t){var r=0;if(-1!==t){var i=e.substring(S+1,t);i&&""===i.trim()&&(r=i.length)}return r}function L(t){return d||(void 0===t&&(t=e.substr(l)),k.push(t),l=f,D(k),g&&M()),F()}function P(t){l=t,D(k),k=[],x=e.indexOf(i,l)}function F(e){return{data:v,errors:y,meta:{delimiter:r,linebreak:i,aborted:c,truncated:!!e,cursor:b+(h||0)}}}function M(){s(F()),v=[],y=[]}},this.abort=function(){c=!0},this.getCharIndex=function(){return l}}function v(e){var t=e.data,r=a[t.workerId],i=!1;if(t.error)r.userError(t.error,t.file);else if(t.results&&t.results.data){var n={abort:function(){i=!0,y(t.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:k,resume:k};if(C(r.userStep)){for(var s=0;s<t.results.data.length&&(r.userStep({data:[t.results.data[s]],errors:t.results.errors,meta:t.results.meta},n),!i);s++);delete t.results}else C(r.userChunk)&&(r.userChunk(t.results,n,t.file),delete t.results)}t.finished&&!i&&y(t.workerId,t.results)}function y(e,t){var r=a[e];C(r.userComplete)&&r.userComplete(t),r.terminate(),delete a[e]}function k(){throw"Not implemented."}function b(e){if("object"!=typeof e||null===e)return e;var t=Array.isArray(e)?[]:{};for(var r in e)t[r]=b(e[r]);return t}function w(e,t){return function(){e.apply(t,arguments)}}function C(e){return"function"==typeof e}return n?r.onmessage=function(e){var t=e.data;if(void 0===h.WORKER_ID&&t&&(h.WORKER_ID=t.workerId),"string"==typeof t.input)r.postMessage({workerId:h.WORKER_ID,results:h.parse(t.input,t.config),finished:!0});else if(r.File&&t.input instanceof File||t.input instanceof Object){var i=h.parse(t.input,t.config);i&&r.postMessage({workerId:h.WORKER_ID,results:i,finished:!0})}}:h.WORKERS_SUPPORTED&&(t=document.getElementsByTagName("script"),e=t.length?t[t.length-1].src:"",document.body?document.addEventListener("DOMContentLoaded",function(){s=!0},!0):s=!0),(c.prototype=Object.create(l.prototype)).constructor=c,(d.prototype=Object.create(l.prototype)).constructor=d,(f.prototype=Object.create(f.prototype)).constructor=f,(p.prototype=Object.create(l.prototype)).constructor=p,h})},"5c65":function(e,t,r){"use strict";r.r(t);var i=function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("v-layout",{attrs:{row:"",wrap:""}},[r("v-flex",{attrs:{xs12:"",md8:""}},[r("v-text-field",{attrs:{solo:"","append-icon":"search",label:"Search","single-line":"","hide-details":""},model:{value:e.search,callback:function(t){e.search=t},expression:"search"}})],1),r("v-flex",{attrs:{xs12:"",md1:""}},[r("v-btn",{staticClass:"transparent",attrs:{disabled:e.buttonsDisabled,flat:""},on:{click:function(t){return e.archiveSelected(!0)}}},[e._v("Archive")])],1),r("v-flex",{attrs:{xs12:"",md1:""}},[r("v-btn",{staticClass:"transparent",attrs:{disabled:e.buttonsDisabled,flat:""},on:{click:function(t){return e.archiveSelected(!1)}}},[e._v("Restore")])],1),r("v-flex",{attrs:{xs12:"",md1:""}},[r("v-btn",{staticClass:"transparent",attrs:{disabled:e.buttonsDisabled,flat:"",color:"error"},on:{click:function(t){e.showWarning=!0}}},[e._v("Delete")])],1),r("v-flex",{attrs:{xs12:""}},[r("v-data-table",{attrs:{items:e.streams,headers:e.headers,search:e.search,"item-key":"name","select-all":""},scopedSlots:e._u([{key:"items",fn:function(t){return[r("tr",{attrs:{active:t.selected},on:{click:function(e){t.selected=!t.selected}}},[r("td",[r("v-checkbox",{attrs:{color:"primary","input-value":t.selected,primary:"","hide-details":""}})],1),r("td",[e._v(e._s(t.item.name))]),r("td",[e._v(e._s(t.item.streamId))]),r("td",[e._v(e._s(t.item.owner))]),r("td",[e._v(e._s(t.item.private))]),r("td",[r("v-checkbox",{staticClass:"align-center justify-left",attrs:{disabled:"","hide-details":""},model:{value:t.item.deleted,callback:function(r){e.$set(t.item,"deleted",r)},expression:"props.item.deleted"}})],1)])]}}]),model:{value:e.selected,callback:function(t){e.selected=t},expression:"selected"}})],1),r("v-dialog",{attrs:{"max-width":"500"},model:{value:e.showWarning,callback:function(t){e.showWarning=t},expression:"showWarning"}},[r("v-card",[r("v-card-title",[r("span",{staticClass:"headline font-weight-light"},[r("strong",[e._v("Permanently")]),e._v(" delete these streams?")])]),r("v-card-actions",[r("v-spacer"),r("v-btn",{staticClass:"transparent",attrs:{flat:"",color:"error"},on:{click:function(t){return e.deleteSelected()}}},[e._v("Delete Permanently")]),r("v-btn",{on:{click:function(t){e.showWarning=!1}}},[e._v("Cancel")])],1)],1)],1)],1)},n=[],s=(r("ac6a"),r("f7fe"),r("13bb"),r("bc3a"),r("c64e"),r("369b"),{name:"AdminStreamsView",components:{},watch:{},computed:{buttonsDisabled:function(){return!(this.selected.length>0)},streams:function(){return this.$store.state.admin.streams}},data:function(){return{selected:[],search:"",headers:[{text:"Name",value:"name"},{text:"Id",value:"streamdId"},{text:"Owner",value:"owner"},{text:"Private",value:"private"},{text:"Archived",value:"deleted"}],showWarning:!1}},methods:{archiveSelected:function(e){var t=this;this.selected.forEach(function(r){t.$store.dispatch("updateStream",{streamId:r.streamId,deleted:e})})},deleteSelected:function(){var e=this;this.selected.forEach(function(t){e.$store.dispatch("deleteStream",t)})}},mounted:function(){}}),a=s,o=(r("ae53"),r("2877")),h=Object(o["a"])(a,i,n,!1,null,"a501804e",null);t["default"]=h.exports},ae53:function(e,t,r){"use strict";var i=r("ece9"),n=r.n(i);n.a},ece9:function(e,t,r){}}]);
//# sourceMappingURL=chunk-6e5b3d4a.18cf284d.js.map