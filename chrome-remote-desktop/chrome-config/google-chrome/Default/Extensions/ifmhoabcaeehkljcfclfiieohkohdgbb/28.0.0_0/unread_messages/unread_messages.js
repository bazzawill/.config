X.ready('unread_filtered_messages', function() {
    FX.add_option('check_unread_filtered_messages', {
        "title": "Check For Filtered Messages"
        , "description": "Facebook hides Messages from people outside your network and doesn't alert you. This feature alerts you if there are any unread messages that Facebook has filtered."
        , "default": true
        , "verified": true
    });
    FX.add_option('check_unread_filtered_messages_alt', {
        "section": "Experiments",
        "title": "Use alternate method to check for filtered messages"
        , "description": "Add this if the check for filtered messages isn't working"
        , "default": false
        , "verified": true
    });
    FX.on_option('check_unread_filtered_messages', function () {
        FX.on_content_loaded(function() {
            const norm = !FX.option('check_unread_filtered_messages_alt');
            const ajax_func = norm ? X.ajax : X.ajax_dom;
            ajax_func("https://mbasic.facebook.com/messages/?folder=other", function (ajax_result) {
                if (typeof ajax_result !== 'string') {
                    return;
                }
                var count = 0;
                if (norm) {  // Parse mbasic CSS & HTML directly
                    // Is the '.some_class { font-weight: bold; }' CSS still there?
                    var bold_matches = ajax_result.match(/\.([a-zA-Z0-9_]+)\s*{[^}]*font-weight[^:]*:[^};]*bold\s*;\s*}/);
                    if (!bold_matches || bold_matches.length < 2) {
                        // Give us a chance to notice, without an obnoxious alert() or whatever
                        X.support_note('unread_filtered_messages', 'class:bold CSS not found');
                        return;
                    }
                    var bold_class = bold_matches[1];
                    // Filtered message subjects display as <h3 class="bb"> (normal) if 'read',
                    // class="ci" (bold) if 'unread'.  Count the '<h3 class="ci">' blocks.
                    // Except 'ci' is sometimes 'cj' or maybe something else?  So now we parse
                    // out the class, first.
                    bold_matches = ajax_result.match(RegExp(`<h3[^>]*class=.[^'"]*\\b${bold_class}\\b`, 'g'));
                    bold_matches && (count = bold_matches.length);
                } else {  // Inject mbasic HTML into the DOM, use getComputedStyle()
                    X('body').append(ajax_result);
                    ajax_result.find('h3 > a[href^="/messages"]').forEach(function (msg) {
                        var fontWeight = getComputedStyle(msg).fontWeight;
                        if (fontWeight && (fontWeight >= 600 || fontWeight == "bold")) {
                            count++;
                        }
                    });
                    ajax_result.remove();
                }
                if (count) {
                    var tooltip = "When you receive Messages from people Facebook doesn't think you know, it filters them and doesn't inform you. Social Fixer adds this notification so you don't miss messages. This feature can be disabled in Options.";

                    X.publish("notify/increment", {"target": "#sfx_badge"});
                    X.publish("menu/add", {"section": "actions", "item": {'html': `<span class="sfx_menu_jewelCount"><span class="count">${count}</span></span><span title="${tooltip}">You have unread hidden Messages</span>`, url: '//m.facebook.com/messages/?folder=other', target: '_blank'}});
                }
            });
        });
    });
});
