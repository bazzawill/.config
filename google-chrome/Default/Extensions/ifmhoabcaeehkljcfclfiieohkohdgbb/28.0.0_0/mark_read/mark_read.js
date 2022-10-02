// =========================================================
// Add Post Action Icons, including Mark Read
// =========================================================
X.ready( 'mark_read', function() {
    FX.add_option('post_actions', {"title": 'Post Actions', "description": "Add actions to individual posts to Mark them as 'Read', etc.", "default": true});
    FX.add_option('show_mark_all_read', {"title": 'Mark All Read/Undo', "description": "Add a Mark All Read button and Undo button to the control panel to Mark all visible posts as 'Read' or undo Marking posts as 'Read'.", "default": false});
    FX.add_option('mark_all_read_next', {"section": "Advanced", "title": 'Mark All Read - Next', "description": "When Mark All Read is clicked and filter tabs are visible, automatically jump to the next tab with unread stories.", "default": true});
    FX.add_option('clear_cache', {"title": 'Clear "Mark Read" Story Data', "section": "Advanced", "description": "Clear all cached data about posts' 'Read' status. This will un-Mark all 'Read' posts!", "type": "action", "action_text": "Clear Data Now", "action_message": "cache/clear"});
    FX.add_option('clean_cache_frequency', {"title": '"Mark Read" Cache Cleaning Frequency', "section": "Advanced", "description": "Clean the cache of old story data every how many hours?", "type": "number", "default": 24});
    FX.add_option('clean_cache_age', {"title": '"Mark Read" Cache Cleaning Age', "section": "Advanced", "description": "When cleaning cached story data, clean post data that is this many days old.", "type": "number", "default": 4});
    FX.add_option('hide_mark_read_groups', {"title": 'Mark Read', "description": "Hide posts marked as 'Read' when viewing a Group.", "default": true});
    FX.add_option('hide_mark_read_pages', {"title": 'Mark Read', "description": "Hide posts marked as 'Read' when viewing a Page or Timeline.", "default": true});
    FX.add_option('mark_read_display_message', {"title": 'Mark Read', "description": "Display a small post timestamp where posts Marked as 'Read' and hidden would have been.", "default": true});
    FX.add_option('mark_read_style', {"section": "Advanced", "title": 'Mark Read Style', "description": "CSS style to be applied to posts that are Marked 'Read'.", "type": "text", "default": "outline:2px dashed red;"});

    (function () {
        var postdata_log = {}; // Keyed by DOM id!
        X.subscribe("log/postdata", function (msg, data) {
            var id = data.id ? data.id : data.$post ? `sfx_post_${data.$post.attr('sfx_post')}` : null;
            if (!id) {
                return;
            }
            if (!postdata_log[id] || !postdata_log[id][0]) {
                postdata_log[id] = [performance.now()];
            }
            postdata_log[id].push(((performance.now() - postdata_log[id][0]) / X.seconds).toFixed(6) + ' ' + data.message);
        });
        X.subscribe("log/postdata/get", function (msg, data) {
            if (typeof data.callback != "function") {
                return;
            }
            data.callback(postdata_log[data.id]);
        });
    })();

    // Clear Cache
    X.subscribe("cache/clear", function (/* msg, data */) {
        X.storage.save("postdata", {}, function () {
            alert("Social Fixer cache has been cleared");
        });
    });
    FX.on_options_load(function () {
        if (!FX.option('post_actions')) {
            return;
        }

        // Write out CSS based on "mark read" style
        var mark_read_style = FX.option('mark_read_style');
        FX.css(`
        .sfx_post_read > *:not(.sfx_post_marked_read_note),
        #facebook #pagelet_soft_permalink_posts .sfx_post_read > *,
        #facebook[sfx_context_permalink="true"] .sfx_post_read > * {
            ${mark_read_style};
        }
        `);

        // Add an option to the wrench menu to toggle stories marked as read
        var menu_item = {"html": "Show posts marked 'Read'", "message": "post/toggle_read_posts", "tooltip": "If posts are Marked as 'Read' and hidden, toggle their visibility."};
        X.publish("menu/add", {"section": "actions", "item": menu_item});

        var show_read = false;
        X.subscribe("post/toggle_read_posts", function () {
            show_read = !show_read;
            menu_item.html = show_read ? "Hide posts Marked 'Read'" : "Show posts Marked 'Read'";
            X('html').toggleClass("sfx_show_read_posts", show_read);
            FX.reflow();
        });

        // Logic to handle post actions
        var postdata = FX.storage('postdata') || {};

        // post_id can be all digits or colon-separated digits like "12345:2"
        var legit_post_id = (post_id) => /^[0-9:]+$/.test(post_id);

        // read_on is a date stamp: must be just digits
        // (could also check for plausible time range?)
        var legit_read_on = (post_id) => /^[0-9]+$/.test(post_id);

        // On a regular interval, clean out the postdata cache of old post data
        // Also do other data cleansing tasks here
        var clean_cache_frequency = FX.option('clean_cache_frequency') || +FX.options['clean_cache_frequency']['default'] || 24;
        var clean_cache_age = FX.option('clean_cache_age') || +FX.options['clean_cache_age']['default'] || 7;
        X.task('clean_postdata_cache', clean_cache_frequency * X.hours, function () {
            var post_id, cleaned_count = 0;
            if (!postdata) {
                return;
            }
            for (post_id in postdata) {
                var data = postdata[post_id];
                var read_on = data.read_on;
                var age = X.now() - read_on;
                var clean_me = 0;
                // Purge old items
                if (age > clean_cache_age * X.days) {
                    clean_me = 1;
                }
                if (!legit_post_id(post_id)) {
                    clean_me = 1;
                }
                if (!legit_read_on(data.read_on)) {
                    clean_me = 1;
                }
                // Left over from 742eb642d241b4521a79139a5146dc3205a3c83b
                if (data.last_updated) {
                    delete postdata[post_id].last_updated;
                    cleaned_count++;
                }
                if (clean_me) {
                    delete postdata[post_id];
                    cleaned_count++;
                }
            }
            // Save the postdata back to storage
            if (cleaned_count > 0) {
                X.storage.save("postdata", postdata);
            }
        });

        var init_postdata = function (id) {
            if (typeof postdata[id] == "undefined") {
                postdata[id] = {};
            }
            return postdata[id];
        };

        var mark_all_added = false;
        FX.on_page_unload(function () {
            mark_all_added = false;
        });

        FX.on_content_loaded(function () {
            var action_data = {
                id: null,
                sfx_id: null,
                $post: null,
                read: false,
                show_mark_read: true,
                filters_enabled: FX.option('filters_enabled'),
                wrench_items: [],
                filter_items: []
            };
            var actions = {
                "mark_unmark": function (e) {
                    var data = {"sfx_id": action_data.sfx_id};
                    data.dir = e.shiftKey ? "above"
                             : e.ctrlKey || e.altKey || e.metaKey ? "below"
                             : "post";
                    X.publish("post/mark_unmark", data);
                }
                , "action_menu_click": function (item) {
                    var key, data = {"id": action_data.id, "sfx_id": action_data.sfx_id};
                    if (item.data) {
                        for (key in item.data) {
                            data[key] = item.data[key];
                        }
                    }
                    X.publish(item.message, data);
                }
            };
            var Ctrl = (/Macintosh|Mac OS X/.test(sfx_user_agent)) ? 'Command' : 'Ctrl';
            var html = FX.oneLineLtrim(`
                <div id="sfx_post_action_tray">
                    <div v-if="show_mark_read && !read" @click="mark_unmark($event)" class="mark_read_markit" v-tooltip="Social Fixer: Mark this post as 'Read', so it doesn't appear in your feed anymore. Shift+Click Marks as 'Read' all posts above here; ${Ctrl}+Click Marks here and below."></div>
                    <div v-if="read" @click="mark_unmark($event)" v-tooltip="Social Fixer: Un-Mark this post as 'Read', so it may show up in your feed again.">X</div>
                    <div v-if="!show_mark_read && !read" @click="mark_unmark($event)" class="mark_read_nomark" v-tooltip="Social Fixer: Marking this post 'Read' will only hide it in the current session, as it lacks a unique Facebook identifier. Posts like this may be Markable in the future."></div>
                    <div v-if="wrench_items.length>0" id="sfx_mark_read_wrench" class="mark_read_wrench" v-tooltip="Social Fixer: Post Actions"></div>
                    <div v-if="filters_enabled && filter_items.length>0" id="sfx_mark_read_filter" class="mark_read_filter" v-tooltip="Social Fixer: Filtering"></div>
                </div>
                <div v-if="wrench_items.length>0" id="sfx_post_wrench_menu" class="sfx_post_action_menu">
                    <div v-for="item in wrench_items | orderBy 'order'" @click="action_menu_click(item)">{{item.label}}</div>
                </div>
                <div v-if="filter_items.length>0" id="sfx_post_filter_menu" class="sfx_post_action_menu">
                    <div v-for="item in filter_items | orderBy 'order'" @click="action_menu_click(item)">{{item.label}}</div>
                </div>
            `);

            var undo = {
                posts_marked_read: []
                , undo_disabled: true
            };
            var hide_read = function ($post) {
                if (!$post.hasClass('sfx_post_read')) {
                    if (FX.context.type == "groups" && !FX.option('hide_mark_read_groups')) {
                        return;
                    }
                    if (FX.context.type == "profile" && !FX.option('hide_mark_read_pages')) {
                        return;
                    }
                    if (FX.option('mark_read_display_message')) {
                        var ts = $post.find('h4 a, h2 a').first();
                        ts = ts.length ? ts.text() : '<unknown>';
                        ts = `Click to view 'Read' post by ${ts}`;
                        var note = X(`<div class="sfx_post_marked_read_note" title="This post was hidden because it was previously Marked as 'Read'. Click to view. (To remove these post markers, see Options > General > Mark Read)">${ts}</div>`);
                        note.on('click', function () {
                            var new_shown = note.parent().toggleClass('sfx_post_read_show').hasClass('sfx_post_read_show');
                            note.text(note.text().replace(/hide|view/, new_shown ? 'hide' : 'view'));
                        });
                        $post.prepend(note);
                    }
                    $post.addClass('sfx_post_read');
                    X.publish("post/hide_read", {"id": $post.attr('id'), "$post": $post});
                }
            };
            var unhide_read = function ($post) {
                if ($post.hasClass('sfx_post_read')) {
                    $post.removeClass('sfx_post_read sfx_post_read_show');
                    $post.find('.sfx_post_marked_read_note').remove();
                    X.publish("post/unhide_read", {"id": $post.attr('id'), "$post": $post});
                }
            };
            // Mark Read/Unread controllers
            X.subscribe("post/mark_unread", function (msg, data) {
                var sfx_id = data.sfx_id;
                var $post = data.post || action_data.$post;

                undo.posts_marked_read = [$post];
                undo.mark = true;
                undo.undo_disabled = false;

                if (legit_post_id(sfx_id)) {
                    var pdata = postdata[sfx_id];
                    delete pdata.read_on;
                    X.storage.set("postdata", sfx_id, pdata);
                }
                update_action_tray($post);
                X.publish('log/postdata', {$post, message: `Marking Post ID=${sfx_id} unread`});
                unhide_read($post);
            });
            X.subscribe("post/mark_read", function (msg, data) {
                var sfx_id = data.sfx_id;
                var $post = data.post || action_data.$post;

                undo.posts_marked_read = [$post];
                undo.mark = false;
                undo.undo_disabled = false;

                if (legit_post_id(sfx_id)) {
                    var pdata = init_postdata(sfx_id);
                    pdata.read_on = X.now();
                    postdata[sfx_id] = pdata;
                    X.storage.set("postdata", sfx_id, pdata);
                    X.publish('log/postdata', {$post, message: `Marking Post ID=${sfx_id} read on ${pdata.read_on}`});
                } else {
                    X.publish('log/postdata', {$post, message: `Marking Post ID=${sfx_id} temporarily read`});
                }
                update_action_tray($post);
                hide_read($post);
                FX.reflow();
            });
            X.subscribe(["post/mark_all_read", "post/mark_unmark"], function (msg, data) {
                if (typeof data.dir == "undefined") {
                    data.dir = "all";
                }
                var $curr_post = data.post || action_data.$post;
                var mark = (data.dir == "all") || !$curr_post || !$curr_post.hasClass('sfx_post_read');
                if (data.dir == "post") {
                    X.publish(mark ? "post/mark_read" : "post/mark_unread", data);
                    return;
                }
                var marked = 0;
                var not_marked = 0;
                var marking = (data.dir == "all" || data.dir == "above");
                var unmark_one = false;
                var posts = [];
                var pivot_post = $curr_post ? +$curr_post.attr('sfx_post') : null;
                if ($curr_post && data.dir == "above") {
                    // Any existing selection gets extended by shift-click,
                    // then distorted by hiding & reflow; just abolish it:
                    window.getSelection().removeAllRanges();
                    // and get the post we were on back onscreen:
                    setTimeout(function () {
                        $curr_post[0].scrollIntoView();
                    }, 0.15 * X.seconds);
                }
                X(`*[sfx_post]`).each(function () {
                    var $post = X(this);
                    var this_post = +$post.attr('sfx_post');
                    if (this_post == pivot_post) {
                        if (data.dir == "above") {
                            // Mark Read Above excludes the current post
                            marking = false;
                            // Must be on a 'Read' post to invoke Unmark,
                            // so it *includes* current post
                            if (!mark) {
                                unmark_one = true;
                            }
                        }
                        else if (data.dir == "below") {
                            // Mark Read Below includes the current post
                            marking = true;
                        }
                    }
                    if (!marking && !unmark_one) {
                        not_marked++;
                        return;
                    }
                    unmark_one = false;

                    // css('display') != 'none' is being used here as a
                    // proxy for 'is in the currently displayed SFx tab'.
                    // Unfortunately this also makes us skip if the post
                    // was hidden by FB's client de-duplicator; or by an
                    // ad blocker.  Exactly what to do is a bit subtle:
                    //
                    // (1) the question we should be asking is not 'is this
                    // displayed?' but 'is this in the current SFx tab?'
                    //
                    // (2) if it was hidden by the FB de-duplicator, it
                    // should be the case that the contents of the two posts
                    // were identical, therefore would have been filtered
                    // into the same tab by SFx filtering.  During this scan,
                    // we should be able to notice that a post which was
                    // previously counted as 'unread' is now counted as
                    // 'read', so that we can update the tab (unread / total)
                    // counts properly; without actually issuing a 2nd 'mark'
                    // operation.  This is currently blocked by the 'is it
                    // displayed' test, since FB's de-duplicator works by
                    // hiding (with '.hidden_elem') the duplicates.
                    //
                    // (3) posts may also be hidden by other actors, for
                    // instance an ad blocker.  These could do several
                    // things, including at least:
                    //
                    //   (a) actually deleting it from the DOM
                    //   (b) hiding it with the ad blocker's own class
                    //   (c) hiding it with FB's 'hidden_elem' class
                    //   (d) hiding it with explicit inline 'style='
                    //
                    // I don't think we can do anything sensible about (a).
                    // (c) implies that we shouldn't mark 'Read' any ID
                    // marked '.hidden_elem'.  That is: if the ID appears
                    // twice, only once with '.hidden_elem', that's an FB
                    // de-duplicator action and we naturally mark 'Read' the
                    // one which wasn't hidden.  But if the ID appears only
                    // once, it's probably an ad blocker's notation.  The
                    // user has not, in fact, 'Read' (seen at all) this post.
                    // We should not mark its ID.  Nevermind that the user
                    // probably wants that post *gone*.  If they were to turn
                    // off their ad blocker immediately after; and if their
                    // SFx config is to put Sponsored posts into a tab, not
                    // hide them completely -- they *should* see an unread
                    // copy of that ad in their Sponsored tab.
                    //
                    // (4) We currently have no cross-module way to ask 'is
                    // this in the specified tab'.  But my rewrite of the tab
                    // handler makes this easy; so I need to get that cleaned
                    // up and checked in.

                    if ("none" != $post.css('display') && mark == !$post.hasClass('sfx_post_read')) {
                        posts.push($post);
                        var pub_msg = mark ? "post/mark_read" : "post/mark_unread";
                        var pub_data = {
                            sfx_id: $post.attr('sfx_id'),
                            save: false, // Don't persist until the end
                            post: $post
                        };
                        X.publish(pub_msg, pub_data);
                        marked++;
                    }
                });
                if (marked > 0) {
                    X.storage.save("postdata");
                    undo.posts_marked_read = posts;
                    undo.mark = !mark;
                    undo.undo_disabled = false;
                    FX.reflow(data.dir == "above" && !show_read);
                }
                if (mark && not_marked == 0 && FX.option('mark_all_read_next')) {
                    X.publish("filter/tab/next");
                }
            });
            X.subscribe("post/undo_mark_read", function (/* msg, data */) {
                if (undo.posts_marked_read.length > 0) {
                    var undo_msg = undo.mark ? "post/mark_read" : "post/mark_unread";
                    undo.posts_marked_read.forEach(function ($post) {
                        var sfx_id = $post.attr('sfx_id');
                        X.publish(undo_msg, {"sfx_id": sfx_id, "save": false, "post": $post});
                    });
                    X.storage.save("postdata");
                    undo.posts_marked_read = [];
                    undo.undo_disabled = true;
                    FX.reflow();
                }
                else {
                    alert("Nothing to Undo!");
                }
            });

            var add_post_action_tray = function () {
                if (document.getElementById('sfx_post_action_tray') == null) {
                    template(document.body, html, action_data, actions);
                    X('#sfx_mark_read_wrench').click(function (ev) {
                        X('#sfx_post_filter_menu').hide();
                        X('#sfx_post_wrench_menu')
                            .css('left', ev.pageX + 'px')
                            .css('top', ev.pageY + 'px')
                            .toggle()
                        ;
                        ev.stopPropagation();
                    });
                    X('#sfx_mark_read_filter').click(function (ev) {
                        X('#sfx_post_wrench_menu').hide();
                        X('#sfx_post_filter_menu')
                            .css('left', ev.pageX + 'px')
                            .css('top', ev.pageY + 'px')
                            .toggle()
                        ;
                        ev.stopPropagation();
                    });
                }
            };

            X(window).click(function () {
                X('#sfx_post_filter_menu, #sfx_post_wrench_menu').hide();
            });

            var move_action_tray_to_post = function ($post) {
                action_data.$post = $post;
                action_data.id = $post.attr('id');
                const sfx_id = $post.attr('sfx_id');
                action_data.sfx_id = sfx_id;
                action_data.read = (legit_post_id(sfx_id) && postdata[sfx_id] && postdata[sfx_id].read_on);
                action_data.show_mark_read = legit_post_id(sfx_id);
                add_post_action_tray();
                // Appending to the post's top level sometimes ends up mis-placed;
                // its child works better, but we must skip the first child which
                // we may add ('post is hidden'), as it makes PAI act weird.
                var $append_to = $post.children();
                if ($append_to.length > 1 && /(^| )sfx_/.test($append_to.first().prop('class'))) {
                    $append_to = X($append_to[1]);
                }
                $append_to.append(document.getElementById('sfx_post_action_tray'));
            };

            // Change action tray checkmark-vs-X & tooltip
            // when the state of the post it's on changes.
            var update_action_tray = function ($post) {
                if (action_data.$post && action_data.$post[0].id != $post[0].id) {
                    return;
                }
                move_action_tray_to_post($post);
            };

            X.subscribe("post/resolve-id", function (msg, data) {
                const $post = X(data.selector);
                const sfx_id = data.sfx_id;
                // If it's already read, hide it
                if (legit_post_id(sfx_id) && postdata[sfx_id] && postdata[sfx_id].read_on) {
                    X.publish('log/postdata', {$post, message: `Post ID=${sfx_id} was read on ${postdata[sfx_id].read_on}`});
                    hide_read($post);
                }
                // Tray has the wrong checkmark if moused over before ID resolved
                update_action_tray($post);
            });

            X.subscribe(["post/add", "post/update"], function (msg, data) {
                if (msg == "post/add") {
                    var post = X(data.selector);
                    // Add the "Mark All Read" button to the control panel if necessary
                    if (!mark_all_added && FX.option('show_mark_all_read')) {
                        mark_all_added = true;
                        X.publish("cp/section/add", {
                            "name": "Post Controller"
                            , "order": 10
                            , "id": "sfx_cp_post_controller"
                            , "help": "Act on all visible posts at once"
                        });
                        // Wait until that has been rendered before attaching to it
                        Vue.nextTick(function () {
                            // The content container will have been created by now
                            var html = FX.oneLineLtrim(`
                                <div class="sfx_cp_mark_all_read" style="text-align:center;">
                                    <input type="button" class="sfx_button" value="Mark All Read" @click="mark_all_read">
                                    <input type="button" class="sfx_button" v-bind:disabled="undo_disabled" value="Undo ({{posts_marked_read.length}})" @click="undo_mark_read">
                                </div>`);
                            var methods = {
                                "mark_all_read": function () {
                                    X.publish("post/mark_all_read");
                                },
                                "undo_mark_read": function () {
                                    X.publish("post/undo_mark_read");
                                }
                            };
                            template('#sfx_cp_post_controller', html, undo, methods);
                        });
                    }

                    // When the mouse moves over the post, add the post action tray
                    post.on('mouseenter', function (e) {
                        // Don't add it if it's already present.
                        // Also allow user control: adding PAI can be slow with
                        // many posts loaded.
                        // Not Shift- or Ctrl- as those are mark-all-above/below
                        // and might well be pressed 'on descent into' a post's
                        // prospective PAI.
                        if (e.altKey || e.metaKey || e.sfx_event || action_data.$post == post) {
                            return;
                        }
                        move_action_tray_to_post(post);
                    });
                }
            }, true);

            X.subscribe("post/action/add", function (msg, data) {
                if (data.section == "wrench") {
                    action_data.wrench_items.push(data);
                }
                else if (data.section == "filter") {
                    action_data.filter_items.push(data);
                }
            }, true);

            X.publish('post/action/add', {"section": "wrench", "label": "Post Data", order: 40, "message": "post/action/postdata"});
            X.subscribe('post/action/postdata', function (msg, data) {
                var log = [];
                X.publish("log/postdata/get", {
                    "id": data.id, "callback": function (pdata) {
                        log = pdata;
                    }
                });
                log = log.slice(1).join('<br>');
                var data_content = JSON.stringify(postdata[data.sfx_id] || {}, null, 3);
                var content = FX.oneLineLtrim(`
                    <div draggable="false">
                        <div>This popup shows what Social Fixer remembers about this post.</div>
                        <div class="sfx_bubble_note_data">Post ID: ${data.sfx_id}<br>DOM ID: ${data.id}</div>
                        <div>Data stored for this post:</div>
                        <div class="sfx_bubble_note_data">${data_content}</div>
                        <div>Processing Log:</div>
                        <div class="sfx_bubble_note_data">${log}</div>
                    </div>
                `);
                // Remove the previous one, if it exists
                X('#sfx_post_data_bubble').remove();
                bubble_note(content, {"position": "top_right", "title": "Post Data", "id": "sfx_post_data_bubble", "close": true});
            });
        });
    });
});
