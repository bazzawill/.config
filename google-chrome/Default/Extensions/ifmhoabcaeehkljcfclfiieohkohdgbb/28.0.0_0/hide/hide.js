// =========================================================
// Hide parts of the page
// =========================================================
X.ready( 'hide', function() {
// Add an Option to trigger the popup in case people don't find it in the wrench menu
    FX.add_option('hide_parts_of_page',
        {
            "section": "General",
            "title": 'Hide Things',
            "description": 'Under the Wrench menu you will find an item to "Hide/Show Parts of the Page". Use this to hide or show different parts of the page that Social Fixer knows how to process. You can also access this functionality using the button to the right.',
            "type": "action",
            "action_message": "options/close,hide/on",
            "action_text": "Hide Things"
        }
    );
    FX.add_option('hide_parts_of_page_custom',
        {
            "section": "Debug",
            "title": 'Custom Hideables',
            "description": 'Define a custom JSON structure to be used instead of the server-side JSON for hideables.',
            "type": "textarea",
            "default":""
        }
    );
    FX.add_option('hide_parts_custom_merge',
        {
            "section": "Debug",
            "title": 'Merge Custom & Standard Hideables',
            "description": "Use both the server-side and custom hideables JSON.",
            "default": false
        }
    );

    FX.on_options_load(function () {
        var menu_item = {"html": 'Hide/Show Parts of the Page', "message": "hide/on", "tooltip": "Select which parts of the page you want to hide so they never show up."};
        X.publish("menu/add", {"section": "actions", "item": menu_item});

        var hiddens = FX.storage('hiddens') || {};
        if (typeof hiddens.length != "undefined") {
            hiddens = {};
        }

        var resolve = function (hideable) {
            var o = X(hideable.selector);
            if (hideable.parent) {
                o = o.closest(hideable.parent);
            }
            return o;
        };

        //  Two ways to hide things:
        // (1) Pure CSS if the hideable has no parent, or
        // (2) by watching for DOM insertions
        var id;
        var css = [], hiddens_with_parents = [];
        var set_css_rules = function () {
            css = [];
            hiddens_with_parents = [];
            for (id in hiddens) {
                var hidden = hiddens[id];
                var o = resolve(hidden);

                // (1)
                if (!hidden.parent) {
                    css.push(`html:not(.sfx_hide_show_all) ${hidden.selector} { display:none !important; }`);
                    o.addClass("sfx_hide_hidden");
                }
                // (2)
                else {
                    hiddens_with_parents.push(hidden);
                }
            }
            if (css.length > 0) {
                var csstext = css.join(' ');
                X.css(csstext, 'sfx_hideables');
            }
        };
        set_css_rules();
        // Watch for DOM insertions and check for things to hide
        FX.on_content(function (o) {
            hiddens_with_parents.forEach(function (hidden) {
                X(hidden.selector, o).closest(hidden.parent).addClass("sfx_hide_hidden");
            });
        });
        // Finishing function.  hide/off is expensive, don't do it on every ESC!
        const hide_show_finish = function() {
            const $ui = X('#sfx_hide_show_ui');
            if ($ui.length) {
                X.publish('hide/off');
                $ui.remove();
            }
        };
        X.subscribe('esc/pressed', hide_show_finish);

        X.subscribe("hide/on", function () {
            // Display the bubble popup

            // Chars used (no HTML entities for these):
            // U+25E4 ◤ (none) BLACK UPPER LEFT TRIANGLE
            // U+25E5 ◥ (none) BLACK UPPER RIGHT TRIANGLE
            // U+25E3 ◣ (none) BLACK LOWER LEFT TRIANGLE
            // U+25E2 ◢ (none) BLACK LOWER RIGHT TRIANGLE
            // Chars not used (mismapped HTML entities; plus, solids look better):
            // U+25F8 ◸ &ultri; UPPER LEFT TRIANGLE
            // U+25F9 ◹ &urtri; UPPER RIGHT TRIANGLE
            // U+25FA ◺ &lltri; LOWER LEFT TRIANGLE
            // U+25FF ◿ (none)  LOWER RIGHT TRIANGLE
            // U+22BF ⊿ &lrtri; RIGHT TRIANGLE (entity mapped to wrong codepoint)

            var content = X(FX.oneLineLtrim(`
                    <div class="sfx_hide_bubble">
                        <span id="sfx_hide_bubble_TL" style="position:absolute; top:0; left:3px; font-size: 15px;" data-hover="tooltip" data-tooltip-content="Move to top left" data-tooltip-delay="650">&#x25E4;</span>
                        <span id="sfx_hide_bubble_TR" style="position:absolute; top:0; right:3px; font-size: 15px;" data-hover="tooltip" data-tooltip-content="Move to top right" data-tooltip-delay="650">&#x25E5;</span>
                        <span id="sfx_hide_bubble_BL" style="position:absolute; bottom:0; left:3px; font-size: 15px;" data-hover="tooltip" data-tooltip-content="Move to bottom left" data-tooltip-delay="650">&#x25E3;</span>
                        <span id="sfx_hide_bubble_BR" style="position:absolute; bottom:0; right:3px; font-size: 15px;" data-hover="tooltip" data-tooltip-content="Move to bottom right" data-tooltip-delay="650">&#x25E2;</span>
                        <div class="sfx_hide_bubble_instructions">Mouse over <span style="background-color:#CFC">green shaded</span> areas to see their names; click to hide them.  (Shaded area may be offset from the item it will hide.)</div>
                        <div class="sfx_hide_bubble_instructions">To unhide items, click 'Show Hidden Items', then click <span style="background-color:#FCC">red shaded</span> areas.</div>
                        <div class="sfx_hide_bubble_instructions">Social Fixer is updated with new hideable areas as Facebook changes. If a new area won't hide, take a screenshot in Hide/Show mode (showing that it won't highlight) and post it in the <a href="https://SocialFixer.com/support/" target="_blank">Support Group</a>.</div>
                        <span><input type="button" class="sfx_button sfx_button_done" style="margin:4px" value="Done Hiding"></span>
                        <span style="float:right">
                            <label data-hover="tooltip" data-tooltip-content="So you can unhide them" data-tooltip-delay="1000"><input type="checkbox" class="sfx_button sfx_button_show">Show Hidden Items</label>
                            <br><label data-hover="tooltip" data-tooltip-content="Shrink this box" data-tooltip-delay="1000"><input type="checkbox" class="sfx_button sfx_button_inst">Hide Instructions</label>
                        </span>
                    </div>
                `));

            var popup = bubble_note(content, {position: 'top_right', style: 'min-height:0', title: 'Hide/Show Parts of the Page', id: 'sfx_hide_show_ui', no_esc: true});
            popup.find('.sfx_button_done').click(hide_show_finish);
            popup.find('.sfx_button_show').click(function (/* event */) {
                X('html').toggleClass('sfx_hide_show_all');
            });
            popup.find('.sfx_button_inst').click(function (/* event */) {
                popup.find('.sfx_hide_bubble_instructions,.sfx_bubble_note_title').toggle();
            });
            popup.find('#sfx_hide_bubble_TL').click(function (/* event */) {
                popup.css({'top': 0, 'bottom': 'auto', 'left': 0, 'right': 'auto'});
            });
            popup.find('#sfx_hide_bubble_TR').click(function (/* event */) {
                popup.css({'top': 0, 'bottom': 'auto', 'left': 'auto', 'right': 0});
            });
            popup.find('#sfx_hide_bubble_BL').click(function (/* event */) {
                popup.css({'top': 'auto', 'bottom': 0, 'left': 0, 'right': 'auto'});
            });
            popup.find('#sfx_hide_bubble_BR').click(function (/* event */) {
                popup.css({'top': 'auto', 'bottom': 0, 'left': 'auto', 'right': 0});
            });

            var hider_title = function (hideable) {
                return `Click to ${hideable.action}:\n\n'${hideable.name}'`;
            };

            var show_hideables = function (hideables, warn_server) {
                if (warn_server) {
                    var json_url = 'https://matt-kruse.github.io/socialfixerdata/hideable.json';
                    popup.find('.sfx_bubble_note_title').append(FX.oneLineLtrim(`
                        <div style="color:red; outline: 2px solid red; margin: 2px; padding: 3px;">
                            Can't access Hide/Show data on:<br>
                            <a href="${json_url}">${json_url}</a><br>
                            Is it blocked by the browser, an extension, or your firewall?
                        </div>`));
                }
                if (!hideables || hideables.length == 0) {
                    return;
                }
                X('html').addClass('sfx_hide_show_all');
                hideables.forEach(function (hideable) {
                    var o = resolve(hideable);
                    for (var instance = 0; instance < o.length; instance++) {
                        var el = o[instance], $el = X(el);
                        var overflow = $el.css('overflow');
                        $el.css('overflow', 'visible'); /* auto */
                        var rect = el.getBoundingClientRect();
                        var h = rect.height;
                        var w = rect.width;
                        if (!h || !w) return;
                        h = Math.max(h, 20);
                        w = Math.max(w, 20);
                        $el.css('overflow', overflow);
                        var hidden = !!hiddens[hideable.id];
                        hideable.name = X.sanitize(hideable.name);
                        hideable.action = hidden ? "Unhide" : "Hide";
                        var position = ($el.css('position') == 'absolute' && $el.parent().css('position') == 'relative') ? 'position:relative;' : '';
                        var wrapper = X(`<span data-hover="tooltip" data-tooltip-content="${hider_title(hideable)}" data-tooltip-delay="200" class="sfx_hide_frame" style="width:${w}px;height:${h}px;font-size:${h / 1.5}px;line-height:${h}px;${position}">X</span>`);

                        if (hidden) {
                            wrapper.addClass("sfx_hide_frame_hidden sfx_hide_hidden");
                        }
                        wrapper.click(function (target) {
                            hidden = !hiddens[hideable.id];
                            hideable.action = hidden ? "Unhide" : "Hide";
                            /* tooltips & wrapper hide classes should be changed for all */
                            /* wrappers for this hider, but ... too much trouble */
                            X(target.target).attr('data-tooltip-content', hider_title(hideable));
                            wrapper.toggleClass("sfx_hide_frame_hidden sfx_hide_hidden", hidden);
                            for (var instance = 0; instance < o.length; instance++) {
                                X(o[instance]).toggleClass("sfx_hide_hidden", hidden);
                            }
                            if (hidden) {
                                hiddens[hideable.id] = hideable;
                            }
                            else {
                                delete hiddens[hideable.id];
                            }
                        });
                        $el.before(wrapper);
                    }
                });
                X('html').removeClass('sfx_hide_show_all');
            };
            var hide_parts_of_page_custom = FX.option('hide_parts_of_page_custom');
            var hide_parts_custom_merge = FX.option('hide_parts_custom_merge');

            var hideables = [];
            if (hide_parts_of_page_custom) {
                try {
                    var json = JSON.parse(hide_parts_of_page_custom);
                    if (json && json.hideables && json.hideables.length) {
                        hideables = json.hideables;
                        if (!hide_parts_custom_merge) {
                            return show_hideables(hideables, false);
                        }
                    }
                } catch(e) {
                    alert("ERROR Parsing custom JSON: "+e.toString());
                }
            }
            // hideable.json contains 'hideables': name[0] = filename, name[1] = struct name
            /* subscriptions.js: */ /* global update_subscribed_items */
            update_subscribed_items(['hideable', 'hideables'], hiddens, function (subscriptions) {
                var warn_server = (!subscriptions || !subscriptions.length);
                (subscriptions || []).forEach(function (server_item) {
                    var already_have = false;
                    hideables.forEach(function (hideable_item) {
                        if (hideable_item.id == server_item.id) {
                            already_have = true;
                        }
                    });
                    if (!already_have) {
                        hideables.push(server_item);
                    }
                });
                show_hideables(hideables, warn_server);
            });
        });

        X.subscribe("hide/off", function () {
            X('html').removeClass('sfx_hide_show_all');
            X('.sfx_hide_frame').remove();
            // Persist hidden areas
            X.storage.save('hiddens', hiddens, function () {
                set_css_rules();
            });
        });
    });
});
