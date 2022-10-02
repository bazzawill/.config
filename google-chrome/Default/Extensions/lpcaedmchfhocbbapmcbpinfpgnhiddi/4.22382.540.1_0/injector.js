/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
var m;function aa(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}}var p="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){if(a==Array.prototype||a==Object.prototype)return a;a[b]=c.value;return a};
function ba(a){a=["object"==typeof globalThis&&globalThis,a,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global];for(var b=0;b<a.length;++b){var c=a[b];if(c&&c.Math==Math)return c}throw Error("Cannot find global object");}var ca=ba(this);function q(a,b){if(b)a:{var c=ca;a=a.split(".");for(var d=0;d<a.length-1;d++){var e=a[d];if(!(e in c))break a;c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&p(c,a,{configurable:!0,writable:!0,value:b})}}
q("Symbol",function(a){function b(f){if(this instanceof b)throw new TypeError("Symbol is not a constructor");return new c(d+(f||"")+"_"+e++,f)}function c(f,k){this.ma=f;p(this,"description",{configurable:!0,writable:!0,value:k})}if(a)return a;c.prototype.toString=function(){return this.ma};var d="jscomp_symbol_"+(1E9*Math.random()>>>0)+"_",e=0;return b});
q("Symbol.iterator",function(a){if(a)return a;a=Symbol("Symbol.iterator");for(var b="Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "),c=0;c<b.length;c++){var d=ca[b[c]];"function"===typeof d&&"function"!=typeof d.prototype[a]&&p(d.prototype,a,{configurable:!0,writable:!0,value:function(){return da(aa(this))}})}return a});function da(a){a={next:a};a[Symbol.iterator]=function(){return this};return a}
function ea(a){var b="undefined"!=typeof Symbol&&Symbol.iterator&&a[Symbol.iterator];return b?b.call(a):{next:aa(a)}}var fa="function"==typeof Object.create?Object.create:function(a){function b(){}b.prototype=a;return new b},ha;if("function"==typeof Object.setPrototypeOf)ha=Object.setPrototypeOf;else{var ia;a:{var ja={a:!0},ka={};try{ka.__proto__=ja;ia=ka.a;break a}catch(a){}ia=!1}ha=ia?function(a,b){a.__proto__=b;if(a.__proto__!==b)throw new TypeError(a+" is not extensible");return a}:null}
var la=ha;function r(a,b){return Object.prototype.hasOwnProperty.call(a,b)}
q("WeakMap",function(a){function b(h){this.J=(g+=Math.random()+1).toString();if(h){h=ea(h);for(var l;!(l=h.next()).done;)l=l.value,this.set(l[0],l[1])}}function c(){}function d(h){var l=typeof h;return"object"===l&&null!==h||"function"===l}function e(h){if(!r(h,k)){var l=new c;p(h,k,{value:l})}}function f(h){var l=Object[h];l&&(Object[h]=function(n){if(n instanceof c)return n;Object.isExtensible(n)&&e(n);return l(n)})}if(function(){if(!a||!Object.seal)return!1;try{var h=Object.seal({}),l=Object.seal({}),
n=new a([[h,2],[l,3]]);if(2!=n.get(h)||3!=n.get(l))return!1;n.delete(h);n.set(l,4);return!n.has(h)&&4==n.get(l)}catch(E){return!1}}())return a;var k="$jscomp_hidden_"+Math.random();f("freeze");f("preventExtensions");f("seal");var g=0;b.prototype.set=function(h,l){if(!d(h))throw Error("Invalid WeakMap key");e(h);if(!r(h,k))throw Error("WeakMap key fail: "+h);h[k][this.J]=l;return this};b.prototype.get=function(h){return d(h)&&r(h,k)?h[k][this.J]:void 0};b.prototype.has=function(h){return d(h)&&r(h,
k)&&r(h[k],this.J)};b.prototype.delete=function(h){return d(h)&&r(h,k)&&r(h[k],this.J)?delete h[k][this.J]:!1};return b});
q("Map",function(a){function b(){var g={};return g.previous=g.next=g.head=g}function c(g,h){var l=g.v;return da(function(){if(l){for(;l.head!=g.v;)l=l.previous;for(;l.next!=l.head;)return l=l.next,{done:!1,value:h(l)};l=null}return{done:!0,value:void 0}})}function d(g,h){var l=h&&typeof h;"object"==l||"function"==l?f.has(h)?l=f.get(h):(l=""+ ++k,f.set(h,l)):l="p_"+h;var n=g.G[l];if(n&&r(g.G,l))for(g=0;g<n.length;g++){var E=n[g];if(h!==h&&E.key!==E.key||h===E.key)return{id:l,list:n,index:g,entry:E}}return{id:l,
list:n,index:-1,entry:void 0}}function e(g){this.G={};this.v=b();this.size=0;if(g){g=ea(g);for(var h;!(h=g.next()).done;)h=h.value,this.set(h[0],h[1])}}if(function(){if(!a||"function"!=typeof a||!a.prototype.entries||"function"!=typeof Object.seal)return!1;try{var g=Object.seal({x:4}),h=new a(ea([[g,"s"]]));if("s"!=h.get(g)||1!=h.size||h.get({x:4})||h.set({x:4},"t")!=h||2!=h.size)return!1;var l=h.entries(),n=l.next();if(n.done||n.value[0]!=g||"s"!=n.value[1])return!1;n=l.next();return n.done||4!=
n.value[0].x||"t"!=n.value[1]||!l.next().done?!1:!0}catch(E){return!1}}())return a;var f=new WeakMap;e.prototype.set=function(g,h){g=0===g?0:g;var l=d(this,g);l.list||(l.list=this.G[l.id]=[]);l.entry?l.entry.value=h:(l.entry={next:this.v,previous:this.v.previous,head:this.v,key:g,value:h},l.list.push(l.entry),this.v.previous.next=l.entry,this.v.previous=l.entry,this.size++);return this};e.prototype.delete=function(g){g=d(this,g);return g.entry&&g.list?(g.list.splice(g.index,1),g.list.length||delete this.G[g.id],
g.entry.previous.next=g.entry.next,g.entry.next.previous=g.entry.previous,g.entry.head=null,this.size--,!0):!1};e.prototype.clear=function(){this.G={};this.v=this.v.previous=b();this.size=0};e.prototype.has=function(g){return!!d(this,g).entry};e.prototype.get=function(g){return(g=d(this,g).entry)&&g.value};e.prototype.entries=function(){return c(this,function(g){return[g.key,g.value]})};e.prototype.keys=function(){return c(this,function(g){return g.key})};e.prototype.values=function(){return c(this,
function(g){return g.value})};e.prototype.forEach=function(g,h){for(var l=this.entries(),n;!(n=l.next()).done;)n=n.value,g.call(h,n[1],n[0],this)};e.prototype[Symbol.iterator]=e.prototype.entries;var k=0;return e});
q("Array.from",function(a){return a?a:function(b,c,d){c=null!=c?c:function(g){return g};var e=[],f="undefined"!=typeof Symbol&&Symbol.iterator&&b[Symbol.iterator];if("function"==typeof f){b=f.call(b);for(var k=0;!(f=b.next()).done;)e.push(c.call(d,f.value,k++))}else for(f=b.length,k=0;k<f;k++)e.push(c.call(d,b[k],k));return e}});
function ma(a,b){a instanceof String&&(a+="");var c=0,d=!1,e={next:function(){if(!d&&c<a.length){var f=c++;return{value:b(f,a[f]),done:!1}}d=!0;return{done:!0,value:void 0}}};e[Symbol.iterator]=function(){return e};return e}q("Array.prototype.keys",function(a){return a?a:function(){return ma(this,function(b){return b})}});q("Array.prototype.entries",function(a){return a?a:function(){return ma(this,function(b,c){return[b,c]})}});
q("Object.entries",function(a){return a?a:function(b){var c=[],d;for(d in b)r(b,d)&&c.push([d,b[d]]);return c}});q("Array.prototype.values",function(a){return a?a:function(){return ma(this,function(b,c){return c})}});q("Object.values",function(a){return a?a:function(b){var c=[],d;for(d in b)r(b,d)&&c.push(b[d]);return c}});var t=this||self;function u(a){var b=typeof a;return"object"!=b?b:a?Array.isArray(a)?"array":b:"null"}
function v(a){var b=u(a);return"array"==b||"object"==b&&"number"==typeof a.length}function w(a){var b=typeof a;return"object"==b&&null!=a||"function"==b}var na="closure_uid_"+(1E9*Math.random()>>>0),oa=0;function pa(a,b,c){return a.call.apply(a.bind,arguments)}
function qa(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var e=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(e,d);return a.apply(b,e)}}return function(){return a.apply(b,arguments)}}function x(a,b,c){x=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?pa:qa;return x.apply(null,arguments)}
function y(a,b){function c(){}c.prototype=b.prototype;a.P=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.ub=function(d,e,f){for(var k=Array(arguments.length-2),g=2;g<arguments.length;g++)k[g-2]=arguments[g];return b.prototype[e].apply(d,k)}}function ra(a){return a};function z(a,b){if(Error.captureStackTrace)Error.captureStackTrace(this,z);else{var c=Error().stack;c&&(this.stack=c)}a&&(this.message=String(a));void 0!==b&&(this.cause=b)}y(z,Error);z.prototype.name="CustomError";var A;function B(a,b){a=a.split("%s");for(var c="",d=a.length-1,e=0;e<d;e++)c+=a[e]+(e<b.length?b[e]:"%s");z.call(this,c+a[d])}y(B,z);B.prototype.name="AssertionError";function sa(a,b,c,d){var e="Assertion failed";if(c){e+=": "+c;var f=d}else a&&(e+=": "+a,f=b);throw new B(""+e,f||[]);}function C(a,b,c){a||sa("",null,b,Array.prototype.slice.call(arguments,2));return a}function D(a,b){throw new B("Failure"+(a?": "+a:""),Array.prototype.slice.call(arguments,1));}
function F(a,b,c){"number"!==typeof a&&sa("Expected number but got %s: %s.",[u(a),a],b,Array.prototype.slice.call(arguments,2));return a}function ta(a,b,c){"string"!==typeof a&&sa("Expected string but got %s: %s.",[u(a),a],b,Array.prototype.slice.call(arguments,2))};function ua(a,b){for(var c in a)b.call(void 0,a[c],c,a)}function va(a,b){for(var c in a)if(b.call(void 0,a[c],c,a))return!0;return!1}function wa(a){var b=[],c=0,d;for(d in a)b[c++]=d;return b};function G(){var a={DEFAULT:0,DARK:1};this.O={};this.ha={};if(a)for(var b in a)this.put(b,a[b])}G.prototype.put=function(a,b){C(void 0===this.O[a]);C(void 0===this.ha[b]);this.O[a]=b;this.ha[b]=a};G.prototype.get=function(a){return this.O[a]};G.prototype.M=function(){return wa(this.O)};var xa=/&/g,ya=/</g,za=/>/g,Aa=/"/g,Ba=/'/g,Ca=/\x00/g,Da=/[\x00&<>"']/;function Ea(){var a=t.navigator;return a&&(a=a.userAgent)?a:""}function H(a){return-1!=Ea().indexOf(a)};function Fa(){return(H("Chrome")||H("CriOS"))&&!H("Edge")||H("Silk")};var Ga=Array.prototype.indexOf?function(a,b){C(null!=a.length);return Array.prototype.indexOf.call(a,b,void 0)}:function(a,b){if("string"===typeof a)return"string"!==typeof b||1!=b.length?-1:a.indexOf(b,0);for(var c=0;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},Ha=Array.prototype.forEach?function(a,b){C(null!=a.length);Array.prototype.forEach.call(a,b,void 0)}:function(a,b){for(var c=a.length,d="string"===typeof a?a.split(""):a,e=0;e<c;e++)e in d&&b.call(void 0,d[e],e,a)};
function Ia(a){var b=a.length;if(0<b){for(var c=Array(b),d=0;d<b;d++)c[d]=a[d];return c}return[]};function Ja(a){Ja[" "](a);return a}Ja[" "]=function(){};var Ka=H("Trident")||H("MSIE"),La=H("Gecko")&&!(-1!=Ea().toLowerCase().indexOf("webkit")&&!H("Edge"))&&!(H("Trident")||H("MSIE"))&&!H("Edge"),Ma=-1!=Ea().toLowerCase().indexOf("webkit")&&!H("Edge");!H("Android")||Fa();Fa();var Na=H("Safari")&&!(Fa()||H("Coast")||H("Opera")||H("Edge")||H("Edg/")||H("OPR")||H("Firefox")||H("FxiOS")||H("Silk")||H("Android"))&&!(H("iPhone")&&!H("iPod")&&!H("iPad")||H("iPad")||H("iPod"));var I=null,Oa=La||Ma||!Na&&!Ka&&"function"==typeof t.atob;function Pa(a,b){function c(h){for(;d<a.length;){var l=a.charAt(d++),n=I[l];if(null!=n)return n;if(!/^[\s\xa0]*$/.test(l))throw Error("Unknown base64 encoding at char: "+l);}return h}Qa();for(var d=0;;){var e=c(-1),f=c(0),k=c(64),g=c(64);if(64===g&&-1===e)break;b(e<<2|f>>4);64!=k&&(b(f<<4&240|k>>2),64!=g&&b(k<<6&192|g))}}
function Qa(){if(!I){I={};for(var a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""),b=["+/=","+/","-_=","-_.","-_"],c=0;5>c;c++)for(var d=a.concat(b[c].split("")),e=0;e<d.length;e++){var f=d[e],k=I[f];void 0===k?I[f]=e:C(k===e)}}};C(!0);var Ra="function"===typeof Symbol&&"symbol"===typeof Symbol()?Symbol("INTERNAL_ARRAY_STATE"):void 0,Sa=Object.getOwnPropertyDescriptor(Array.prototype,"va");
Object.defineProperties(Array.prototype,{va:{get:function(){function a(e,f){e&b&&c.push(f)}var b=Ta(this),c=[];a(1,"IS_REPEATED_FIELD");a(2,"IS_IMMUTABLE_ARRAY");a(4,"IS_API_FORMATTED");a(8,"ONLY_MUTABLE_VALUES");a(16,"MUTABLE_REFERENCES_ARE_OWNED");a(32,"CONSTRUCTED");a(64,"TRANSFERRED");var d=c.join(",");return Sa?Sa.get.call(this)+"|"+d:d},configurable:!0,enumerable:!1}});function Ta(a){a=Ra?a[Ra]:a.vb;return null==a?0:a};function Ua(){throw Error("please construct maps as mutable then call toImmutable");}
if("undefined"!=typeof Symbol&&"undefined"!=typeof Symbol.hasInstance){var Va=function(){throw Error("Cannot perform instanceof checks on ImmutableMap: please use isImmutableMap or isMutableMap to assert on the mutability of a map. See go/jspb-api-gotchas#immutable-classes for more information");},Wa={};Object.defineProperties(Ua,(Wa[Symbol.hasInstance]={value:Va,configurable:!1,writable:!1,enumerable:!1},Wa));C(Ua[Symbol.hasInstance]===Va,"defineProperties did not work: was it monkey-patched?")};if("undefined"!==typeof Proxy){var J=Xa;new Proxy({},{getPrototypeOf:J,setPrototypeOf:J,isExtensible:J,preventExtensions:J,getOwnPropertyDescriptor:J,defineProperty:J,has:J,get:J,set:J,deleteProperty:J,apply:J,construct:J})}function Xa(){throw Error("this array or object is owned by JSPB and should not be reused, did you mean to copy it with copyJspbArray? See go/jspb-api-gotchas#construct_from_array");throw Error();};var Ya={ya:"activedescendant",za:"atomic",Aa:"autocomplete",Ba:"busy",Da:"checked",Ea:"colindex",Fa:"controls",Ga:"current",Ia:"describedby",DISABLED:"disabled",Ja:"dropeffect",Ka:"expanded",La:"flowto",Na:"grabbed",Pa:"haspopup",Qa:"hidden",Ra:"invalid",Sa:"label",Ta:"labelledby",Ua:"level",Va:"live",Wa:"multiline",Xa:"multiselectable",ab:"orientation",bb:"owns",eb:"posinset",fb:"pressed",gb:"readonly",ib:"relevant",jb:"required",kb:"rowindex",lb:"selected",mb:"setsize",nb:"sort",pb:"valuemax",qb:"valuemin",
rb:"valuenow",sb:"valuetext"};var Za;try{(new self.OffscreenCanvas(0,0)).getContext("2d")}catch(a){};var $a;function K(a,b){this.aa=a===ab&&b||"";this.na=bb}K.prototype.V=!0;K.prototype.N=function(){return this.aa};K.prototype.toString=function(){return"Const{"+this.aa+"}"};function cb(a){if(a instanceof K&&a.constructor===K&&a.na===bb)return a.aa;D("expected object of type Const, got '"+a+"'");return"type_error:Const"}var bb={},ab={};var db={};function L(a,b){this.Y=b===db?a:"";this.V=!0}L.prototype.N=function(){return this.Y.toString()};L.prototype.toString=function(){return this.Y.toString()};function eb(a){if(a instanceof L&&a.constructor===L)return a.Y;D("expected object of type SafeHtml, got '"+a+"' of type "+u(a));return"type_error:SafeHtml"}
function fb(a){a instanceof L||(a="object"==typeof a&&a.V?a.N():String(a),Da.test(a)&&(-1!=a.indexOf("&")&&(a=a.replace(xa,"&amp;")),-1!=a.indexOf("<")&&(a=a.replace(ya,"&lt;")),-1!=a.indexOf(">")&&(a=a.replace(za,"&gt;")),-1!=a.indexOf('"')&&(a=a.replace(Aa,"&quot;")),-1!=a.indexOf("'")&&(a=a.replace(Ba,"&#39;")),-1!=a.indexOf("\x00")&&(a=a.replace(Ca,"&#0;"))),a=gb(a));return a}
function gb(a){if(void 0===$a){var b=null;var c=t.trustedTypes;if(c&&c.createPolicy)try{b=c.createPolicy("goog#html",{createHTML:ra,createScript:ra,createScriptURL:ra})}catch(d){t.console&&t.console.error(d.message)}$a=b}a=(b=$a)?b.createHTML(a):a;return new L(a,db)}var hb=new L(t.trustedTypes&&t.trustedTypes.emptyHTML||"",db);var ib=function(a){var b=!1,c;return function(){b||(c=a(),b=!0);return c}}(function(){if("undefined"===typeof document)return!1;var a=document.createElement("div"),b=document.createElement("div");b.appendChild(document.createElement("div"));a.appendChild(b);if(!a.firstChild)return!1;b=a.firstChild.firstChild;a.innerHTML=eb(hb);return!b.parentElement});var jb={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",frameborder:"frameBorder",height:"height",maxlength:"maxLength",nonce:"nonce",role:"role",rowspan:"rowSpan",type:"type",usemap:"useMap",valign:"vAlign",width:"width"};
function kb(a,b,c){function d(g){g&&b.appendChild("string"===typeof g?a.createTextNode(g):g)}for(var e=1;e<c.length;e++){var f=c[e];if(!v(f)||w(f)&&0<f.nodeType)d(f);else{a:{if(f&&"number"==typeof f.length){if(w(f)){var k="function"==typeof f.item||"string"==typeof f.item;break a}if("function"===typeof f){k="function"==typeof f.item;break a}}k=!1}Ha(k?Ia(f):f,d)}}}function lb(a){C(a,"Node cannot be null or undefined.");return 9==a.nodeType?a:a.ownerDocument||a.document}
function mb(){this.H=t.document||document}m=mb.prototype;m.getElementsByTagName=function(a,b){return(b||this.H).getElementsByTagName(String(a))};m.setProperties=function(a,b){ua(b,function(c,d){c&&"object"==typeof c&&c.V&&(c=c.N());"style"==d?a.style.cssText=c:"class"==d?a.className=c:"for"==d?a.htmlFor=c:jb.hasOwnProperty(d)?a.setAttribute(jb[d],c):0==d.lastIndexOf("aria-",0)||0==d.lastIndexOf("data-",0)?a.setAttribute(d,c):a[d]=c})};
m.createElement=function(a){var b=this.H;a=String(a);"application/xhtml+xml"===b.contentType&&(a=a.toLowerCase());return b.createElement(a)};m.createTextNode=function(a){return this.H.createTextNode(String(a))};m.getWindow=function(){var a=this.H;return a.parentWindow||a.defaultView};m.appendChild=function(a,b){C(null!=a&&null!=b,"goog.dom.appendChild expects non-null arguments");a.appendChild(b)};m.append=function(a,b){kb(lb(a),a,arguments)};
m.canHaveChildren=function(a){if(1!=a.nodeType)return!1;switch(a.tagName){case "APPLET":case "AREA":case "BASE":case "BR":case "COL":case "COMMAND":case "EMBED":case "FRAME":case "HR":case "IMG":case "INPUT":case "IFRAME":case "ISINDEX":case "KEYGEN":case "LINK":case "NOFRAMES":case "NOSCRIPT":case "META":case "OBJECT":case "PARAM":case "SCRIPT":case "SOURCE":case "STYLE":case "TRACK":case "WBR":return!1}return!0};m.removeNode=function(a){return a&&a.parentNode?a.parentNode.removeChild(a):null};
m.getChildren=function(a){return void 0!=a.children?a.children:Array.prototype.filter.call(a.childNodes,function(b){return 1==b.nodeType})};m.contains=function(a,b){if(!a||!b)return!1;if(a.contains&&1==b.nodeType)return a==b||a.contains(b);if("undefined"!=typeof a.compareDocumentPosition)return a==b||!!(a.compareDocumentPosition(b)&16);for(;b&&a!=b;)b=b.parentNode;return b==a};function nb(a,b,c){Array.isArray(c)&&(c=c.join(" "));var d=ob(b);""===c||void 0==c?(Za||(c={},Za=(c.atomic=!1,c.autocomplete="none",c.dropeffect="none",c.haspopup=!1,c.live="off",c.multiline=!1,c.multiselectable=!1,c.orientation="vertical",c.readonly=!1,c.relevant="additions text",c.required=!1,c.sort="none",c.busy=!1,c.disabled=!1,c.hidden=!1,c.invalid="false",c)),c=Za,b in c?a.setAttribute(d,c[b]):a.removeAttribute(d)):a.setAttribute(d,c)}
function ob(a){C(a,"ARIA attribute cannot be empty.");a:{for(b in Ya)if(Ya[b]==a){var b=!0;break a}b=!1}C(b,"No such ARIA attribute "+a);return"aria-"+a};function pb(){this.T=this.T}pb.prototype.T=!1;pb.prototype.isDisposed=function(){return this.T};function qb(a,b){this.type=a;this.currentTarget=this.target=b;this.defaultPrevented=!1}qb.prototype.stopPropagation=function(){};qb.prototype.preventDefault=function(){this.defaultPrevented=!0};var rb=Object.freeze||function(a){return a};var sb=function(){if(!t.addEventListener||!Object.defineProperty)return!1;var a=!1,b=Object.defineProperty({},"passive",{get:function(){a=!0}});try{t.addEventListener("test",function(){},b),t.removeEventListener("test",function(){},b)}catch(c){}return a}();function M(a,b){qb.call(this,a?a.type:"");this.relatedTarget=this.currentTarget=this.target=null;this.button=this.screenY=this.screenX=this.clientY=this.clientX=this.offsetY=this.offsetX=0;this.key="";this.charCode=this.keyCode=0;this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1;this.state=null;this.pointerId=0;this.pointerType="";this.I=null;a&&this.init(a,b)}y(M,qb);var tb=rb({2:"touch",3:"pen",4:"mouse"});
M.prototype.init=function(a,b){var c=this.type=a.type,d=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement;this.currentTarget=b;if(b=a.relatedTarget){if(La){a:{try{Ja(b.nodeName);var e=!0;break a}catch(f){}e=!1}e||(b=null)}}else"mouseover"==c?b=a.fromElement:"mouseout"==c&&(b=a.toElement);this.relatedTarget=b;d?(this.clientX=void 0!==d.clientX?d.clientX:d.pageX,this.clientY=void 0!==d.clientY?d.clientY:d.pageY,this.screenX=d.screenX||0,this.screenY=
d.screenY||0):(this.offsetX=Ma||void 0!==a.offsetX?a.offsetX:a.layerX,this.offsetY=Ma||void 0!==a.offsetY?a.offsetY:a.layerY,this.clientX=void 0!==a.clientX?a.clientX:a.pageX,this.clientY=void 0!==a.clientY?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0);this.button=a.button;this.keyCode=a.keyCode||0;this.key=a.key||"";this.charCode=a.charCode||("keypress"==c?a.keyCode:0);this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=a.shiftKey;this.metaKey=a.metaKey;this.pointerId=
a.pointerId||0;this.pointerType="string"===typeof a.pointerType?a.pointerType:tb[a.pointerType]||"";this.state=a.state;this.I=a;a.defaultPrevented&&M.P.preventDefault.call(this)};M.prototype.stopPropagation=function(){M.P.stopPropagation.call(this);this.I.stopPropagation?this.I.stopPropagation():this.I.cancelBubble=!0};M.prototype.preventDefault=function(){M.P.preventDefault.call(this);var a=this.I;a.preventDefault?a.preventDefault():a.returnValue=!1};var ub="closure_listenable_"+(1E6*Math.random()|0);var vb=0;function wb(a,b,c,d,e){this.listener=a;this.proxy=null;this.src=b;this.type=c;this.capture=!!d;this.U=e;this.key=++vb;this.removed=this.S=!1}function xb(a){a.removed=!0;a.listener=null;a.proxy=null;a.src=null;a.U=null};function yb(a){this.src=a;this.j={};this.K=0}m=yb.prototype;m.add=function(a,b,c,d,e){var f=a.toString();a=this.j[f];a||(a=this.j[f]=[],this.K++);var k=zb(a,b,d,e);-1<k?(b=a[k],c||(b.S=!1)):(b=new wb(b,this.src,f,!!d,e),b.S=c,a.push(b));return b};m.remove=function(a,b,c,d){a=a.toString();if(!(a in this.j))return!1;var e=this.j[a];b=zb(e,b,c,d);return-1<b?(xb(e[b]),C(null!=e.length),Array.prototype.splice.call(e,b,1),0==e.length&&(delete this.j[a],this.K--),!0):!1};
function Ab(a,b){var c=b.type;if(c in a.j){var d=a.j[c],e=Ga(d,b),f;if(f=0<=e)C(null!=d.length),Array.prototype.splice.call(d,e,1);f&&(xb(b),0==a.j[c].length&&(delete a.j[c],a.K--))}}m.removeAll=function(a){a=a&&a.toString();var b=0,c;for(c in this.j)if(!a||c==a){for(var d=this.j[c],e=0;e<d.length;e++)++b,xb(d[e]);delete this.j[c];this.K--}return b};m.ra=function(a,b,c,d){a=this.j[a.toString()];var e=-1;a&&(e=zb(a,b,c,d));return-1<e?a[e]:null};
m.hasListener=function(a,b){var c=void 0!==a,d=c?a.toString():"",e=void 0!==b;return va(this.j,function(f){for(var k=0;k<f.length;++k)if(!(c&&f[k].type!=d||e&&f[k].capture!=b))return!0;return!1})};function zb(a,b,c,d){for(var e=0;e<a.length;++e){var f=a[e];if(!f.removed&&f.listener==b&&f.capture==!!c&&f.U==d)return e}return-1};var Bb="closure_lm_"+(1E6*Math.random()|0),Cb={},Db=0;function Eb(a,b,c,d,e){if(d&&d.once)Fb(a,b,c,d,e);else if(Array.isArray(b))for(var f=0;f<b.length;f++)Eb(a,b[f],c,d,e);else c=Gb(c),a&&a[ub]?a.listen(b,c,w(d)?!!d.capture:!!d,e):Hb(a,b,c,!1,d,e)}
function Hb(a,b,c,d,e,f){if(!b)throw Error("Invalid event type");var k=w(e)?!!e.capture:!!e,g=Ib(a);g||(a[Bb]=g=new yb(a));c=g.add(b,c,d,k,f);if(!c.proxy){d=Jb();c.proxy=d;d.src=a;d.listener=c;if(a.addEventListener)sb||(e=k),void 0===e&&(e=!1),a.addEventListener(b.toString(),d,e);else if(a.attachEvent)a.attachEvent(Kb(b.toString()),d);else if(a.addListener&&a.removeListener)C("change"===b,"MediaQueryList only has a change event"),a.addListener(d);else throw Error("addEventListener and attachEvent are unavailable.");
Db++}}function Jb(){function a(c){return b.call(a.src,a.listener,c)}var b=Lb;return a}function Fb(a,b,c,d,e){if(Array.isArray(b))for(var f=0;f<b.length;f++)Fb(a,b[f],c,d,e);else c=Gb(c),a&&a[ub]?a.ea.add(String(b),c,!0,w(d)?!!d.capture:!!d,e):Hb(a,b,c,!0,d,e)}function Mb(a,b,c,d,e){if(Array.isArray(b))for(var f=0;f<b.length;f++)Mb(a,b[f],c,d,e);else d=w(d)?!!d.capture:!!d,c=Gb(c),a&&a[ub]?a.ea.remove(String(b),c,d,e):a&&(a=Ib(a))&&(b=a.ra(b,c,d,e))&&Nb(b)}
function Nb(a){if("number"!==typeof a&&a&&!a.removed){var b=a.src;if(b&&b[ub])Ab(b.ea,a);else{var c=a.type,d=a.proxy;b.removeEventListener?b.removeEventListener(c,d,a.capture):b.detachEvent?b.detachEvent(Kb(c),d):b.addListener&&b.removeListener&&b.removeListener(d);Db--;(c=Ib(b))?(Ab(c,a),0==c.K&&(c.src=null,b[Bb]=null)):xb(a)}}}function Kb(a){return a in Cb?Cb[a]:Cb[a]="on"+a}function Lb(a,b){if(a.removed)a=!0;else{b=new M(b,this);var c=a.listener,d=a.U||a.src;a.S&&Nb(a);a=c.call(d,b)}return a}
function Ib(a){a=a[Bb];return a instanceof yb?a:null}var Ob="__closure_events_fn_"+(1E9*Math.random()>>>0);function Gb(a){C(a,"Listener can not be null.");if("function"===typeof a)return a;C(a.handleEvent,"An object listener must have handleEvent method.");a[Ob]||(a[Ob]=function(b){return a.handleEvent(b)});return a[Ob]};function Pb(a){pb.call(this);this.da=a||A||(A=new mb);this.ka={};this.ja={}}y(Pb,pb);var Qb=[];function N(){this.oa=new Pb}
N.prototype.speak=function(a,b){var c=this.oa;b=b||"polite";var d;if(d=c.ka[b])d.removeAttribute(ob("hidden"));else{var e=d=c.da.createElement("DIV");var f=d;f=Object.prototype.hasOwnProperty.call(f,na)&&f[na]||(f[na]=++oa);e.id="goog-lr-"+f;d.style.position="absolute";d.style.top="-1000px";d.style.height="1px";d.style.overflow="hidden";nb(d,"live",b);nb(d,"atomic","true");c.da.H.body.appendChild(d);c.ka[b]=d}e=(e=c.ja[b])&&e===a?a+"\u00a0":a;a&&(c.ja[b]=e);C(null!=d,"goog.dom.setTextContent expects a non-null value for node");if("textContent"in
d)d.textContent=e;else if(3==d.nodeType)d.data=String(e);else if(d.firstChild&&3==d.firstChild.nodeType){for(;d.lastChild!=d.firstChild;)d.removeChild(C(d.lastChild));d.firstChild.data=String(e)}else{for(;a=d.firstChild;)d.removeChild(a);a=lb(d);d.appendChild(a.createTextNode(String(e)))}};function Rb(a){if(a.C&&"function"==typeof a.C)return a.C();if("undefined"!==typeof Map&&a instanceof Map||"undefined"!==typeof Set&&a instanceof Set)return Array.from(a.values());if("string"===typeof a)return a.split("");if(v(a)){for(var b=[],c=a.length,d=0;d<c;d++)b.push(a[d]);return b}b=[];c=0;for(d in a)b[c++]=a[d];return b}
function Sb(a){if(a.M&&"function"==typeof a.M)return a.M();if(!a.C||"function"!=typeof a.C){if("undefined"!==typeof Map&&a instanceof Map)return Array.from(a.keys());if(!("undefined"!==typeof Set&&a instanceof Set)){if(v(a)||"string"===typeof a){var b=[];a=a.length;for(var c=0;c<a;c++)b.push(c);return b}return wa(a)}}}
function Tb(a,b,c){if(a.forEach&&"function"==typeof a.forEach)a.forEach(b,c);else if(v(a)||"string"===typeof a)Array.prototype.forEach.call(a,b,c);else for(var d=Sb(a),e=Rb(a),f=e.length,k=0;k<f;k++)b.call(c,e[k],d&&d[k],a)};var Ub=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Vb(a,b){if(a){a=a.split("&");for(var c=0;c<a.length;c++){var d=a[c].indexOf("="),e=null;if(0<=d){var f=a[c].substring(0,d);e=a[c].substring(d+1)}else f=a[c];b(f,e?decodeURIComponent(e.replace(/\+/g," ")):"")}}};function O(a){this.u=this.D=this.A="";this.F=null;this.B=this.s="";this.m=this.ua=!1;if(a instanceof O){this.m=a.m;Wb(this,a.A);var b=a.D;P(this);this.D=b;b=a.u;P(this);this.u=b;Xb(this,a.F);b=a.s;P(this);this.s=b;Yb(this,a.o.clone());a=a.B;P(this);this.B=a}else a&&(b=String(a).match(Ub))?(this.m=!1,Wb(this,b[1]||"",!0),a=b[2]||"",P(this),this.D=Q(a),a=b[3]||"",P(this),this.u=Q(a,!0),Xb(this,b[4]),a=b[5]||"",P(this),this.s=Q(a,!0),Yb(this,b[6]||"",!0),a=b[7]||"",P(this),this.B=Q(a)):(this.m=!1,this.o=
new R(null,this.m))}m=O.prototype;m.toString=function(){var a=[],b=this.A;b&&a.push(S(b,Zb,!0),":");var c=this.u;if(c||"file"==b)a.push("//"),(b=this.D)&&a.push(S(b,Zb,!0),"@"),a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c=this.F,null!=c&&a.push(":",String(c));if(c=this.s)this.u&&"/"!=c.charAt(0)&&a.push("/"),a.push(S(c,"/"==c.charAt(0)?$b:ac,!0));(c=this.o.toString())&&a.push("?",c);(c=this.B)&&a.push("#",S(c,bc));return a.join("")};
m.resolve=function(a){var b=this.clone(),c=!!a.A;c?Wb(b,a.A):c=!!a.D;if(c){var d=a.D;P(b);b.D=d}else c=!!a.u;c?(d=a.u,P(b),b.u=d):c=null!=a.F;d=a.s;if(c)Xb(b,a.F);else if(c=!!a.s){if("/"!=d.charAt(0))if(this.u&&!this.s)d="/"+d;else{var e=b.s.lastIndexOf("/");-1!=e&&(d=b.s.slice(0,e+1)+d)}e=d;if(".."==e||"."==e)d="";else if(-1!=e.indexOf("./")||-1!=e.indexOf("/.")){d=0==e.lastIndexOf("/",0);e=e.split("/");for(var f=[],k=0;k<e.length;){var g=e[k++];"."==g?d&&k==e.length&&f.push(""):".."==g?((1<f.length||
1==f.length&&""!=f[0])&&f.pop(),d&&k==e.length&&f.push("")):(f.push(g),d=!0)}d=f.join("/")}else d=e}c?(P(b),b.s=d):c=""!==a.o.toString();c?Yb(b,a.o.clone()):c=!!a.B;c&&(a=a.B,P(b),b.B=a);return b};m.clone=function(){return new O(this)};function Wb(a,b,c){P(a);a.A=c?Q(b,!0):b;a.A&&(a.A=a.A.replace(/:$/,""))}function Xb(a,b){P(a);if(b){b=Number(b);if(isNaN(b)||0>b)throw Error("Bad port number "+b);a.F=b}else a.F=null}
function Yb(a,b,c){P(a);b instanceof R?(a.o=b,a.o.Z(a.m)):(c||(b=S(b,cc)),a.o=new R(b,a.m))}m.getQuery=function(){return this.o.toString()};m.removeParameter=function(a){P(this);this.o.remove(a);return this};function P(a){if(a.ua)throw Error("Tried to modify a read-only Uri");}m.Z=function(a){this.m=a;this.o&&this.o.Z(a)};function Q(a,b){return a?b?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}
function S(a,b,c){return"string"===typeof a?(a=encodeURI(a).replace(b,dc),c&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function dc(a){a=a.charCodeAt(0);return"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var Zb=/[#\/\?@]/g,ac=/[#\?:]/g,$b=/[#\?]/g,cc=/[#\?@]/g,bc=/#/g;function R(a,b){this.i=this.g=null;this.l=a||null;this.m=!!b}function T(a){a.g||(a.g=new Map,a.i=0,a.l&&Vb(a.l,function(b,c){a.add(decodeURIComponent(b.replace(/\+/g," ")),c)}))}m=R.prototype;
m.add=function(a,b){T(this);this.l=null;a=U(this,a);var c=this.g.get(a);c||this.g.set(a,c=[]);c.push(b);this.i=F(this.i)+1;return this};m.remove=function(a){T(this);a=U(this,a);return this.g.has(a)?(this.l=null,this.i=F(this.i)-this.g.get(a).length,this.g.delete(a)):!1};m.clear=function(){this.g=this.l=null;this.i=0};function ec(a,b){T(a);b=U(a,b);return a.g.has(b)}m.forEach=function(a,b){T(this);this.g.forEach(function(c,d){c.forEach(function(e){a.call(b,e,d,this)},this)},this)};
m.M=function(){T(this);for(var a=Array.from(this.g.values()),b=Array.from(this.g.keys()),c=[],d=0;d<b.length;d++)for(var e=a[d],f=0;f<e.length;f++)c.push(b[d]);return c};m.C=function(a){T(this);var b=[];if("string"===typeof a)ec(this,a)&&(b=b.concat(this.g.get(U(this,a))));else{a=Array.from(this.g.values());for(var c=0;c<a.length;c++)b=b.concat(a[c])}return b};
m.set=function(a,b){T(this);this.l=null;a=U(this,a);ec(this,a)&&(this.i=F(this.i)-this.g.get(a).length);this.g.set(a,[b]);this.i=F(this.i)+1;return this};m.get=function(a,b){if(!a)return b;a=this.C(a);return 0<a.length?String(a[0]):b};
m.toString=function(){if(this.l)return this.l;if(!this.g)return"";for(var a=[],b=Array.from(this.g.keys()),c=0;c<b.length;c++){var d=b[c],e=encodeURIComponent(String(d));d=this.C(d);for(var f=0;f<d.length;f++){var k=e;""!==d[f]&&(k+="="+encodeURIComponent(String(d[f])));a.push(k)}}return this.l=a.join("&")};m.clone=function(){var a=new R;a.l=this.l;this.g&&(a.g=new Map(this.g),a.i=this.i);return a};function U(a,b){b=String(b);a.m&&(b=b.toLowerCase());return b}
m.Z=function(a){a&&!this.m&&(T(this),this.l=null,this.g.forEach(function(b,c){var d=c.toLowerCase();c!=d&&(this.remove(c),this.remove(d),0<b.length&&(this.l=null,this.g.set(U(this,d),Ia(b)),this.i=F(this.i)+b.length))},this));this.m=a};m.extend=function(a){for(var b=0;b<arguments.length;b++)Tb(arguments[b],function(c,d){this.add(d,c)},this)};Object.values({UNKNOWN:"unknown",Ha:"default",Oa:"groceries",Ma:"food",Ya:"music",hb:"recipes",Za:"notes",cb:"places",ob:"travel",tb:"video",Ca:"celebration"}).filter(function(a){return"unknown"!==a});function V(){this.R=[];new DataView(new ArrayBuffer(8))}function W(){}V.prototype=fa(W.prototype);V.prototype.constructor=V;if(la)la(V,W);else for(var X in W)if("prototype"!=X)if(Object.defineProperties){var fc=Object.getOwnPropertyDescriptor(W,X);fc&&Object.defineProperty(V,X,fc)}else V[X]=W[X];V.P=W.prototype;new V;new G;(function(a,b){if(Oa&&!b)return t.atob(a);var c="";Pa(a,function(d){c+=String.fromCharCode(d)});return c})("bGFiZWxz");Object.freeze("annotationsGroup isArchived isDirty isPinned lastSyncedText parentServerId reminder baseVersion baseNoteRevision serverId shareState roleInfo showAvailableInShoppingNotification timestamps".split(" "));cb(new K(ab,"http://goo.gl/forms/r40gTO4BTb"));cb(new K(ab,"https://keep.google.com"));/*

 SPDX-License-Identifier: Apache-2.0
*/
function gc(a,b){this.name=a;this.value=b}gc.prototype.toString=function(){return this.name};var hc=new gc("OFF",Infinity),ic=new gc("WARNING",900),jc=new gc("CONFIG",700);function kc(){this.L=0;this.clear()}var lc;kc.prototype.clear=function(){this.R=Array(this.L);this.ca=-1;this.ia=!1};function mc(a,b,c){this.reset(a||hc,b,c,void 0,void 0)}mc.prototype.reset=function(a,b){this.xa=b};mc.prototype.getMessage=function(){return this.xa};
function nc(a,b){this.level=null;this.ta=[];this.parent=(void 0===b?null:b)||null;this.children=[];this.wa={getName:function(){return a}}}function oc(a){if(a.level)return a.level;if(a.parent)return oc(a.parent);D("Root logger has no level set.");return hc}nc.prototype.publish=function(a){for(var b=this;b;)b.ta.forEach(function(c){c(a)}),b=b.parent};function pc(){this.entries={};var a=new nc("");a.level=jc;this.entries[""]=a}var qc;
function rc(a,b){var c=a.entries[b];if(c)return c;c=rc(a,b.slice(0,Math.max(b.lastIndexOf("."),0)));var d=new nc(b,c);a.entries[b]=d;c.children.push(d);return d}function sc(){qc||(qc=new pc);return qc};var tc=[];function uc(a){var b;if(b=rc(sc(),"safevalues").wa){var c="A URL with content '"+a+"' was sanitized away.",d=ic;if(a=b)if(a=b&&d){a=d.value;var e=b?oc(rc(sc(),b.getName())):hc;a=a>=e.value}if(a){d=d||hc;a=rc(sc(),b.getName());"function"===typeof c&&(c=c());lc||(lc=new kc);e=lc;b=b.getName();if(0<e.L){var f=(e.ca+1)%e.L;e.ca=f;e.ia?(e=e.R[f],e.reset(d,c,b),b=e):(e.ia=f==e.L-1,b=e.R[f]=new mc(d,c,b))}else b=new mc(d,c,b);a.publish(b)}}}-1===tc.indexOf(uc)&&tc.push(uc);var vc={wb:!0};function Y(){throw Error("Do not instantiate directly");}Y.prototype.pa=null;Y.prototype.getContent=function(){return this.content};Y.prototype.toString=function(){return this.content};function wc(){Y.call(this)}y(wc,Y);wc.prototype.qa=vc;var xc=function(a){function b(c){this.content=c}b.prototype=a.prototype;return function(c,d){c=new b(String(c));void 0!==d&&(c.pa=d);return c}}(wc),yc={};/*
 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
var zc=/^<(body|caption|col|colgroup|head|html|tr|td|th|tbody|thead|tfoot)>/i,Ac={};function Bc(){this.h=null;this.X=!1;this.ba="";this.ga();Eb(document,"mousedown",this.fa,void 0,this);var a={};a.selectedText=window.getSelection().toString();for(var b=document.getElementsByTagName("META"),c=0,d;d=b[c];c++)if("og:image"==d.getAttribute("property")){a.imageUrl=d.getAttribute("content");break}if(!a.imageUrl){b=0;c=document.getElementsByTagName("IMG");d=0;for(var e;e=c[d];d++){var f=e.naturalWidth||e.width,k=e.naturalHeight||e.height;if(128<=k&&128<=f&&k*f>b){b=k*f;var g=e.src}}g&&
(a.imageUrl=g)}a.imageUrl&&(g=a.imageUrl,g=g instanceof O?g.clone():new O(g),g.A||Wb(g,"http"),a.imageUrl=g.toString());Z(this,"pageScrape",a);this.la=x(this.sa,this);chrome.runtime.onMessage.addListener(this.la)}function Cc(a){a.h=null;Mb(document,"mousedown",x(a.fa,a),void 0,a);chrome.runtime.onMessage.removeListener(a.la);a.X=!0}function Z(a,b,c){if(!a.X)try{chrome.runtime.sendMessage(chrome.runtime.id,{type:b,value:c},void 0)}catch(d){Cc(a)}}
Bc.prototype.sa=function(a,b,c){if(w(a)&&!this.X)switch(a.type){case "appHeightChange":this.h&&(this.h.style.height=a.value);break;case "dispose":Cc(this);break;case "finishHide":this.h&&Dc(this,!1);break;case "selectedTextRequest":c(window.getSelection().toString());break;case "speakMessage":C(!Object.isSealed(N),"Cannot use getInstance() with a sealed constructor.");c="W";N.W&&N.hasOwnProperty(c)?c=N.W:(Qb.push(N),b=new N,N.W=b,C(N.hasOwnProperty(c),"Could not instantiate singleton."),c=b);c.speak(a.value);
break;case "show":this.h&&Dc(this,!0);break;case "toggleVisibility":a="none"==this.h.style.display,this.h&&("none"==this.h.style.display?(Dc(this,!0),this.h.contentWindow.focus(),Z(this,"show")):(Z(this,"startHide"),Z(this,"impression",9204))),c(a)}};
Bc.prototype.ga=function(){if("interactive"!=document.readyState&&"complete"!=document.readyState)Eb(document,"DOMContentLoaded",this.ga,void 0,this);else{var a=yc["notes.browseraction.soy.injects.injectedIframe"]?yc["notes.browseraction.soy.injects.injectedIframe"](Ac,void 0):xc('<iframe frameborder="0" style=" height: 438px; margin: 0px; padding: 0px; position: fixed; right: 5px; top: 5px; width: 370px; z-index: 2147483647;"></iframe>');var b=(A||(A=new mb)).createElement("DIV");if(w(a))if(a instanceof
Y){if(a.qa!==vc)throw Error("Sanitized content was not of kind HTML.");a=a.toString();var c=new K(ab,"Soy SanitizedContent of kind HTML produces SafeHtml-contract-compliant value.");ta(cb(c),"must provide justification");C(!/^[\s\xa0]*$/.test(cb(c)),"must provide non-empty justification");a=gb(a)}else D("Soy template output is unsafe for use as HTML: "+a),a=fb("zSoyz");else a=fb(String(a));c=a.N();var d=c.match(zc);C(!d,"This template starts with a %s, which cannot be a child of a <div>, as required by soy internals. Consider using goog.soy.renderElement instead.\nTemplate output: %s",
d&&d[0],c);if(ib())for(;b.lastChild;)b.removeChild(b.lastChild);b.innerHTML=eb(a);1==b.childNodes.length&&(a=b.firstChild,1==a.nodeType&&(b=a));if(!w(b)||!w(b)||!w(b)||1!==b.nodeType||b.namespaceURI&&"http://www.w3.org/1999/xhtml"!==b.namespaceURI||b.tagName.toUpperCase()!=="IFRAME".toString()){a="IFRAME".toString()+"; got: ";if(w(b))try{var e=b.constructor.displayName||b.constructor.name||Object.prototype.toString.call(b)}catch(f){e="<object could not be stringified>"}else e=void 0===b?"undefined":
null===b?"null":typeof b;D("Argument is not an HTML Element with tag name "+(a+e))}this.h=b;this.ba=this.h.style.cssText;this.h.id="keep-popup-frame";this.h.src=chrome.extension.getURL("index.html");document.body.appendChild(this.h);Dc(this,!0);this.h.contentWindow.focus()}};function Dc(a,b){a.h.style.cssText=a.ba+" display: "+(b?"block !important;":"none")}Bc.prototype.fa=function(a){0==a.button&&this.h&&"none"!=this.h.style.display&&(Z(this,"startHide"),Z(this,"impression",9203))};new Bc;