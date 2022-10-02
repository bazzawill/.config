// =====================================
// Post Filter: Move/Copy To Tab
// =====================================
X.ready('post_tabs', function() {
    FX.add_option('always_show_tabs', {
        "section": "Advanced"
        , "title": "Always Show Tab List"
        , "description": "Always show the list of Tabs in the Control Panel, even if no posts have been moved to tabs yet."
        , "default": false
    });
    var $tab_vm = null, tab_data, all_posts, unfiltered_posts, processed_posts, tab_list_added;
    var reset = function () {
        tab_data = {
            "post_count": 0,
            "post_count_read": 0,
            "filtered_count": 0,
            "filtered_count_read": 0,
            "tabs": {},
            "selected_tab": null,
            "show_all": false
        };
        all_posts = {};
        unfiltered_posts = {};
        processed_posts = {};
        tab_list_added = false;
    };
    reset();
    FX.on_page_unload(reset);
// When a post is hidden because it was 'read', update tab counts
    X.subscribe("post/hide_read", function (msg, data) {
        var id = data.id, key;
        // Look for this post in all the tabs to increase the "read count"
        for (key in tab_data.tabs) {
            if (typeof tab_data.tabs[key].posts[id] != "undefined") {
                // This post exists in this tab
                tab_data.tabs[key].read_count++;
            }
        }
        if (typeof unfiltered_posts[id] != "undefined") {
            tab_data.filtered_count_read++;
        }
        if (typeof all_posts[id] != "undefined") {
            tab_data.post_count_read++;
        }
    });
// When a post is unhidden because it was 'unread', update tab counts
    X.subscribe("post/unhide_read", function (msg, data) {
        var id = data.id, key;
        // Look for this post in all the tabs to decrease the "read count"
        for (key in tab_data.tabs) {
            if (typeof tab_data.tabs[key].posts[id] != "undefined") {
                // This post exists in this tab
                tab_data.tabs[key].read_count--;
            }
        }
        if (typeof unfiltered_posts[id] != "undefined") {
            tab_data.filtered_count_read--;
        }
        if (typeof all_posts[id] != "undefined") {
            tab_data.post_count_read--;
        }
    });
    var remove_post_from_other_tabs = function (dom_id, is_read) {
        // Look for this post in all the tabs
        var key;
        for (key in tab_data.tabs) {
            if (typeof tab_data.tabs[key].posts[dom_id] != "undefined") {
                // This post exists in this tab
                delete tab_data.tabs[key].posts[dom_id];
                //tab_data.tabs[key].read_count -= (is_read?1:0);
                tab_data.tabs[key].post_count--;
            }
        }
        if (typeof unfiltered_posts[dom_id] != "undefined") {
            delete unfiltered_posts[dom_id];
            tab_data.filtered_count--;
            tab_data.filtered_count_read -= (is_read ? 1 : 0);
        }
    };
// Move to the next tab in the list
    X.subscribe("filter/tab/next", function (/* msg, data */) {
        if (!$tab_vm) {
            return;
        }
        // Get the list of tab names, in order
        var keys = Object.keys(tab_data.tabs).sort();
        for (var i = 0; i < keys.length - 1; i++) {
            if (tab_data.tabs[keys[i]].selected) {
                for (var j = i + 1; j < keys.length; j++) {
                    if (tab_data.tabs[keys[j]].read_count < tab_data.tabs[keys[j]].post_count) {
                        $tab_vm.select_tab(tab_data.tabs[keys[j]]);
                        return;
                    }
                }
                return;
            }
        }
    });
    var create_tab_container_dom = function () {
        if (tab_list_added || X.find('#sfx_cp_filter_tabs')) {
            return;
        }
        tab_list_added = true;
        X.publish("cp/section/add", {
            "name": 'Filter Tabs <span class="sfx_count">(unread / total)</span>'
            , "id": "sfx_cp_filter_tabs"
            , "order": 50
            , "help": "The Filtered Feed shows the filtered view of the feed, with posts removed that have been moved to tabs.\n\nThe All Posts view shows every post in the feed, even if it has been filtered to a tab."
        });
        var html = FX.oneLineLtrim(`
            <div class="sfx_cp_tabs" style="max-height:60vh;overflow:auto;">
                <div v-bind:class="{'sfx_tab_selected':(show_all&&!selected_tab),'sfx_tab_occupied':(post_count>post_count_read)}" class="sfx_filter_tab" @click="select_all()">
                    All Posts&#32;
                    <span class="sfx_count">
                        (
                        <span class="sfx_unread_count" v-if="post_count_read>0">
                            {{post_count-post_count_read}}/
                        </span>
                        {{post_count}})
                    </span>
                </div>
                <div v-if="post_count!=filtered_count" v-bind:class="{'sfx_tab_selected':(!show_all&&!selected_tab),'sfx_tab_occupied':(filtered_count>filtered_count_read)}" class="sfx_filter_tab" @click="select_filtered()">
                    Filtered Feed&#32;
                    <span class="sfx_count">
                        (
                        <span class="sfx_unread_count" v-if="filtered_count_read>0">
                            {{filtered_count-filtered_count_read}}/
                        </span>
                        {{filtered_count}})
                    </span>
                </div>
                <div v-for="tab in tabs | orderBy 'name'" class="sfx_filter_tab" v-bind:class="{'sfx_tab_selected':tab.selected,'sfx_tab_occupied':(tab.post_count>tab.read_count)}" @click="select_tab(tab)">
                    {{tab.name}}&#32;
                    <span class="sfx_count">
                        (
                        <span class="sfx_unread_count" v-if="tab.read_count>0">
                            {{tab.post_count-tab.read_count}}/
                        </span>
                        {{tab.post_count}})
                    </span>
                </div>
            </div>
        `);
        var methods = {
            "select_tab": function (tab) {
                if (tab_data.selected_tab) {
                    tab_data.selected_tab.selected = false;
                }
                tab_data.selected_tab = tab;
                tab.selected = true;
                X(`*[sfx_post]`).each(function () {
                    var $post = X(this);
                    if (typeof tab.posts[$post.attr('id')] != "undefined") {
                        $post.removeClass('sfx_filter_tab_hidden');
                    }
                    else {
                        $post.addClass('sfx_filter_tab_hidden');
                    }
                });
                FX.reflow(true);
            },
            "select_all": function () {
                if (this.selected_tab) {
                    this.selected_tab.selected = false;
                }
                this.selected_tab = null;
                this.show_all = true;
                X(`*[sfx_post]`).each(function () {
                    X(this).removeClass('sfx_filter_tab_hidden');
                });
                FX.reflow(true);
            },
            "select_filtered": function () {
                if (this.selected_tab) {
                    this.selected_tab.selected = false;
                }
                this.selected_tab = null;
                this.show_all = false;

                X(`*[sfx_post]`).each(function () {
                    var $post = X(this);
                    if (typeof unfiltered_posts[$post.attr('id')] != "undefined") {
                        $post.removeClass('sfx_filter_tab_hidden');
                    }
                    else {
                        $post.addClass('sfx_filter_tab_hidden');
                    }
                });
                FX.reflow(true);
            }
        };
        // Wait until the section is added before adding the content
        Vue.nextTick(function () {
            var v = template('#sfx_cp_filter_tabs', html, tab_data, methods);
            $tab_vm = v.$view; // The Vue instance, to access the $set method below
        });
    };
    var create_tab_container = function (tablist) {
        create_tab_container_dom();
        if (tablist) {
            X.when('#sfx_cp_filter_tabs', function () {
                tablist.forEach(function (t) {
                    create_tab(t);
                });
            });
        }
    };

// When the page first loads, show the tab container if tab filters are defined or `always_show_tabs'
    FX.on_options_load(function () {
        var always = FX.option('always_show_tabs');
        var show_cp = always;
        var tabs = [];
        var tab_list_added = false;
        // Only show tab list if we're filtering & there are actual tabbing filters; or `always_show_tabs'
        // XXX should be sensitive to filters_enabled_pages, filters_enabled_groups, and support groups?
        if (!FX.context.permalink) {
            if (always && FX.option('filters_enabled')) {
                (FX.storage('filters') || []).forEach(function (filter) {
                    if (!filter.enabled) {
                        return;
                    }
                    (filter.actions || []).forEach(function (action) {
                        if ((action.action == "copy-to-tab" || action.action == "move-to-tab") && !action.tab.match(/\$(\d+|\{[0-9a-z_:]+\})/)) {
                            tabs.push(action.tab);
                            show_cp = true;
                        }
                    });
                });
            }
            if (show_cp) {
                X.subscribe("post/add", function () {
                    if (!tab_list_added) {
                        create_tab_container(tabs);
                        tab_list_added = true;
                    }
                });
                FX.on_page_unload(function () {
                    tab_list_added = false;
                });
            }
         }
    });

    var create_tab = function (tabname) {
        if (!tab_data.tabs[tabname]) {
            Vue.set(tab_data.tabs, tabname, {"name": tabname, "posts": {}, "selected": false, "post_count": 0, "read_count": 0});
        }
    };

    var add_to_tab = function (tabname, dom_id, post, copy) {
        create_tab(tabname);

        var is_read = post.hasClass('sfx_post_read') ? 1 : 0;
        // If moving, first remove the post from other tabs
        if (!copy) {
            remove_post_from_other_tabs(dom_id, is_read);
        }

        // Add the post to the new tab
        Vue.set(tab_data.tabs[tabname].posts, dom_id, {});

        tab_data.tabs[tabname].post_count++;
        // If this post has already been marked as read, increment the read_count now, because it won't be ticked later
        tab_data.tabs[tabname].read_count += is_read;

        // Show or Hide the post depending on what we are looking at now and where it should go
        if (tab_data.show_all || (tab_data.selected_tab && tab_data.selected_tab.name == tabname)) {
            post.removeClass('sfx_filter_tab_hidden');
        } else if (!copy) {
            post.addClass('sfx_filter_tab_hidden');
        }
    };
    X.subscribe(["filter/tab/move", "filter/tab/copy"], function (msg, data) {
        try {
            var dom_id = data.data.dom_id;
            var tab_name = data.tab;
            var key = dom_id + dom_id + "/" + tab_name;
            // Check to see if post has already been processed to this tab, to avoid double-processing
            if (typeof processed_posts[key] == "undefined") {
                processed_posts[key] = true;
                create_tab_container();
                Vue.nextTick(function () {
                    add_to_tab(tab_name, dom_id, data.post, msg == "filter/tab/copy");
                });
            }
        } catch (e) {
            alert(e);
        }
    });
// When new posts are added, if a tab is selected, hide them so the filter can decide whether to show them
    X.subscribe("post/add", function (msg, data) {
        tab_data.post_count++;
        if (tab_data.selected_tab) {
            X(data.selector).addClass('sfx_filter_tab_hidden');
        }
        tab_data.filtered_count++;
        all_posts[data.id] = {};
        unfiltered_posts[data.id] = {};
    });
});
