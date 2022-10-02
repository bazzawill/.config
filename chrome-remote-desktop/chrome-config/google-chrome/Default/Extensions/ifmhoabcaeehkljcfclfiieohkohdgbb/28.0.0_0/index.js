/*
Social Fixer
(c) 2009-2021 Matt Kruse
http://SocialFixer.com/
*/

/*
 * Decide if we're supposed to be running at all.
 */
var prevent_running = false;

if (window.top != window.self ||                                      // We don't run in frames
    !location || /[?&]no_sfx/.test(location.search) ||                // URL keyword to disable
    /\/plugins\/|\/(l|ai|morestories)\.php$/.test(location.pathname)  // Avoid some FB features
   ) prevent_running = true;


// Extension API
var Extension = (function () {
    return {
        "storage": {
            "get": function (keys, def, callback, prefix) {
                var defaults = {};
                var defaults_with_prefix = {};
                var single = true;
                var p, ret2;
                if (typeof keys == "string") {
                    defaults[keys] = def;
                    defaults_with_prefix[prefix+keys] = def;
                }
                else {
                    single = false;
                    for (var i = 0; i < keys.length; i++) {
                        defaults[keys[i]] = def[i];
                        defaults_with_prefix[prefix+keys[i]] = def[i];
                    }
                }
//X.log("getting obj",defaults_with_prefix);
                chrome.storage.local.get(defaults_with_prefix, function (ret) {
//X.log("ret",ret);
                    if (chrome && chrome.extension && chrome.extension.lastError) {
                        console.log("Chrome error: " + chrome.extension.lastError.message);
                        callback(null, chrome.extension.lastError);
                    }
                    else {
                        if (single) {
                            callback(ret[prefix+keys]);
                        } else {
                            // We have to return an object back without the prefix in the keys
                            if (ret) {
                              ret2 = {};
                              for (p in ret) {
                                ret2[p.replace(prefix, '')] = ret[p];
                              }
//X.log("ret2",ret2);
                              callback(ret2);
                            }
                            else {
                              callback(ret);
                            }
                        }
                    }
                });
            }
            ,
            "set": function (key, val, callback, prefix) {
                var values = {};
                values[prefix+key] = val;
//X.log("set",values);
                chrome.storage.local.set(values, function () {
                    if (chrome && chrome.extension && chrome.extension.lastError) {
                        console.log("Chrome error: " + chrome.extension.lastError.message);
                    } else if (typeof callback == "function") {
                        callback(key, val);
                    }
                });
            }
        }
        ,
        "ajax":function(urlOrObject,callback) {
            var details;
            var internalCallback = function (response) {
                var headers = {};
                response.responseHeaders.split(/\r?\n/).forEach(function (header) {
                    var val = header.split(/\s*:\s*/, 2);
                    headers[val[0].toLowerCase()] = val[1];
                });
                callback(response.responseText, response.status, headers);
            };

            if (typeof urlOrObject == "string") {
                details = {"method": "GET", "url": urlOrObject, "onload": internalCallback};
            }
            else if (urlOrObject.url) {
                details = urlOrObject;
                details.onload = internalCallback;
            }
            else {
                alert("Invalid parameter passed to Extension.ajax");
                callback(null);
            }
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    var response = {
                        "responseText":xhr.responseText,
                        "responseHeaders":xhr.getAllResponseHeaders(),
                        "status":xhr.status
                    };
                    internalCallback(response);
                }
            };
            xhr.open(details.method, details.url, true);
            xhr.send();
        }
    };
})();
try {
var sfx_version = "28.0.0";
var sfx_buildtype = "web_extension";
var sfx_userscript_agent = undefined;
if (sfx_buildtype == "userscript") {
   var GMinfo = (typeof GM !== 'undefined' && GM.info) || GM_info;
   sfx_userscript_agent = "Script running under " +
      (!GMinfo ? "unknown v:unknown" :
         (GMinfo.scriptHandler || "Greasemonkey") + " v:" + (GMinfo.version || "unknown"));
   if (GMinfo && GMinfo.script && GMinfo.script.version && GMinfo.script.version.length) {
      sfx_version = GMinfo.script.version;
   }
}
var sfx_buildstr = sfx_version + " (" + sfx_buildtype + ")";
var sfx_user_agent = "Browser: " + navigator.userAgent;
var global_options = {
	"use_mutation_observers":true
};
var global = {};

// This actually executes module code by firing X.ready()
var run_modules = function() {
	// This tells each module to run itself
	X.ready();
	// First add any CSS that has been built up
	FX.css_dump();
	// Queue or Fire the DOMContentLoaded functions
	FX.fire_content_loaded();
};

// Should we even run at all? (see target_header.js)
if (!prevent_running) {
	// Allow modules to delay early execution of modules (until prefs are loaded) by returning false from beforeReady()
	if (X.beforeReady()!==false) {
		run_modules();
	}

  // Load Options (async)
  var bootstrap = function() {
    X.storage.get(['options', 'filters', 'tweaks', 'hiddens', 'postdata', 'friends', 'stats', 'tasks', 'messages'], [{}, [], [], {}, {}, {}, {}, {}, {}], function (options,err) {
      if (err) {
        console.log("Social Fixer Preferences could not be loaded from storage.");
        console.log(err);
      }
      else if (X.beforeReady(options) !== false) {
        run_modules();
        FX.options_loaded(options);
      }
    });
  };

  // Find out who we are
	// ===================
  X.userid = X.cookie.get('c_user') || "anonymous";
  // Prefix stored pref keys with userid so multiple FB users in the same browser can have separate prefs
  X.storage.prefix = X.userid;
  bootstrap();

}

} catch(e) {
    console.log(e);
}
