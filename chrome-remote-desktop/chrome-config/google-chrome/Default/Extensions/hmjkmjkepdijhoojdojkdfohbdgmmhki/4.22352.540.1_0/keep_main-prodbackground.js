/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
var b=this||self;function d(){var a;a:{if(a=b.navigator)if(a=a.userAgent)break a;a=""}chrome.app.window.create("index.html",{id:"google-keep",innerBounds:{width:960,height:700,minWidth:450,minHeight:540},frame:{color:-1!=a.indexOf("CrOS")?"#fff":void 0}})}chrome.app.runtime.onLaunched.addListener(d);chrome.notifications.onClicked.addListener(function(a){var c=chrome.app.window.getAll();c&&0==c.length&&(chrome.notifications.clear(a),d())});
