// =====================================================
// Apply Filters to posts when they are added or updated
// =====================================================
// Filters depend on options, so wait until they load
X.ready('post_filters', function() {
    FX.add_option('filters_enabled', {"section": "Filters", "hidden": true, "default": true});
    FX.add_option('filters_enabled_pages', {"section": "Filters", "hidden": true, "default": false});
    FX.add_option('filters_enabled_groups', {"section": "Filters", "hidden": true, "default": false});
    FX.add_option('filters_forced_processing_delay', {"type":"number", "section":"Advanced", "title":"Post Filter Force Delay", "description":"The time in ms after which post filtering will be forced even if all the content is not yet available", "default": 1 * X.seconds});

    FX.add_option('hide_posts_text', {"hidden":true, "type":"textarea", "section":"Hide Posts", "title":"Hide Posts Keywords", "default":""});
    FX.add_option('hide_posts_show_hidden_message', {"hidden":true, "section":"Hide Posts", "title":"Show hidden post message", "default":true});
    FX.add_option('hide_posts_show_match', {"hidden":true, "section":"Hide Posts", "title":"Show Matching Text", "default":true});
    FX.add_option('hide_posts_partial', {"hidden":true, "section":"Hide Posts", "title":"Match Partial Words", "default":true});
    FX.add_option('hide_posts_case_sensitive', {"hidden":true, "section":"Hide Posts", "title":"Case Sensitive", "default":false});
    FX.add_option('hide_posts_caption', {hidden:true, section:'Hide Posts', title:'Caption', default:true});

    var sfx_post_data = {};
    var sfx_filter_trace = {};
    var filter_trace = function (id, msg) {
        if (!sfx_filter_trace[id]) {
            sfx_filter_trace[id] = [];
        }
        if (!sfx_filter_trace[id][0]) {
            sfx_filter_trace[id] = [performance.now()];
        }
        sfx_filter_trace[id].push(((performance.now() - sfx_filter_trace[id][0]) / X.seconds).toFixed(6) + ' ' + msg);
    };
    X.subscribe("log/filter", function (msg, data) {
        filter_trace(data.id, data.message);
    });

    var group_link_selector = "h4 a[href*='/groups/']";

    X.subscribe("context/ready", function() {
      FX.on_options_load(function () {
        var FORCED_PROCESSING_DELAY = +FX.option('filters_forced_processing_delay');

        var show_filtering_disabled_message_displayed = false;
        var show_filtering_disabled_message = function () {
            if (show_filtering_disabled_message_displayed) {
                return;
            }
            show_filtering_disabled_message_displayed = true;
            var msg = "By default, post filtering only affects the main Newsfeed.<br>You can change this in Options if you wish.";
            context_message("filter_disabled_message", msg, {"title": "Post Filtering Disabled"});
        };
        FX.on_page_unload(function () {
            show_filtering_disabled_message_displayed = false;
        });

        var filters = X.clone(FX.storage('filters'));

        // If there are any "Hide Posts" keywords defined, create a filter to hide them
        var hide_posts_text = (FX.option('hide_posts_text') || '').trim();
        if (hide_posts_text) {
            var keywords = hide_posts_text.replace(/([^\w\s\n])/g,"\\$1").split(/\s*\n\s*/);
            var keywords_regex = "(" + keywords.join('|') + ")";
            if (!FX.option('hide_posts_partial')) {
                keywords_regex = "(?:^|\\b)" + keywords_regex + "(?:\\b|$)";
            }
            var modifier = FX.option('hide_posts_case_sensitive') ? null : "i";
            var show_note = FX.option('hide_posts_show_hidden_message');
            var filter = {
                "match": "ALL",
                "enabled": true,
                "stop_on_match": true,
                "rules": [
                    {
                        target: FX.option('hide_posts_caption') ? 'any+image' : 'any',
                        "operator": "matches",
                        "condition": {
                            "text": keywords_regex,
                            "modifier": modifier
                        }
                    }
                ],
                "actions": [
                    {
                        "action": "hide",
                        "show_note": show_note,
                        "custom_note": "Post Hidden by keyword" + (FX.option('hide_posts_show_match')?": $1":"")
                    }
                ],
                "title": "Hide Posts"
            };
            filters.unshift(filter);
        }

        var decide_filter_post = function (post, dom_id) {
            // If the post has already been properly filtered, don't do anything
            if (post.attr('sfx_filtered')) {
                return 'already';
            }

            if (!FX.option('filters_enabled')) {
                filter_trace(dom_id, 'Not filtering post because filtering is disabled');
                return false;
            }

            if (!filters || !filters.length) {
                filter_trace(dom_id, 'Not filtering post because there are no filters');
                return false;
            }

            if (!post || !post[0]) {
                filter_trace(dom_id, 'Not filtering post because it apparently doesnt exist');
                return false;
            }

            // If there are no child nodes or content, then this is a shell - don't do anything yet
            if (!post[0].childNodes || post[0].childNodes.length==0 || !post.innerText()) {
                return 'notyet';
            }

            // Special handling for SFx support groups
            // 1. Posts in regular News Feed -- hide Reply links
            if (FX.context.type != 'groups') {
                var group_hovercard = post.find(group_link_selector).last();
                var group_href = group_hovercard.attr('href') || '';
                var group_linkname = group_href.replace(/.*\/groups\/([^/]*).*/,'$1');
                if (!FX.option('support_posts_allow_reply') && FX.sfx_support_groups.includes(group_linkname))
                    post.addClass('sfx_support_post');
            }
            // 2. Posts within a support group -- hide Reply links & disable filtering
            if (FX.context.type == 'groups' &&
                FX.sfx_support_groups.includes(FX.context.id)) {
                    // Disable the 'Reply' button
                    if (!FX.option('support_posts_allow_reply')) {
                        post.addClass('sfx_support_post');
                    }
                    // Disable filtering
                    if (FX.option('filters_enabled_groups') &&
                        !FX.option('support_groups_allow_filters')) {
                        filter_trace(dom_id, "Not filtering post because filtering is automatically disabled in SFx support Groups");
                        var cmsg = "Social Fixer automatically disables filtering in its support groups,<br>to avoid confusion from posts not showing.<br>Your filters will not be applied here.";
                        context_message("filter_disabled_in_support_message", cmsg, {"title": "Post Filtering Disabled"});
                        return false;
                    }
            }

            // Don't filter on permalink (single story) pages, which are reached
            // from Notifications and must show what is being notified about
            if (FX.context.permalink) {
                filter_trace(dom_id, "Not filtering post because this is a permalink");
                return false;
            }

            // Don't filter on timelines (including Pages) if that's disabled
            if (FX.context.type == "profile" && !FX.option('filters_enabled_pages')) {
                filter_trace(dom_id, "Not filtering post because filtering is disabled on Pages/Timelines");
                show_filtering_disabled_message();
                return false;
            }

            // Don't filter in Groups if that's disabled
            if (FX.context.type == "groups" && !FX.option('filters_enabled_groups')) {
                filter_trace(dom_id, "Not filtering post because filtering is disabled in Groups");
                show_filtering_disabled_message();
                return false;
            }

            return true;
        };

        var dont_filter_post = function (post, dom_id) {
            var decision = decide_filter_post(post, dom_id);
            if (decision == true) {
                return false;
            }
            if (decision == false) {
                // Some static don't-filter condition: mark already filtered
                post.attr('sfx_filtered','true');
            }
            // decision == false, 'already', or 'notyet': don't filter right now
            return true;
        };

        var filter_post = function (msg, data) {
            var post = X(data.selector);
            var dom_id = data.id;
            var sfx_id = data.sfx_id;

            var post_data = sfx_post_data[dom_id];
            if (msg == "post/add") {
                sfx_post_data[dom_id] = {"sfx_id": sfx_id, "dom_id": dom_id, "id": dom_id};
                post_data = sfx_post_data[dom_id];
                sfx_filter_trace[dom_id] = [];
            }
            else {
                // In case of update, sfx_id might have been set
                if (sfx_id && !post_data.sfx_id) {
                    post_data.sfx_id = sfx_id;
                }
            }

            if (dont_filter_post(post, dom_id)) {
                return false;
            }

            // Wait for preprocessor if we've beaten it
            // if (!post.attr('sfx_ppa')) {
            //     setTimeout(function() {
            //         X.publish('post/preprocess', post);
            //         if (!post.attr('sfx_ppa')) {
            //             post.attr('sfx_ppa', 3);
            //         }
            //         filter_post(msg, data);
            //     }, 1 * X.seconds);
            //     return;
            // }

            // FILTER THE POST!
            // ================
            var result = apply_filters(post, post_data, filters, false);
            if (typeof result=="undefined") {
                // Couldn't apply filters, try again on post/update, since the attr will not have been set
                // Force it after a certain amount of time, if it's already been filtered the attr will have been set, so no worries
                setTimeout(function() {
                    if (post.attr('sfx_filtered')) { return; }
                    post.attr('sfx_filtered','true');
                    post.attr('sfx_filtered_forced','true');
                    apply_filters(post, post_data, filters, true);
                },FORCED_PROCESSING_DELAY);
            }
            else {
                // Filters were successfully applied, even if they didn't filter anything
                post.attr('sfx_filtered','true');
            }
        };

        // Filter all posts so [sfx_filtered] attribute is universal;
        // and to allow on-the-fly enabling
        X.subscribe(["post/add", "post/update"], filter_post, true);

      });
    });

    // Extract parts of the post that can be filtered on
    // NOTE: If a part can't be found (so its match is undefined), set the value as null.
    // If it is found but has no value, then set the value as empty string
    var extract = {
        "author": function (o, data) {
            var a;
            a = o.find('h4 a');
            if (a.length) {
                data.author = a[0].textContent;
                // Store a reference to the author link itself
                data.authorContent = [a];
            }
            return data.author;
        },
        "group": function (o, data) {
            data.group = null;
            var $el = o.find(group_link_selector);
            // Take the last-mentioned group whose link text is not 'group',
            // as FB sometimes form a sentence like 'Joe Blow shared a _group_',
            // or 'Joe Blow shared a _group_ to _Named Group_' (both are links).
            // XXX still not right for non-English UI language; do best we can.
            $el.forEach(function(a) {
                if (a.textContent != 'group') {
                  // The anchor looks good, but check to make sure there is a structure for the > character
                  if (X(a).closest('span').prev().children('i').size()>0) {
                      data.group = a.textContent;
                  }
                }
            });
            return data.group;
        },
        "page": function (o, data) {
            data.page = null;
            // 2021-3-15: Treat the same as author for now since we can't distinguish Pages anymore
            var $el = o.find("h4 a");
            if ($el.length) {
                data.page = $el[0].textContent;
            }
            return data.page;
        },
        "link_url": function (o, data) {
            var links = o.find('a[href*="l\.facebook\.com/l\.php');
            if (links.length) {
                var redirect_url = X(links[0]).attr('href');
                var dissect_url = redirect_url.match(/https:\/\/l\.facebook\.com\/l\.php\?u=([^&]*)/);
                if (dissect_url && dissect_url.length > 1) {
                    data.link_url = decodeURIComponent(dissect_url[1]);
                } else {
                    data.link_url = redirect_url;
                }
            }
            return data.link_url;
        },
        "link_text": function (o, data) {
            var links = o.find('a[href*="l.\.facebook\.com/l\.php');
            if (links.length) {
                data.link_text = X(links[0]).text();
            }
            return data.link_text;
        },
        // "type": function (o, data) {
        //     // todo?
        // },
        "all_content": function (o, data) {
            var nodeFilter_obj = {
                acceptNode: function(node) {
                    return   (!node.tagName ||
                              node.tagName == '#text' ||
                              node.tagName == 'TEXT') ? NodeFilter.FILTER_ACCEPT
                           : (node.tagName == 'FORM') ? NodeFilter.FILTER_REJECT
                           :                            NodeFilter.FILTER_SKIP;
                }
            };
            data.all_content = o.innerText(nodeFilter_obj) || '';
            return data.all_content;
        },
        "content": function (o, data) {
            var els, str = "";
            // Store a reference to all userContent areas, in case we need to manipulate them (replace text, etc)
            data.userContent = [];
            els = o.find('*[style="text-align: start;"]');
            els.forEach(function (el) {
                el = X(el);
                str += el.innerText() + ' ';
                data.userContent.push(el);
            });
            if (str) {
                data.content = str;
            }
            return data.content;
        },
        "action": function (o, data) {
            // Store a reference to all actionContent areas, in case we need to manipulate them (replace text, etc)
            data.actionContent = [];
            var str = o.find("h4").shallowText();
            if (str) {
                data.action = str;
            }
            return data.action;
        },
        "app": function (o, data) {
            //data.app = null;
            var app = o.find('a[data-appname]').attr('data-appname');
            if (app) {
                data.app = app;
            }
            return data.app;
        },
        "image": function (o, data) {
            //data.image = null;
            var image = "";
            o.find('img[alt]').forEach(function(img) {
                if (!X(img).is('.commentable_item img')) {
                    image += X(img).attr('alt') + ' ';
                }
            });
            if (image.length) {
                data.image = image;
            }
            return data.image;
        },
    };

    // Util method to replace text content in text nodes
    function replaceText(rootNode, find, replace) {
        var children = rootNode.childNodes;
        for (var i = 0; i < children.length; i++) {
            var aChild = children[i];
            if (aChild.nodeType == 3) {
                var storedText = '';
                // If the parent node has an attribute storing the text value, check it to see if it's changed.
                // This is a method to prevent text replace actions from triggering another mutation event and repeatedly changing the same text.
                // This really only happens if the replace text is a superset of the find text.
                if (aChild.parentNode) {
                    storedText = aChild.parentNode.getAttribute('sfx_node_text') || '';
                }
                var nodeValue = aChild.nodeValue;
                if (nodeValue != storedText) {
                    var newVal = nodeValue.replace(find, replace);
                    if (newVal != nodeValue) {
                        aChild.nodeValue = newVal;
                        aChild.parentNode.setAttribute('sfx_node_text', newVal);
                    }
                }
            }
            else {
                replaceText(aChild, find, replace);
            }
        }
    }

    // Run filters to take actions on a post
    function apply_filters(post, data, filters, force_processing) {
        if (!filters || filters.length == 0) {
            return false;
        }
        var k;
        var updated_post_data = {}; // With each filtering run, re-extract pieces and update the record
        var match = false;
        filter_trace(data.id, `BEGIN Filtering`);
        if (force_processing) {
            filter_trace(data.id, `Force filtering enabled`);
        }
        if (data.next_filter == undefined) {
            data.next_filter = 0;
        }
        for (; data.next_filter < filters.length; data.next_filter++) {
            var filter = filters[data.next_filter];
            if (filter.enabled === false) {
                filter_trace(data.id, `Filter #${data.next_filter + 1} (${filter.title}) Disabled`);
                continue;
            }
            filter_trace(data.id, `Filter #${data.next_filter + 1} (${filter.title})`);
            var result = apply_filter(post, data, updated_post_data, filter, force_processing);
            if (typeof result=="undefined") { // Some rules could not be executed
                filter_trace(data.id, `END Filtering because a condition could not be tested yet.`);
                match = undefined;
                break;
            }
            if (result) {
                match = true;
                if (filter.stop_on_match) {
                    filter_trace(data.id, `Filter processing stopped because "Stop on Match" is active`);
                    break;
                }
            }
        }
        if (match != undefined) {
            filter_trace(data.id, `END Filtering. Filtered=${match}`);
        }
        // Update the post's data with the new rxtracted data
        for (k in updated_post_data) {
            if (match != undefined || updated_post_data[k] != null) {
                data[k] = updated_post_data[k];
            }
        }
        return match;
    }

    // Extract one type of data from a post, to filter against
    function extract_post_data(post,extracted_data,type) {
        // If it's already been extracted in this run of filtering, return it
        if (typeof extracted_data[type]!="undefined") {
            return extracted_data[type];
        }
        if (typeof extract[type] != 'function') {
            return (extracted_data[type] = `\${${type}}`);
        }
        return extract[type](post, extracted_data);
    }

    // Execute a single filter on a post
    function apply_filter(post, data, updated_data, filter, force_processing) {
        if (!filter || !filter.rules || !filter.rules.length > 0 || !filter.actions) {
            return false;
        }
        var all_match = true;
        var any_match = false;
        var abort = false;
        // XXX Should be applied at input time so user sees the change
        // XXX May break legit pipe matchers: /foo\||bar/ or /bar|foo\|/
        // XXX Any other fun-yet-fixable mistakes users like to make?
        function fix_regexp_mistakes(regexp) {
            return regexp
                         .replace(/^\s*\|/,'')   // Leading pipe
                         .replace(/\|\|+/g,'|')  // Double (or more) pipes
                         .replace(/\|\s*$/,'')   // Trailing pipe
            ;
        }
        filter.rules.forEach(function (rule) {
            if (abort) { return; }
            var condition_text, regex, results;
            try {
                if (any_match && "ANY" === filter.match) {
                    return; // Already matched a condition
                }
                if (!all_match && "ALL" === filter.match) {
                    return; // Already failed on one rule, don't continue
                }
                var match = false;
                var operator = rule.operator;

                // Handle "NOT" operators
                var not = false;
                var NOT = '';
                if (/^not_/.test(operator)) {
                    not = true;
                    NOT = 'NOT ';
                    operator = operator.replace(/^not_/,'');
                }

                // The "selector" rule isn't text-based, special case to handle first
                if ("contains_selector" == operator) {
                    const dequote = str => str.replace(/^(["'`])(.*)\1$/,'$2');
                    filter_trace(data.id, ` -> Looking for ${NOT}selector: ${rule.condition.text}`);
                    var contains = null;
                    var vcontains = null;
                    var hid_within = null;
                    var condition = rule.condition.text.
                        replace(/:contains\((.+?)\)\s*$/, function(_, m) {
                            contains = dequote(m);
                            return '';
                        }).
                        replace(/:has-visible-text\((.+?)\)\s*$/, function(_, m) {
                            vcontains = dequote(m);
                            return '';
                        }).
                        replace(/:hidden-within\((.+?)\)\s*$/, function(_, m) {
                            hid_within = dequote(m) + ' *';
                            return '';
                        });
                    var found = false;
                    var selector_matches = [];
                    try {
                        selector_matches = post.find(condition).filter(
                            // Ignore matches in the comment area
                            function() {
                                return X(this).parents('.commentable_item').length == 0;
                            }
                        );
                    } catch(e) {
                        filter_trace(data.id, ' -----> Selector lookup failed:');
                        filter_trace(data.id, ' -----> ' + e);
                    }

                    if (selector_matches.length > 0) {
                        if (contains || vcontains) {
                            regex = new RegExp(contains || vcontains);
                            selector_matches.each(function() {
                                results = (contains ? X(this).innerText() : X.getNodeVisibleText(this)).match(regex);
                                if (results) {
                                    found = true;
                                    filter_trace(data.id, " ---> Matched Text: '" + RegExp.lastMatch + "'");
                                }
                                data.regex_match = results;
                                return !found;  // stop .each() when found
                            });
                        } else if (hid_within) {
                            selector_matches.each(function() {
                                X(this).parents(hid_within).each(function() {
                                    // Should this check for anything else -- font size 0, etc.?
                                    if (X(this).css('display') == 'none') {
                                        found = true;
                                    }
                                    return !found;  // stop inner .each() when found
                                });
                                return !found;  // stop outer .each() when found
                            });
                            filter_trace(data.id, ` ---> ${found ? '':'not'} found hidden within`);
                        } else {
                            found = true;
                        }
                    }

                    if ( (found && !not) || (!found && not) ) {
                        match = true;
                    }
                    filter_trace(data.id, ` ---> ${match ? 'match!' : 'no match'}`);
                }
                else if ("day"==rule.target) {
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    var dayList = dayNames.filter((name, dow) => rule.condition['day_' + dow]).join(', ');
                    filter_trace(data.id, ` -> Looking for day(s) of week: ${dayList}`);
                    var dow = (new Date()).getDay();
                    if (rule.condition["day_"+dow]) {
                        match = true;
                    }
                    filter_trace(data.id, ` ---> Day of week is ${dayNames[dow]} - ${match ? 'match!' : 'no match'}`);
                }
                else if ("age"==rule.target) {
                    //var post_time = extract_post_data(post, updated_data, 'post_time');
                    filter_trace(data.id, ` -> Looking for post age ${rule.operator} ${rule.condition.value} ${rule.condition.units == 'h' ? 'hours' : 'days'}`);
                    var post_time = (post.find('abbr[data-utime]').first().attr('data-utime') || 0) * X.seconds;
                    if (post_time) {
                        var check = rule.condition.value;
                        if (rule.condition.units=='h') { check *= X.hours; }
                        if (rule.condition.units=='d') { check *= X.days; }
                        var age = X.now() - post_time;
                        if (rule.operator=="gt" && (age>check)) {
                            match = true;
                        }
                        else if (rule.operator=="lt" && (age<check)) {
                            match = true;
                        }
                        filter_trace(data.id, ` ---> Post age is ${age}ms and must be ${rule.operator} ${check}ms - ${match ? 'match!' : 'no match'}`);
                    } else {
                        filter_trace(data.id, ` ---> Can't detect post time stamp - no match`);
                    }
                }
                // The rest are content selector rules
                else {
                    // If the regex has a leading or trailing | it will match everything - prevent that
                    condition_text = fix_regexp_mistakes(rule.condition.text);
                    var target = "";
                    if (rule.target == 'any' || rule.target == 'any+image') {
                        target = extract_post_data(post, updated_data, 'all_content');
                        if (rule.target == 'any+image') {
                            var caption = extract_post_data(post, updated_data, 'image');
                            target = [target, caption].filter(s => !!s).join(' ');
                        }
                    }
                    else {
                        target = extract_post_data(post, updated_data, rule.target);
                    }
                    if (typeof target=="undefined") {
                        if (force_processing) {
                            // Act like target's empty so /^$/ matches successfully
                            filter_trace(data.id, ` ---> Rule target doesn't exist in post: ${rule.target}; no match`);
                            target = null;
                        }
                        else {
                            filter_trace(data.id, ` -----> Rule target doesn't exist (yet): ${rule.target}; defer filtering until later`);
                            abort = true;
                            return;
                        }
                    }
                    regex = null;
                    if (target == null) {
                        match = false;
                    }
                    else if ("equals" == operator) {
                        // xxx is this *meant* to be case-sensitive?
                        regex = new RegExp("^(?:" + condition_text + ")$");
                    }
                    else if ("contains" == operator && rule.match_partial_words) {
                        regex = new RegExp(condition_text, "i");
                    }
                    else if ("contains" == operator) {
                        regex = new RegExp("(?:^|\\b)(?:" + condition_text + ")(?:\\b|$)", "i");
                    }
                    else if ("startswith" == operator) {
                        regex = new RegExp("^(?:" + condition_text + ")", "i");
                    }
                    else if ("endswith" == operator) {
                        regex = new RegExp("(?:" + condition_text + ")$", "i");
                    }
                    else if ("contains_in" == operator) {
                        regex = new RegExp(condition_text.replace(/\|/g, '\\|').replace(/,/g, '|'), 'i');
                    }
                    else if ("in" == operator) {
                        regex = new RegExp('^(?:' + condition_text.replace(/\|/g, '\\|').replace(/,/g, '|') + ')$', 'i');
                    }
                    else if ("matches" == operator) {
                        regex = new RegExp(condition_text, (rule.condition.modifier || ''));
                    }
                    if (regex) {
                        filter_trace(data.id, ` -> Testing ${NOT}RegExp: ${regex.toString()}`);
                        results = regex.exec(target);
                        if (not) {
                            match = (results == null);
                            filter_trace(data.id, match ? ' ---> NOT present (match)' :
                                                          ` ---> Found Text: '${RegExp.lastMatch}' (no match)`);
                        } else {
                            match = (results != null);
                            filter_trace(data.id, match ? ` ---> Matched Text: '${RegExp.lastMatch}'` :
                                                          ' ---> no match');
                        }
                        data.regex_match = results;
                    }
                }
                if (match) {
                    any_match = true;
                }
                else if (all_match) {
                    all_match = false;
                }
            } catch (e) {
                filter_trace(data.id, " -----> ERROR: " + e.message);
            }
        });

        if (abort) {
            return; // undefined
        }

        // Were enough rules satisfied to execute the actions?
        if (!any_match || (filter.match == "ALL" && !all_match)) {
            return false;
        }

        // Filter matched! Execute the actions
        filter.actions.forEach(function (action) {
            apply_action(post, data, updated_data, action, filter);
        });

        // Filter matched
        return true;
    }

// Apply a single filter action to a post
    function apply_action(post, data, updated_data, action, filter) {
        var css_target;
        if ("class" == action.action) {
            css_target = action.selector ? post.find(action.selector) : post;
            filter_trace(data.id, `:ACTION: applying CSS class '${action.content}'`);
            css_target.addClass(action.content);
        }
        else if ("css" == action.action) {
            css_target = action.selector ? post.find(action.selector) : post;
            var rules = action.content.split(/\s*;\s*/);
            filter_trace(data.id, `:ACTION: applying CSS '${action.content}'`);
            rules.forEach(function (rule) {
                var parts = rule.split(/\s*:\s*/);
                if (parts && parts.length > 1) {
                    css_target.css(parts[0], parts[1]);
                }
            });
        }
        else if ("replace" == action.action) {
            filter_trace(data.id, `:ACTION: replacing '${action.find}' with '${action.replace}'`);
            if (typeof updated_data.userContent=="undefined") {
                extract_post_data(post, updated_data, "content");
            }
            if (updated_data.userContent) {
                updated_data.userContent.forEach(function (usercontent) {
                    replaceText(usercontent[0], new RegExp(action.find, "gi"), action.replace);
                });
            }
            if (updated_data.authorContent) {
                updated_data.authorContent.forEach(function (authorcontent) {
                    replaceText(authorcontent[0], new RegExp(action.find, "gi"), action.replace);
                });
            }
        }
        else if ("hide" == action.action) {
            if (never_hide(post)) { return; }
            if (!post.hasClass('sfx_filter_hidden')) {
                post.addClass("sfx_filter_hidden");
                filter_trace(data.id, ':ACTION: hiding post');
                if (action.show_note) {
                    post.prepend(filter_hidden_note(filter, action, post, data, updated_data));
                }
            }
        }
        else if ("move-to-tab" == action.action ||
                 "copy-to-tab" == action.action) {
            var tab_name = regex_replace_vars(action.tab, data.regex_match, post, updated_data);
            if (tab_name.length) {
                filter_trace(data.id, `:ACTION: ${action.action} '${tab_name}'`);
                X.publish(`filter/tab/${action.action.slice(0,4)}`, {"tab": tab_name, "post": post, "data": data});
            }
        }
    }

    function regex_replace_vars(str, matches, post, updated_data) {
        if (typeof str !== 'string') {
            return '';
        }
        return str.replace(/\$(\d+|\{[0-9a-z_:]+\})/g, function(m) {
            var ret_str;
            var param = /* { */ m.replace(/\${?([^}]+)}?/, '$1');
            var max_len = -1;
            if (/:/.test(param)) {
                max_len = param.replace(/.*:/, '');
                param = param.replace(/:.*/, '');
            }
            if (matches && matches[param] != undefined) {
                ret_str = matches[param];
            } else {
                ret_str = extract_post_data(post, updated_data, param);
            }
            ret_str = typeof ret_str === 'string' ? ret_str : '';
            if (max_len != -1) {
                ret_str = ret_str.slice(0, max_len);
            }
            return ret_str;
        });
    }

    function never_hide($post) {
        if ($post.find('a[href*="/socialfixer/"]').length) {
            return true; // Never hide posts from Social Fixer!
        }
        return false;
    }

    function filter_hidden_note(filter, action, post, data, updated_data) {
        var css = action.css || '';
        var note;
        if (action.custom_note) {
            var note_text = regex_replace_vars(action.custom_note, data.regex_match, post, updated_data);
            note = X(`<div class="sfx_filter_hidden_note" style="${css}">${note_text}</div>`);
        }
        else {
            note = X(`<div class="sfx_filter_hidden_note" style="${css}">Post hidden by filter "${filter.title}". Click to toggle post.</div>`);
        }
        note.on('click', function () {
            note.closest('*[sfx_post]').toggleClass('sfx_filter_hidden_show');
        });
        return note;
    }

    // Add actions to the post action tray
    X.publish('post/action/add', {"section": "filter", "label": "Edit Filters", "message": "menu/options", "data": {"section": "Filters"}});
    X.publish('post/action/add', {"section": "filter", "label": "Filter Debugger", "message": "post/action/filter/debug"});
    X.subscribe('post/action/filter/debug', function (msg, data) {
        function stringify_leaf(obj) {
            if (typeof obj === 'function') {
                return '"[function]"';
            }
            try {
                return JSON.stringify(obj, null, 3);
            } catch(err) {
                if (/circular/.test(err)) {
                    return '"[circular]"';
                } else {
                    return `"[ERR: ${err}]"`;
                }
            }
        }
        function stringify_obj(obj) {
            return '{\n    ' + Object.keys(obj)
             .filter(key => obj[key] !== undefined)
             .map(key => `"${key}":${stringify_leaf(obj[key])}`)
             .join(',\n    ') + '\n}';
        }
        var data_content = stringify_obj(sfx_post_data[data.id], null, 3);
        data_content = data_content ? data_content.replace(/\n/g, '<br>') : 'No Data';
        var trace = sfx_filter_trace[data.id];
        var trace_content = 'No Trace';
        if (trace) {
            trace_content = trace.slice(1)
                .map(str => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
                .join('<br>');
        }
        var content = FX.oneLineLtrim(`
            <div>This popup gives details about how this post was processed for filtering.</div>
            <div draggable="false" class="sfx_bubble_note_subtitle">Filtering Trace</div>
            <div draggable="false" class="sfx_bubble_note_data">${trace_content}</div>
            <div draggable="false" class="sfx_bubble_note_subtitle">Raw Extracted Post Data</div>
            <div draggable="false" class="sfx_bubble_note_data">${data_content}</div>
        `);
        bubble_note(content, {"position": "top_right", "title": "Post Filtering Debug", "close": true});
    });
});
