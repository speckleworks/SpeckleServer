(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-35bc4d64"],{"369b":function(e,t,r){var i,n,s;
/* @license
Papa Parse
v4.6.2
https://github.com/mholt/PapaParse
License: MIT
*/Array.isArray||(Array.isArray=function(e){return"[object Array]"===Object.prototype.toString.call(e)}),function(r,a){n=[],i=a,s="function"===typeof i?i.apply(t,n):i,void 0===s||(e.exports=s)}(0,function(){"use strict";var e,t,r="undefined"!=typeof self?self:"undefined"!=typeof window?window:void 0!==r?r:{},i=!r.document&&!!r.postMessage,n=i&&/(\?|&)papaworker(=|&|$)/.test(r.location.search),s=!1,a={},o=0,u={parse:function(t,i){var n=(i=i||{}).dynamicTyping||!1;if(E(n)&&(i.dynamicTypingFunction=n,n={}),i.dynamicTyping=n,i.transform=!!E(i.transform)&&i.transform,i.worker&&u.WORKERS_SUPPORTED){var l=function(){if(!u.WORKERS_SUPPORTED)return!1;if(!s&&null===u.SCRIPT_PATH)throw new Error("Script path cannot be determined automatically when Papa Parse is loaded asynchronously. You need to set Papa.SCRIPT_PATH manually.");var t=u.SCRIPT_PATH||e;t+=(-1!==t.indexOf("?")?"&":"?")+"papaworker";var i=new r.Worker(t);return i.onmessage=v,i.id=o++,a[i.id]=i}();return l.userStep=i.step,l.userChunk=i.chunk,l.userComplete=i.complete,l.userError=i.error,i.step=E(i.step),i.chunk=E(i.chunk),i.complete=E(i.complete),i.error=E(i.error),delete i.worker,void l.postMessage({input:t,config:i,workerId:l.id})}var h=null;return u.NODE_STREAM_INPUT,"string"==typeof t?h=i.download?new c(i):new f(i):!0===t.readable&&E(t.read)&&E(t.on)?h=new p(i):(r.File&&t instanceof File||t instanceof Object)&&(h=new d(i)),h.stream(t)},unparse:function(e,t){var r=!1,i=!0,n=",",s="\r\n",a='"',o=!1;!function(){"object"==typeof t&&("string"!=typeof t.delimiter||u.BAD_DELIMITERS.filter(function(e){return-1!==t.delimiter.indexOf(e)}).length||(n=t.delimiter),("boolean"==typeof t.quotes||Array.isArray(t.quotes))&&(r=t.quotes),"boolean"!=typeof t.skipEmptyLines&&"string"!=typeof t.skipEmptyLines||(o=t.skipEmptyLines),"string"==typeof t.newline&&(s=t.newline),"string"==typeof t.quoteChar&&(a=t.quoteChar),"boolean"==typeof t.header&&(i=t.header))}();var l=new RegExp(a,"g");if("string"==typeof e&&(e=JSON.parse(e)),Array.isArray(e)){if(!e.length||Array.isArray(e[0]))return c(null,e,o);if("object"==typeof e[0])return c(h(e[0]),e,o)}else if("object"==typeof e)return"string"==typeof e.data&&(e.data=JSON.parse(e.data)),Array.isArray(e.data)&&(e.fields||(e.fields=e.meta&&e.meta.fields),e.fields||(e.fields=Array.isArray(e.data[0])?e.fields:h(e.data[0])),Array.isArray(e.data[0])||"object"==typeof e.data[0]||(e.data=[e.data])),c(e.fields||[],e.data||[],o);throw"exception: Unable to serialize unrecognized input";function h(e){if("object"!=typeof e)return[];var t=[];for(var r in e)t.push(r);return t}function c(e,t,r){var a="";"string"==typeof e&&(e=JSON.parse(e)),"string"==typeof t&&(t=JSON.parse(t));var o=Array.isArray(e)&&0<e.length,u=!Array.isArray(t[0]);if(o&&i){for(var l=0;l<e.length;l++)0<l&&(a+=n),a+=d(e[l],l);0<t.length&&(a+=s)}for(var h=0;h<t.length;h++){var c=o?e.length:t[h].length,f=!1,p=o?0===Object.keys(t[h]).length:0===t[h].length;if(r&&!o&&(f="greedy"===r?""===t[h].join("").trim():1===t[h].length&&0===t[h][0].length),"greedy"===r&&o){for(var m=[],g=0;g<c;g++){var _=u?e[g]:g;m.push(t[h][_])}f=""===m.join("").trim()}if(!f){for(var v=0;v<c;v++){0<v&&!p&&(a+=n);var y=o&&u?e[v]:v;a+=d(t[h][y],v)}h<t.length-1&&(!r||0<c&&!p)&&(a+=s)}}return a}function d(e,t){if(null==e)return"";if(e.constructor===Date)return JSON.stringify(e).slice(1,25);e=e.toString().replace(l,a+a);var i="boolean"==typeof r&&r||Array.isArray(r)&&r[t]||function(e,t){for(var r=0;r<t.length;r++)if(-1<e.indexOf(t[r]))return!0;return!1}(e,u.BAD_DELIMITERS)||-1<e.indexOf(n)||" "===e.charAt(0)||" "===e.charAt(e.length-1);return i?a+e+a:e}}};if(u.RECORD_SEP=String.fromCharCode(30),u.UNIT_SEP=String.fromCharCode(31),u.BYTE_ORDER_MARK="\ufeff",u.BAD_DELIMITERS=["\r","\n",'"',u.BYTE_ORDER_MARK],u.WORKERS_SUPPORTED=!i&&!!r.Worker,u.SCRIPT_PATH=null,u.NODE_STREAM_INPUT=1,u.LocalChunkSize=10485760,u.RemoteChunkSize=5242880,u.DefaultDelimiter=",",u.Parser=_,u.ParserHandle=m,u.NetworkStreamer=c,u.FileStreamer=d,u.StringStreamer=f,u.ReadableStreamStreamer=p,r.jQuery){var l=r.jQuery;l.fn.parse=function(e){var t=e.config||{},i=[];return this.each(function(e){if("INPUT"!==l(this).prop("tagName").toUpperCase()||"file"!==l(this).attr("type").toLowerCase()||!r.FileReader||!this.files||0===this.files.length)return!0;for(var n=0;n<this.files.length;n++)i.push({file:this.files[n],inputElem:this,instanceConfig:l.extend({},t)})}),n(),this;function n(){if(0!==i.length){var t,r,n,a,o=i[0];if(E(e.before)){var h=e.before(o.file,o.inputElem);if("object"==typeof h){if("abort"===h.action)return t="AbortError",r=o.file,n=o.inputElem,a=h.reason,void(E(e.error)&&e.error({name:t},r,n,a));if("skip"===h.action)return void s();"object"==typeof h.config&&(o.instanceConfig=l.extend(o.instanceConfig,h.config))}else if("skip"===h)return void s()}var c=o.instanceConfig.complete;o.instanceConfig.complete=function(e){E(c)&&c(e,o.file,o.inputElem),s()},u.parse(o.file,o.instanceConfig)}else E(e.complete)&&e.complete()}function s(){i.splice(0,1),n()}}}function h(e){this._handle=null,this._finished=!1,this._completed=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},function(e){var t=b(e);t.chunkSize=parseInt(t.chunkSize),e.step||e.chunk||(t.chunkSize=null),this._handle=new m(t),(this._handle.streamer=this)._config=t}.call(this,e),this.parseChunk=function(e,t){if(this.isFirstChunk&&E(this._config.beforeFirstChunk)){var i=this._config.beforeFirstChunk(e);void 0!==i&&(e=i)}this.isFirstChunk=!1;var s=this._partialLine+e;this._partialLine="";var a=this._handle.parse(s,this._baseIndex,!this._finished);if(!this._handle.paused()&&!this._handle.aborted()){var o=a.meta.cursor;this._finished||(this._partialLine=s.substring(o-this._baseIndex),this._baseIndex=o),a&&a.data&&(this._rowCount+=a.data.length);var l=this._finished||this._config.preview&&this._rowCount>=this._config.preview;if(n)r.postMessage({results:a,workerId:u.WORKER_ID,finished:l});else if(E(this._config.chunk)&&!t){if(this._config.chunk(a,this._handle),this._handle.paused()||this._handle.aborted())return;a=void 0,this._completeResults=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(a.data),this._completeResults.errors=this._completeResults.errors.concat(a.errors),this._completeResults.meta=a.meta),this._completed||!l||!E(this._config.complete)||a&&a.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),l||a&&a.meta.paused||this._nextChunk(),a}},this._sendError=function(e){E(this._config.error)?this._config.error(e):n&&this._config.error&&r.postMessage({workerId:u.WORKER_ID,error:e,finished:!1})}}function c(e){var t;(e=e||{}).chunkSize||(e.chunkSize=u.RemoteChunkSize),h.call(this,e),this._nextChunk=i?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(e){this._input=e,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(t=new XMLHttpRequest,this._config.withCredentials&&(t.withCredentials=this._config.withCredentials),i||(t.onload=w(this._chunkLoaded,this),t.onerror=w(this._chunkError,this)),t.open("GET",this._input,!i),this._config.downloadRequestHeaders){var e=this._config.downloadRequestHeaders;for(var r in e)t.setRequestHeader(r,e[r])}if(this._config.chunkSize){var n=this._start+this._config.chunkSize-1;t.setRequestHeader("Range","bytes="+this._start+"-"+n),t.setRequestHeader("If-None-Match","webkit-no-cache")}try{t.send()}catch(e){this._chunkError(e.message)}i&&0===t.status?this._chunkError():this._start+=this._config.chunkSize}},this._chunkLoaded=function(){4===t.readyState&&(t.status<200||400<=t.status?this._chunkError():(this._finished=!this._config.chunkSize||this._start>function(e){var t=e.getResponseHeader("Content-Range");return null===t?-1:parseInt(t.substr(t.lastIndexOf("/")+1))}(t),this.parseChunk(t.responseText)))},this._chunkError=function(e){var r=t.statusText||e;this._sendError(new Error(r))}}function d(e){var t,r;(e=e||{}).chunkSize||(e.chunkSize=u.LocalChunkSize),h.call(this,e);var i="undefined"!=typeof FileReader;this.stream=function(e){this._input=e,r=e.slice||e.webkitSlice||e.mozSlice,i?((t=new FileReader).onload=w(this._chunkLoaded,this),t.onerror=w(this._chunkError,this)):t=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var e=this._input;if(this._config.chunkSize){var n=Math.min(this._start+this._config.chunkSize,this._input.size);e=r.call(e,this._start,n)}var s=t.readAsText(e,this._config.encoding);i||this._chunkLoaded({target:{result:s}})},this._chunkLoaded=function(e){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(e.target.result)},this._chunkError=function(){this._sendError(t.error)}}function f(e){var t;h.call(this,e=e||{}),this.stream=function(e){return t=e,this._nextChunk()},this._nextChunk=function(){if(!this._finished){var e=this._config.chunkSize,r=e?t.substr(0,e):t;return t=e?t.substr(e):"",this._finished=!t,this.parseChunk(r)}}}function p(e){h.call(this,e=e||{});var t=[],r=!0,i=!1;this.pause=function(){h.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){h.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(e){this._input=e,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){i&&1===t.length&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),t.length?this.parseChunk(t.shift()):r=!0},this._streamData=w(function(e){try{t.push("string"==typeof e?e:e.toString(this._config.encoding)),r&&(r=!1,this._checkIsFinished(),this.parseChunk(t.shift()))}catch(e){this._streamError(e)}},this),this._streamError=w(function(e){this._streamCleanUp(),this._sendError(e)},this),this._streamEnd=w(function(){this._streamCleanUp(),i=!0,this._streamData("")},this),this._streamCleanUp=w(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function m(e){var t,r,i,n=/^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i,s=/(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/,a=this,o=0,l=0,h=!1,c=!1,d=[],f={data:[],errors:[],meta:{}};if(E(e.step)){var p=e.step;e.step=function(t){if(f=t,y())v();else{if(v(),0===f.data.length)return;o+=t.data.length,e.preview&&o>e.preview?r.abort():p(f,a)}}}function m(t){return"greedy"===e.skipEmptyLines?""===t.join("").trim():1===t.length&&0===t[0].length}function v(){if(f&&i&&(w("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+u.DefaultDelimiter+"'"),i=!1),e.skipEmptyLines)for(var t=0;t<f.data.length;t++)m(f.data[t])&&f.data.splice(t--,1);return y()&&function(){if(f){for(var t=0;y()&&t<f.data.length;t++)for(var r=0;r<f.data[t].length;r++){var i=f.data[t][r];e.trimHeaders&&(i=i.trim()),d.push(i)}f.data.splice(0,1)}}(),function(){if(!f||!e.header&&!e.dynamicTyping&&!e.transform)return f;for(var t=0;t<f.data.length;t++){var r,i=e.header?{}:[];for(r=0;r<f.data[t].length;r++){var n=r,s=f.data[t][r];e.header&&(n=r>=d.length?"__parsed_extra":d[r]),e.transform&&(s=e.transform(s,n)),s=k(n,s),"__parsed_extra"===n?(i[n]=i[n]||[],i[n].push(s)):i[n]=s}f.data[t]=i,e.header&&(r>d.length?w("FieldMismatch","TooManyFields","Too many fields: expected "+d.length+" fields but parsed "+r,l+t):r<d.length&&w("FieldMismatch","TooFewFields","Too few fields: expected "+d.length+" fields but parsed "+r,l+t))}return e.header&&f.meta&&(f.meta.fields=d),l+=f.data.length,f}()}function y(){return e.header&&0===d.length}function k(t,r){return i=t,e.dynamicTypingFunction&&void 0===e.dynamicTyping[i]&&(e.dynamicTyping[i]=e.dynamicTypingFunction(i)),!0===(e.dynamicTyping[i]||e.dynamicTyping)?"true"===r||"TRUE"===r||"false"!==r&&"FALSE"!==r&&(n.test(r)?parseFloat(r):s.test(r)?new Date(r):""===r?null:r):r;var i}function w(e,t,r,i){f.errors.push({type:e,code:t,message:r,row:i})}this.parse=function(n,s,a){var o=e.quoteChar||'"';if(e.newline||(e.newline=function(e,t){e=e.substr(0,1048576);var r=new RegExp(g(t)+"([^]*?)"+g(t),"gm"),i=(e=e.replace(r,"")).split("\r"),n=e.split("\n"),s=1<n.length&&n[0].length<i[0].length;if(1===i.length||s)return"\n";for(var a=0,o=0;o<i.length;o++)"\n"===i[o][0]&&a++;return a>=i.length/2?"\r\n":"\r"}(n,o)),i=!1,e.delimiter)E(e.delimiter)&&(e.delimiter=e.delimiter(n),f.meta.delimiter=e.delimiter);else{var l=function(t,r,i,n){for(var s,a,o,l=[",","\t","|",";",u.RECORD_SEP,u.UNIT_SEP],h=0;h<l.length;h++){var c=l[h],d=0,f=0,p=0;o=void 0;for(var g=new _({comments:n,delimiter:c,newline:r,preview:10}).parse(t),v=0;v<g.data.length;v++)if(i&&m(g.data[v]))p++;else{var y=g.data[v].length;f+=y,void 0!==o?1<y&&(d+=Math.abs(y-o),o=y):o=y}0<g.data.length&&(f/=g.data.length-p),(void 0===a||d<a)&&1.99<f&&(a=d,s=c)}return{successful:!!(e.delimiter=s),bestDelimiter:s}}(n,e.newline,e.skipEmptyLines,e.comments);l.successful?e.delimiter=l.bestDelimiter:(i=!0,e.delimiter=u.DefaultDelimiter),f.meta.delimiter=e.delimiter}var c=b(e);return e.preview&&e.header&&c.preview++,t=n,r=new _(c),f=r.parse(t,s,a),v(),h?{meta:{paused:!0}}:f||{meta:{paused:!1}}},this.paused=function(){return h},this.pause=function(){h=!0,r.abort(),t=t.substr(r.getCharIndex())},this.resume=function(){h=!1,a.streamer.parseChunk(t,!0)},this.aborted=function(){return c},this.abort=function(){c=!0,r.abort(),f.meta.aborted=!0,E(e.complete)&&e.complete(f),t=""}}function g(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function _(e){var t,r=(e=e||{}).delimiter,i=e.newline,n=e.comments,s=e.step,a=e.preview,o=e.fastMode,l=t=void 0===e.quoteChar?'"':e.quoteChar;if(void 0!==e.escapeChar&&(l=e.escapeChar),("string"!=typeof r||-1<u.BAD_DELIMITERS.indexOf(r))&&(r=","),n===r)throw"Comment character same as delimiter";!0===n?n="#":("string"!=typeof n||-1<u.BAD_DELIMITERS.indexOf(n))&&(n=!1),"\n"!==i&&"\r"!==i&&"\r\n"!==i&&(i="\n");var h=0,c=!1;this.parse=function(e,u,d){if("string"!=typeof e)throw"Input must be a string";var f=e.length,p=r.length,m=i.length,g=n.length,_=E(s),v=[],y=[],k=[],b=h=0;if(!e)return U();if(o||!1!==o&&-1===e.indexOf(t)){for(var w=e.split(i),x=0;x<w.length;x++){if(k=w[x],h+=k.length,x!==w.length-1)h+=i.length;else if(d)return U();if(!n||k.substr(0,g)!==n){if(_){if(v=[],I(k.split(r)),j(),c)return U()}else I(k.split(r));if(a&&a<=x)return v=v.slice(0,a),U(!0)}}return U()}for(var C,R=e.indexOf(r,h),S=e.indexOf(i,h),D=new RegExp(l.replace(/[-[\]\/{}()*+?.\\^$|]/g,"\\$&")+t,"g");;)if(e[h]!==t)if(n&&0===k.length&&e.substr(h,g)===n){if(-1===S)return U();h=S+m,S=e.indexOf(i,h),R=e.indexOf(r,h)}else if(-1!==R&&(R<S||-1===S))k.push(e.substring(h,R)),h=R+p,R=e.indexOf(r,h);else{if(-1===S)break;if(k.push(e.substring(h,S)),P(S+m),_&&(j(),c))return U();if(a&&v.length>=a)return U(!0)}else for(C=h,h++;;){if(-1===(C=e.indexOf(t,C+1)))return d||y.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:v.length,index:h}),L();if(C===f-1)return L(e.substring(h,C).replace(D,t));if(t!==l||e[C+1]!==l){if(t===l||0===C||e[C-1]!==l){var O=A(-1===S?R:Math.min(R,S));if(e[C+1+O]===r){k.push(e.substring(h,C).replace(D,t)),h=C+1+O+p,R=e.indexOf(r,h),S=e.indexOf(i,h);break}var T=A(S);if(e.substr(C+1+T,m)===i){if(k.push(e.substring(h,C).replace(D,t)),P(C+1+T+m),R=e.indexOf(r,h),_&&(j(),c))return U();if(a&&v.length>=a)return U(!0);break}y.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:v.length,index:h}),C++}}else C++}return L();function I(e){v.push(e),b=h}function A(t){var r=0;if(-1!==t){var i=e.substring(C+1,t);i&&""===i.trim()&&(r=i.length)}return r}function L(t){return d||(void 0===t&&(t=e.substr(h)),k.push(t),h=f,I(k),_&&j()),U()}function P(t){h=t,I(k),k=[],S=e.indexOf(i,h)}function U(e){return{data:v,errors:y,meta:{delimiter:r,linebreak:i,aborted:c,truncated:!!e,cursor:b+(u||0)}}}function j(){s(U()),v=[],y=[]}},this.abort=function(){c=!0},this.getCharIndex=function(){return h}}function v(e){var t=e.data,r=a[t.workerId],i=!1;if(t.error)r.userError(t.error,t.file);else if(t.results&&t.results.data){var n={abort:function(){i=!0,y(t.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:k,resume:k};if(E(r.userStep)){for(var s=0;s<t.results.data.length&&(r.userStep({data:[t.results.data[s]],errors:t.results.errors,meta:t.results.meta},n),!i);s++);delete t.results}else E(r.userChunk)&&(r.userChunk(t.results,n,t.file),delete t.results)}t.finished&&!i&&y(t.workerId,t.results)}function y(e,t){var r=a[e];E(r.userComplete)&&r.userComplete(t),r.terminate(),delete a[e]}function k(){throw"Not implemented."}function b(e){if("object"!=typeof e||null===e)return e;var t=Array.isArray(e)?[]:{};for(var r in e)t[r]=b(e[r]);return t}function w(e,t){return function(){e.apply(t,arguments)}}function E(e){return"function"==typeof e}return n?r.onmessage=function(e){var t=e.data;if(void 0===u.WORKER_ID&&t&&(u.WORKER_ID=t.workerId),"string"==typeof t.input)r.postMessage({workerId:u.WORKER_ID,results:u.parse(t.input,t.config),finished:!0});else if(r.File&&t.input instanceof File||t.input instanceof Object){var i=u.parse(t.input,t.config);i&&r.postMessage({workerId:u.WORKER_ID,results:i,finished:!0})}}:u.WORKERS_SUPPORTED&&(t=document.getElementsByTagName("script"),e=t.length?t[t.length-1].src:"",document.body?document.addEventListener("DOMContentLoaded",function(){s=!0},!0):s=!0),(c.prototype=Object.create(h.prototype)).constructor=c,(d.prototype=Object.create(h.prototype)).constructor=d,(f.prototype=Object.create(f.prototype)).constructor=f,(p.prototype=Object.create(h.prototype)).constructor=p,u})},"5e40":function(e,t,r){},6135:function(e,t,r){"use strict";r.r(t);var i=function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("v-layout",{attrs:{row:"",wrap:""}},[r("v-flex",{attrs:{xs12:""}},[r("v-text-field",{attrs:{solo:"","append-icon":"search",label:"Search","single-line":"","hide-details":""},model:{value:e.search,callback:function(t){e.search=t},expression:"search"}})],1),r("v-flex",{attrs:{xs12:""}},[r("v-data-table",{attrs:{"disable-initial-sort":"",items:e.users,headers:e.headers,loading:e.isGettingUsersData,search:e.search,"item-key":"name"},scopedSlots:e._u([{key:"items",fn:function(t){return[r("tr",{attrs:{active:t.selected},on:{click:function(e){t.selected=!t.selected}}},[r("td",[r("v-btn",{attrs:{right:"",icon:""}},[r("v-icon",{attrs:{small:""},on:{click:function(r){return e.editUser(t.item)}}},[e._v("edit")])],1)],1),r("td",[e._v(e._s(t.item._id))]),r("td",[e._v(e._s(t.item.email))]),r("td",[e._v(e._s(t.item.name))]),r("td",[e._v(e._s(t.item.surname))]),r("td",[e._v(e._s(t.item.role)+" ")]),r("td",[e._v(e._s(t.item.company))]),r("td",[e._v(e._s(t.item.createdAt))]),r("td",[e._v(e._s(t.item.logins.length))]),r("td",[r("v-checkbox",{staticClass:"align-center justify-center",attrs:{disabled:"","hide-details":""},model:{value:t.item.archived,callback:function(r){e.$set(t.item,"archived",r)},expression:"props.item.archived"}})],1)])]}}]),model:{value:e.selected,callback:function(t){e.selected=t},expression:"selected"}}),r("v-dialog",{attrs:{"max-width":"600"},model:{value:e.showEditDialog,callback:function(t){e.showEditDialog=t},expression:"showEditDialog"}},[null!=e.userToEdit?r("users-edit-card",{attrs:{user:e.userToEdit},on:{"close-dialog":function(t){return e.closeDialog()},"close-dialog-success":function(t){return e.closeDialogSuccess()}}}):e._e()],1)],1)],1)},n=[],s=(r("f7fe"),r("13bb"),r("c64e"),r("369b"),function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("v-card",[r("v-container",[r("v-card-title",[r("span",{staticClass:"headline font-weight-light"},[e._v("Edit User")]),r("v-spacer"),r("v-btn",{attrs:{icon:""},on:{click:e.closeDialog}},[r("v-icon",[e._v("close")])],1)],1),r("v-card-title",[r("v-flex",{attrs:{xs12:""}},[e.showProgress?r("v-progress-linear",{attrs:{indeterminate:""}}):e._e(),r("v-form",[r("v-layout",{attrs:{row:"",wrap:""}},[r("v-flex",{attrs:{xs12:"",md6:""}},[r("v-text-field",{attrs:{label:"Name",required:""},model:{value:e.user.name,callback:function(t){e.$set(e.user,"name",t)},expression:"user.name"}})],1),r("v-flex",{attrs:{xs12:"",md6:""}},[r("v-text-field",{attrs:{label:"Surname",required:""},model:{value:e.user.surname,callback:function(t){e.$set(e.user,"surname",t)},expression:"user.surname"}})],1),r("v-flex",{attrs:{xs12:""}},[r("v-text-field",{attrs:{label:"Email",required:""},model:{value:e.user.email,callback:function(t){e.$set(e.user,"email",t)},expression:"user.email"}})],1),r("v-flex",{attrs:{xs12:""}},[r("v-text-field",{attrs:{label:"Company",required:""},model:{value:e.user.company,callback:function(t){e.$set(e.user,"company",t)},expression:"user.company"}})],1),r("v-flex",{attrs:{xs12:"",md6:""}},[r("v-select",{attrs:{items:["user","admin"],label:"Role",required:""},model:{value:e.user.role,callback:function(t){e.$set(e.user,"role",t)},expression:"user.role"}})],1),r("v-layout",{attrs:{"justify-end":""}},[r("v-flex",{attrs:{xs12:"",md6:""}},[r("v-spacer"),r("v-switch",{attrs:{label:"Archived",required:""},model:{value:e.user.archived,callback:function(t){e.$set(e.user,"archived",t)},expression:"user.archived"}})],1)],1)],1)],1)],1)],1),r("v-card-actions",[r("v-spacer"),r("v-btn",{attrs:{color:"primary",disabled:!0}},[e._v("Reset Password")]),r("v-btn",{attrs:{color:"primary",disabled:!e.valid},on:{click:e.saveUser}},[e._v("Save")])],1)],1)],1)}),a=[],o=(r("7f7f"),r("bc3a"),{name:"UserEditCard",props:{user:Object},computed:{valid:function(){return!(this.user.name.length<1||this.user.surname.length<1||this.user.company.length<1||"admin"!=this.user.role&&"user"!=this.user.role||this.user.email.length<1)}},data:function(){return{showProgress:!1}},methods:{saveUser:function(){var e=this;this.showProgress=!0;var t={_id:this.user._id,name:this.user.name,surname:this.user.surname,company:this.user.company,email:this.user.email,role:this.user.role,archived:this.user.archived};this.$store.dispatch("updateUserAdmin",t).then(function(){e.showProgress=!1,e.$emit("close-dialog")})},closeDialog:function(){this.$emit("close-dialog")}}}),u=o,l=r("2877"),h=Object(l["a"])(u,s,a,!1,null,"4a576550",null),c=h.exports,d={name:"AdminUsersView",components:{UsersEditCard:c},watch:{},computed:{users:function(){return this.$store.state.admin.users}},data:function(){return{usersResource:[],isGettingUsersData:!1,selected:[],userToEdit:null,search:"",headers:[{text:"Edit",value:""},{text:"Id",value:"_id"},{text:"Email",value:"email"},{text:"Name",value:"name"},{text:"Surname",value:"surname"},{text:"Role",value:"role"},{text:"Company",value:"company"},{text:"Joined",value:"name"},{text:"Logins",value:"logins.length"},{text:"Archived",value:"archived"}],showEditDialog:!1}},methods:{editUser:function(e){this.showEditDialog=!0,this.userToEdit=e},closeDialog:function(){this.showEditDialog=!1},closeDialogSuccess:function(){this.showEditDialog=!1}},mounted:function(){}},f=d,p=(r("add0"),Object(l["a"])(f,i,n,!1,null,"058d2e31",null));t["default"]=p.exports},add0:function(e,t,r){"use strict";var i=r("5e40"),n=r.n(i);n.a}}]);
//# sourceMappingURL=chunk-35bc4d64.badf83ce.js.map