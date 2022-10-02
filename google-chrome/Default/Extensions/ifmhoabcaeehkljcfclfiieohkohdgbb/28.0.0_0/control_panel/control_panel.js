// =====================================
// Control Panel operations
// =====================================
X.ready( 'control_panel', function() {
    FX.add_option('control_panel_x', {"hidden": true, "default": 0});
    FX.add_option('control_panel_y', {"hidden": true, "default": 50});
    FX.add_option('control_panel_right', {"hidden": true, "default": false});
    FX.add_option('control_panel_bottom', {"hidden": true, "default": false});
    FX.add_option('reset_control_panel_position', {"title": ' Control Panel', "section": "Advanced", "description": "Reset the position of the Control Panel to the upper left", "type": "action", "action_text": "Find Control Panel", "action_message": "cp/reset_position"});

    var data;
    var reset = function () {
        X('#sfx_control_panel').remove();
        data = {
            "sections": []
        };
        control_panel_created = false;
    };
    reset();

    const why_cp = function () {
        var msg = '';
        FX.option('show_mark_all_read') && (msg += "- Disable 'Mark All Read / Undo'<br>");
        FX.option(  'always_show_tabs') && (msg += "- Disable 'Always Show Tab List'<br>");
        var filters = FX.storage('filters') || [];
        why_cp.tab_filters = filters.filter(f => f.enabled && f.actions.some(a => /-to-tab/.test(a.action)));
        if (why_cp.tab_filters.length) {
            msg += '- Disable the following filters because their actions move posts to tabs:<br>';
            msg += '<div class="sfx_why_cp_filters">';
            why_cp.tab_filters.forEach(f => (msg += `      ${f.title}<br>`));
            msg += '</div>';
        }
        if (msg) {
            msg += `<div style='float:right'>`;
            msg += `<span class='sfx_button close_cp_yes'>Disable those settings and close Control Panel</span>`;
            msg += `<span class='sfx_button sfx_button_close secondary'>Cancel</span>`;
            msg += `</div>`;
        }
        return msg;
    };
    const close_cp = function () {
        var msg = 'We recommend saving your settings first: wrench > Options > Data > Save To File<br><br>';
        msg += 'Closing the Control Panel will:<br><br>' + why_cp();
        var $dialog = bubble_note(msg,{title:'Closing Social Fixer Control Panel',close:true});
        $dialog.find('.close_cp_yes').click(function() {
            FX.option('show_mark_all_read',false);
            FX.option('always_show_tabs',false);
            why_cp.tab_filters.forEach(f => f.enabled = false);
            X.storage.save('filters',null,function() {
                reset();
                $dialog.find('span.sfx_button').remove();
                var $note = X(FX.oneLineLtrim(`
                    <br><br><div>
                        <span style='color:red;'>
                            Control Panel disabled
                        </span>
                        <span class='sfx_button sfx_close_cp_refresh'>
                            REFRESH THE PAGE
                        </span>
                        immediately to activate the changes!
                    </div>
                `));
                $note.find('.sfx_button').click(() => window.location.reload());
                $dialog.append($note);
            });
        });
    };

    // Reset the position
    X.subscribe("cp/reset_position", function () {
        if (!why_cp()) {
            bubble_note(
                FX.oneLineLtrim(`
                    No options which use the Control Panel are enabled!<br><br>
                    Options which turn on the CP are:<br><br>
                    - General > Mark All Read / Undo<br>
                    - Advanced > Always Show Tab List<br>
                    - Filters which Move or Copy posts to a Social Fixer tab
                `), {title: 'No Control Panel Options enabled', close: true});
        } else if (!data.sections.length) {
            bubble_note(
                FX.oneLineLtrim(`
                    No posts have yet been filtered to a Social Fixer tab.<br>
                    The Control Panel will appear if a post is filtered.<br><br>
                    The following options turn on the CP permanently:<br><br>
                    - General > Mark All Read / Undo<br>
                    - Advanced > Always Show Tab List
                `), {title: 'No posts filtered yet', close: true});
        } else {
            FX.option('control_panel_x', null, false);
            FX.option('control_panel_y', null, false);
            FX.option('control_panel_right', null, false);
            FX.option('control_panel_bottom', null, false);
            X.storage.save("options");
            position_control_panel(null, null, false);
        }
    });

    // Add a SECTION
    X.subscribe("cp/section/add", function (msg, section_data) {
        create_control_panel();
        section_data.order = section_data.order || 999;
        // {"name", "id", "help", "order"}
        data.sections.push(section_data);
    });

    var control_panel_created = false;
    var create_control_panel = function () {
        if (control_panel_created || X.find('#sfx_control_panel')) {
            return;
        }

        // Don't create the control panel on some pages
        if (/\/memories\//.test(location.href) || /\/messages\//.test(location.href)) {
            return;
        }

        control_panel_created = true;

        var html = FX.oneLineLtrim(`<div id="sfx_control_panel">
                <div class="sfx_cp_header" v-tooltip="{icon:false,content:'The Social Fixer Control Panel (CP) may contain filter tabs and controls such as Mark All Read &amp; Undo. Click X to disable associated features and hide it. Drag to move.',delay:750}"><span @click="close_cp" class='sfx_cp_close_button'>X</span>SFX Control Panel</div>
                <div class="sfx_cp_data">
                    <div class="sfx_cp_section" v-for="section in sections | orderBy 'order'">
                        <div class="sfx_cp_section_label" v-tooltip="{content:section.help,position:'right',delay:300}">{{{section.name}}}</div>
                        <div class="sfx_cp_section_content" id="{{section.id}}"></div>
                    </div>
                </div>
            </div>
            `);
        var actions = { close_cp };
        template(document.body, html, data, actions).ready(function () {
            // Position it
            position_control_panel(null, null, false);

            // Make it draggable
            X.draggable('#sfx_control_panel', function (el, x, y) {
                position_control_panel(x, y, true);
            });
        });
    };
    var position_control_panel = function (x, y, save) {
        var $cp = X('#sfx_control_panel');
        if (!$cp.length) {
            return;
        }
        var right = FX.option('control_panel_right');
        var bottom = FX.option('control_panel_bottom');
        var snap_tolerance = 15;
        var reposition = false;
        if (typeof x == "undefined" || x == null || typeof y == "undefined" || y == null) {
            // Re-position it with saved options
            x = +FX.option('control_panel_x');
            y = +FX.option('control_panel_y');
            reposition = true;
        }
        var h = $cp[0].offsetHeight;
        var w = $cp[0].offsetWidth;

        // Constrain it to the screen
        if (x < 1) {
            x = 1;
        }
        if (!reposition) {
            right = (window.innerWidth && x + w > (window.innerWidth - snap_tolerance)); // Off the right side, snap it to the right
        }
        if (y < 40) {
            y = 40;
        }
        if (!reposition) {
            bottom = (window.innerHeight && y + h > (window.innerHeight - snap_tolerance)); // Off the bottom, snap to bottom
        }

        // Position it
        if (right) {
            $cp.css({'right': 0, 'left': ''});
        }
        else {
            $cp.css({'left': x, 'right': ''});
        }
        if (bottom) {
            $cp.css({'bottom': 0, 'top': ''});
        }
        else {
            $cp.css({'top': y, 'bottom': ''});
        }

        // Persist the control panel location
        if (false !== save) {
            FX.option('control_panel_x', x, false);
            FX.option('control_panel_y', y, false);
            FX.option('control_panel_right', right, false);
            FX.option('control_panel_bottom', bottom, false);
            X.storage.save("options");
        }
    };
    // On window resize, make sure control panel is on the screen
    X(window).resize(function () {
        position_control_panel();
    });
    FX.on_options_load(function () {
        if (FX.option('always_show_control_panel')) {
            FX.on_page_load(function () {
                create_control_panel();
            });
        }
    });

    // If options are updated from another tab, move the control panel
    X.subscribe("storage/refresh", function (msg, data) {
        if ("options" == data.key) {
            position_control_panel(null, null, false);
        }
    });

    // When the page unloads to navigate, remove the control panel
    FX.on_page_unload(reset);
});
