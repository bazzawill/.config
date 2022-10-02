X.ready('friend_manager', function() {
    FX.add_option('friend_tracker', {"title": 'Friend Manager', "description": "Enable Friend Manager (Friends List Tracker)", "default": true});

    FX.add_option('friend_tracker_alert_unfriend', {"hidden":true, "default": true});
    FX.add_option('friend_tracker_alert_unfriend_count', {"hidden":true, "default": 3});
    FX.add_option('friend_tracker_alert_refriend', {"hidden":true, "default": true});
    FX.add_option('friend_tracker_alert_name_change', {"hidden":true, "default": true});
    FX.add_option('friend_tracker_update_frequency', {"hidden":true, "default": 1 });

    var log = X.logger('post_processor');

    // Load the friends pref
    var friends = X.clone(FX.storage('friends'));
    var custom_fields = FX.option('friend_custom_fields');

    X.subscribe("friends/options", function(msg,d) {
        // Render the friends dialog content
        var sections = [
            {"key":"alerts", "name":"Alerts"}
            ,{"key":"options", "name":"Options"}
            ,{"key":"list", "name":"Friends List"}
            ,{"key":"details", "name":"Friend Details"}
            ,{"key":"data", "name":"Raw Data"}
        ];
        var dialog = FX.oneLineLtrim(`<div id="sfx_friend_dialog" class="sfx_dialog sfx-flex-column" style="transition: height .01s;">
	<div id="sfx_options_dialog_header" class="sfx_dialog_title_bar" style="cursor:move;" @click="collapse" v-tooltip="{content:'Click to window-shade, drag to move',position:'below'}">
		Friend Manager - Social Fixer ${sfx_version}
		<div id="sfx_options_dialog_actions" draggable="false" >
			<input draggable="false" type="button" class="sfx_button secondary" @click.stop="close" value="Close">
		</div>
	</div>
	<div id="sfx_options_dialog_body" class="sfx-flex-row" draggable="false">
		<div id="sfx_options_dialog_sections">
			<div v-for="section in sections" @click="select_section(section.key)" class="sfx_options_dialog_section {{selected_section==section.key?'selected':''}}">{{section.name}}</div>
		</div>
		<div id="sfx_options_dialog_content">
			<div class="sfx_options_dialog_content_section">
				<div v-show="selected_section=='options'" style="line-height:32px;">
					<div><sfx-checkbox key="friend_tracker_alert_unfriend"></sfx-checkbox> Track and alert when someone is not present on my Facebook Friends List</div>
					<div>Alert about absent friends after this many absences: <input class="sfx_input" type="number" min="1" max="99" v-model="uf_count" @change="update_uf_count()"/></div>
					<div><sfx-checkbox key="friend_tracker_alert_refriend"></sfx-checkbox> Track and alert when someone reappears on my Facebook Friends List</div>
					<div><sfx-checkbox key="friend_tracker_alert_name_change"></sfx-checkbox> Track and alert when a friend changes their name</div>
					<div>Check for Friends List changes after this many hours: <input class="sfx_input" type="number" min="1" max="999" v-model="frequency" @change="update_frequency()"/></div>
					<div>Update my Friends List and check for changes immediately: <input type="button" @click="check_now()" class="sfx_button" value="Check Now"></div>
				</div>
				<div v-show="selected_section=='alerts'" id="sfx_friend_alerts"></div>
				<div v-show="selected_section=='list'">
					<div v-if="!list_loaded">Loading...</div>
					<div v-if="list_loaded">
						<div style="margin-bottom:3px;">
                            <b>Filter: </b><input class="sfx_input" type="text" v-model="filter">
                            <br>
                            <span v-if="limit < 9999 && nfriends > nlimit">
                                <b>Page: </b>
                                <a @click.prevent="set_page(-1)" class="sfx_link">&lt;&lt;</a>
                                &nbsp;{{page+1}} of {{Math.trunc((nfriends + nlimit - 1) / nlimit)}}&nbsp;
                                <a @click.prevent="set_page(1)" class="sfx_link">&gt;&gt;</a>
                            </span>
                            <span v-else>
                                Showing all {{nfriends}} friends.
                            </span>
                            <b>&nbsp; Friends per page: </b>
                            &middot;&nbsp;
                            <template v-for="value in ['10','50','100','250','500','1000','all']">
                                <a @click.prevent="set_limit(value)" class="sfx_link" v-bind:class="{'sfx_button':(value==limit)}">{{value}}</a> &middot;&nbsp;
                            </template>
                        </div>
						<table class="sfx_data_table">
							<thead>
								<tr>
									<th>&nbsp;</th>
									<th class="sortable" @click="order('name')">Name</th>
									<th class="sortable" @click="order('first')">First</th>
									<th class="sortable" @click="order('last')">Last</th>
									<th class="sortable" @click="order('id')">ID</th>
									<th class="sortable" @click="order('tracker.status')">Status</th>
									<th v-for="field in custom_fields">{{field}}</th>
									<th class="sortable" @click="order('tracker.added_on')">Added</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="f in friends | filterBy filter | orderBy orderkey sortorder | limitBy nlimit (page*nlimit)">
									<td @click="select_user(f.id)"><img src="{{f.photo}}" style="height:48px;width:48px;"></td>
									<td class="sfx_hover_link" style="font-weight:bold;" @click="select_user(f.id)">{{f.name}}</td>
									<td>{{f.first}}</td>
									<td>{{f.last}}</td>
									<td><a href="https://www.facebook.com/{{f.id}}">{{f.id}}</a></td>
									<td>{{f.tracker.status}}</td>
									<td v-for="field in custom_fields">{{f.data[field]}}</td>
									<td>{{f.tracker.added_on | date}}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div v-show="selected_section=='details'">
					<div v-if="!selected_user">
						Click on a friend in the "List" section.
					</div>
					<div v-else>
						<a href="https://www.facebook.com/{{selected_user.id}}"><img src="{{selected_user.photo}}" style="float:left;margin-right:20px;"><span style="font-size:120%;font-weight:bold;">{{selected_user.name}}</span></a>
						<br style="clear:both;">

						This section will be used for future functionality that will enhance your Friends List even more!

						<!--
						<b>Custom Fields</b> : Fields below are created by you and maintained in the Options tab. You can define any fields, and any value in those fields per user.
						<div v-for="field in custom_fields" style="margin:10px;border:1px solid #ccc;padding:10px;">
							<b>{{field}}</b>: <input v-model="selected_user.data[field]">
						</div>
						-->
					</div>
				</div>
				<div v-show="selected_section=='data'" style="white-space:pre;font-family:monospace;">{{friends | json}}</div>
			</div>
		</div>
	</div>
</div>
`);
        var data = {
            "sections": sections
            ,"selected_section":"alerts"
            ,"friends": friends
            ,"nfriends": Object.keys(friends).length
            ,"list_loaded":false
            ,"orderkey":"name"
            ,"sortorder":1
            ,"filter":""
            ,"selected_user":null
            ,"custom_fields":X.clone(custom_fields)
            ,"frequency":FX.option("friend_tracker_update_frequency")
            ,"uf_count":FX.option("friend_tracker_alert_unfriend_count")
            ,"limit":50
            ,"nlimit":50
            ,"page":0
        };
        if (d&&d.selected) {
            data.selected_section=d.selected;
        }
        // Count friends

        var actions = {
            "select_section": function (key) {
                this.selected_section = key;
                var self = this;
                if (key == "list") {
                    // Lazy load the list for better performance
                    setTimeout(function() {
                        Vue.nextTick(function () {
                            self.list_loaded = true;
                        });
                    }, 100);
                }
            },
            "select_user": function(id) {
                this.selected_user = friends[id];
                this.select_section('details');
            },
            "order": function(key) {
                this.sortorder = (this.orderkey == key) ? -1 * this.sortorder : 1;
                this.orderkey = key;
            },
            "close": function() {
                X('#sfx_friend_dialog').remove();
            },
            "check_now": function() {
                X.publish("friends/update");
            },
            "update_frequency": function () {
                FX.option('friend_tracker_update_frequency', data.frequency, true);
            },
            "update_uf_count": function () {
                FX.option('friend_tracker_alert_unfriend_count', data.uf_count, true);
            },
            "set_limit": function(l) {
                this.limit = l;
                this.nlimit = l == 'all' ? 9999 : Number(l);
                this.page = 0;
            },
            "set_page": function(p) {
                this.page += p;
                if (this.page < 0) {
                    this.page = 0;
                }
            },
            "collapse": function () {
                X('#sfx_options_dialog_body').toggle();
            },
        };
        template(document.body, dialog, data, actions).ready(function () {
            X.draggable('#sfx_friend_dialog');
            Vue.nextTick(function() {
                var alerts = find_alerts(friends);
                render_alerts(alerts, "just now", true, X('#sfx_friend_alerts'), 'sfx_friend_changes_fm');
                if (!alerts || alerts.length == 0) {
                    actions.select_section("list");
                }
            });
        });
    });

    var fb_dtsg;
    X.subscribe('fb_dtsg/ready', (msg, data) => {
        fb_dtsg = data.fb_dtsg;
        var fb_dtsg_status = 'succeeded';
        if (fb_dtsg === 'failed') {
            fb_dtsg_status = 'failed';
        }
        X.support_note('fb_dtsg', `${data.technique} ${fb_dtsg_status} after ${(performance.now() / X.seconds).toFixed(6)} seconds`);
    }, true);

    var retrieve_friends = function(cb) {
        // This request now requires the anti-CSRF token
        if (!fb_dtsg) {
            log('retrieve_friends 0: no fb_dtsg');
            X.support_note('retrieve_friends:0', `fb_dtsg not found: [${fb_dtsg}]`);
            return cb(null);
        }
        var friends_url = FX.oneLineLtrim(`
            https://www.facebook.com/ajax/typeahead/first_degree.php
            ?viewer=${X.userid}
            &__user=${X.userid}
            &filter[0]=user
            &options[0]=friends_only
            &__a=1
            &lazy=0
            &t=${X.now()}
            &fb_dtsg=${fb_dtsg}
        `);
        X.ajax(friends_url, function(content) {
            if (typeof content !== 'string') {
                log('retrieve_friends: unexpected content type:', typeof content, content);
                X.support_note('retrieve_friends:1', `unexpected content type '${typeof content}' (see console)`);
                return cb(null);
            }
            try {
                var json = JSON.parse(content.replace(/^[^{}]*/, ''));
                if (!json || !json.payload || !json.payload.entries) {
                    log('retrieve_friends: unexpected JSON content:', json);
                    X.support_note('retrieve_friends:2', 'unexpected JSON content (see console)');
                    return cb(null);
                }
                return cb(json.payload.entries);
            } catch(e) {
                log('retrieve_friends: JSON.parse failed:', e, content);
                X.support_note('retrieve_friends:3', `JSON.parse failed: ${e} (see console)`);
                return cb(null);
            }
        });
    };

    var update_friends = function(cb) {

        // Retrieve Friends List
        var now = X.now();
        var empties = 0;
        var changes = 0;
        retrieve_friends(function(list) {
            if (list == null) {
                return cb(null);
            }

            var i, f, uid, sfx_friend;
            // For each friend, create the default record if needed
            for (i = 0; i < list.length; i++) {
                f = list[i];
                uid = f.uid;
                if (!Number(uid)) {
                    X.support_note('update_friends:1', 'non-numeric UID in FB data');
                    continue;
                }
                sfx_friend = friends[uid];
                if (typeof sfx_friend == "undefined" || typeof sfx_friend.tracker == "undefined") {
                    sfx_friend = {
                        "id":f.uid
                        ,"name":f.text
                        ,"first":f.firstname
                        ,"last":f.lastname
                        ,"photo":f.photo
                        ,"tracker": {
                            "added_on":now
                            ,"status":"friend"
                            ,"updated_on":now
                            ,"acknowledged_on":null
                        }
                    };
                    friends[uid] = sfx_friend;
                }
                // check for updated photo and name
                if (f.text != sfx_friend.name) {
                    sfx_friend.old_name = sfx_friend.name;
                    sfx_friend.name = f.text;
                    sfx_friend.first = f.firstname;
                    sfx_friend.last = f.lastname;
                    sfx_friend.dirty = true;
                }
                if (sfx_friend.photo != f.photo) {
                    sfx_friend.dirty = true;
                    sfx_friend.photo = f.photo;
                }
                sfx_friend.checked_on = now;
                sfx_friend.tracker.missing_count = 0;
            }

            // Loop over friends to check for changes
            for (uid in friends) {
                // Handle strange records due to some past bug
                if (!Number(uid)) {
                    X.support_note('update_friends:2', 'non-numeric UID in FT data');
                    delete friends[uid];
                    X.storage.set("friends", uid, undefined, null, false);
                    //++changes;
                    continue;
                }

                f = friends[uid];

                // Handle empty records due to some past bug
                if (!f.id || !f.tracker) {
                    ++empties;
                    f.id = uid;
                    f.tracker = f.tracker || {
                        added_on: now,
                        status: 'record missing',
                        updated_on: now,
                        acknowledged_on: null,
                    };
                    f.dirty = true;
                }
                var tracker = f.tracker;

                // NEW Friend
                if (tracker.added_on == now) {
                    f.dirty = true;
                }

                // RE-FRIENDED
                else if (now == f.checked_on && tracker.status != "friend") {
                    tracker.status = "refriend";
                    tracker.updated_on = now;
                    tracker.acknowledged_on = null;
                    f.dirty = true;
                }

                // REMOVED Friend
                // (Not found in new list, but they existed in old list)
                else if (now !== f.checked_on && (tracker.status == "friend" || tracker.status == "refriend")) {
                    tracker.missing_count = (tracker.missing_count) ? tracker.missing_count + 1 : 1;
                    if (tracker.missing_count >= FX.option('friend_tracker_alert_unfriend_count')) {
                        tracker.status = "unfriended";
                        tracker.updated_on = now;
                        tracker.acknowledged_on = null;
                        tracker.blocked = null;
                    }
                    f.dirty = true;
                }

                // Update this friend record?
                if (f.dirty) {
                    ++changes;
                    delete f.dirty;
                    X.storage.set("friends", uid, f, null, false);
                }
            }

            // Persist the updated Friends List
            if (changes) {
                X.storage.save("friends", null, function () {
                    if (typeof cb == "function") {
                        cb({"total":Object.keys(friends).length, "changes":changes});
                    }
                });
            } else {
                if (typeof cb == "function") {
                    cb({"total":Object.keys(friends).length, "changes":changes});
                }
            }
            X.support_note('update_friends:3', `fr:${Object.keys(friends).length} ls:${list.length} ch:${changes} em:${empties}`);
        });
    };

    var find_alerts = function(friends) {
        var alerts = [];

        for (var i in friends) {
            var f = X.clone(friends[i]);
            if (!f || !f.tracker) {
                continue;
            }
            var t = f.tracker;
            var upd = t.updated_on;
            var ack = t.acknowledged_on;

            // Unfriend
            if (FX.option('friend_tracker_alert_unfriend') && t.status == "unfriended" && (!ack || ack < upd)) {
                alerts.push({"type": "unfriend", "friend": f});
                // Fire off an ajax request to see if this person's account is still there?

                // REMOVED this check because it may fire off too many requests
                /*
                (function(friend_ref) {
                    X.ajax("https://mbasic.facebook.com/" + friend_ref.id, function(content, status) {
                        if (status == 404) {
                            friend_ref.removed = true;
                        } else if (typeof content == 'string') {
                            // Failed lookup has no instances of the user ID; but
                            // they might add a retry link, so look for a handful.
                            var instances = content.match(new RegExp(friend_ref.id + '', 'g'));
                            if (!instances || instances.length < 4) {
                                friend_ref.removed = true;
                            }
                        }
                    });
                })(f);

                 */
                // TODO: Check if blocked?
            }
            // Re-friend
            if (FX.option('friend_tracker_alert_refriend') && t.status == "refriend") {
                alerts.push({"type": "refriend", "friend": f});
            }
            // name change
            if (FX.option('friend_tracker_alert_name_change') && f.old_name) {
                alerts.push({"type": "name_change", "friend": f});
            }
        }
        return alerts;
    };

    var update_jewel_count = function(alerts) {
        if (!alerts) {
            return;
        }
        var count = alerts.length;
        var el = document.getElementById('sfx_friend_jewel_count');
        if (el) {
            if (count == 0) {
                X(el).remove();
            }
            else {
                X(el).find('span').text(count);
            }
        }
    };

    var notify_if_alerts_exist = function() {
        var alerts = find_alerts(friends);
        if (alerts && alerts.length > 0) {
            X.publish("notify/increment", {"target": "#sfx_badge"});

            // Remove the old Friend Manager link in wrench menu and replace with a new one
            X.publish("menu/remove", {"section": "options", "item": {message:"friends/options"}});
            X.publish("menu/add", {"section": "options", "item": {'html': `<span class="sfx_menu_jewelCount"><span class="count" id="sfx_friend_jewel_count">${alerts.length}</span></span><span>Friend Manager</span>`, message:"friends/options"}});
        }
    };

    var render_alerts = function(alerts, ago, show_header, $prependTo, id) {
        if (typeof render_alerts.vue_data !== 'object') {
            render_alerts.vue_data = {};
        }
        try {
            if (render_alerts.vue_data[id] && X.find(`#${id}`)) {
                Object.keys(render_alerts.vue_data).forEach(function(id) {
                    render_alerts.vue_data[id].alerts = alerts;
                    render_alerts.vue_data[id].ago = ago;
                });
                return;
            }
            X(`#${id}`).remove();
            var data = {
                "alerts": alerts
                ,"ago": ago
                ,"show_header": show_header
            };
            render_alerts.vue_data[id] = data;
            var t = FX.oneLineLtrim(`<div id="${id}">
    <div style="max-height:300px;overflow:auto;border-bottom:1px solid rgb(221,223,226);">
	<div v-if="show_header" style="padding:8px 12px 6px 12px;border-bottom:1px solid rgb(221,223,226);">
		<div style="float:right">
			<a @click.prevent="settings">Settings</a>
			<span v-if="alerts && alerts.length" role="presentation" class="f_click"> &middot; </span>
			<a v-if="alerts && alerts.length" @click.prevent="ok_all" style="font-weight:bold;">Okay All</a>
		</div>
		<div><span style="font-size:12px;font-weight:bold;">Friend Changes</span> <span style="font-size:11px;font-style:italic;">(via Social Fixer, updated {{ago}})</span></div>
	</div>
	<div v-if="alerts && alerts.length" v-for="a in alerts | orderBy 'friend.tracker.updated_on' -1" style="padding:6px 12px;border-bottom:1px solid rgb(221,223,226);">
		<div style="float:right;height:50px;vertical-align:middle;line-height:50px;">
			<span @click="ok(a)" class="sfx_button light">Okay</span>
		</div>
		<img src="{{a.friend.photo}}" style="height:48px;margin-right:10px;display:inline-block;">
		<div style="display:inline-block;height:50px;overflow:hidden;">
			<template v-if="a.type=='name_change'">
				{{a.friend.old_name}}<br>
				is now known as<br>
				<a href="/{{a.friend.id}}" style="font-weight:bold;">{{a.friend.name}}</a><br>
			</template>
			<template v-if="a.type=='unfriend'">
				<a href="/{{a.friend.id}}" style="font-weight:bold;">{{a.friend.name}}</a><br>
				no longer appears on your Facebook Friends List. <span v-show="a.friend.removed" style="color:red;text-decoration:underline;cursor:help;" v-tooltip="This account is not available. This person has either disabled or removed their account, blocked you, or this is a result of a Facebook glitch (which is not uncommon). If they are still your friend but their profile is temporarily unavailable, they will appear as re-friended when it returns.">Account Not Found!</span><br>
				<i>{{a.friend.tracker.updated_on | ago}}</i>
			</template>
			<template v-if="a.type=='refriend'">
				<a href="/{{a.friend.id}}" style="font-weight:bold;">{{a.friend.name}}</a><br>
				is now on your Facebook Friends List again! <br>
				<i>{{a.friend.tracker.updated_on | ago}}</i>
			</template>
		</div>
	</div>
	<div v-if="!alerts || alerts.length==0" style="line-height:50px;vertical-align:middle;color:rgb(117,117,117);background-color:rgb(246,247,249);text-align:center;">
		No changes
	</div>
    </div>
</div>
`);
            var actions = {
                "ok": function(a) {
                    var f = friends[a.friend.id];
                    // Resolve based on the type of the alert
                    if (a.type == "unfriend") {
                        f.tracker.acknowledged_on = X.now();
                    }
                    else if (a.type == "refriend") {
                        f.tracker.status = "friend";
                    }
                    else if (a.type == "name_change") {
                        delete f.old_name;
                    }
                    // Update and persist
                    X.storage.set("friends", f.id, f, function () {
                        // Remove the alert
                        var i = data.alerts.indexOf(a);
                        data.alerts.splice(i, 1);
                        update_jewel_count(data.alerts);
                    });
                }
                ,"ok_all": function () {
                    for (var a in alerts) {
                        actions.ok(alerts[a]);
                    }
                }
                ,"settings": function () {
                    X.publish("friends/options", {"selected": "options"});
                }
            };
            var $v = template(null, t, data, actions);
            $prependTo.prepend($v.fragment);
        } catch (e) {
            alert(e);
        }
    };

    FX.on_options_load(function() {
        if (FX.option('friend_tracker')) {
        // Add wrench menu item
            X.publish("menu/add", {"section": "options", "item": {'html': '<span id="sfx_friend_manager_menu_item">Friend Manager</span>', 'message': 'friends/options'}});

            // Update Friends List and check for changes
            X.task('friend_update', FX.option('friend_tracker_update_frequency') * X.hours, function () {
                log("Time to check for Friends List changes");
                X.subscribe('fb_dtsg/ready', function () {
                    update_friends(notify_if_alerts_exist);
                }, true);
            }, notify_if_alerts_exist);

            X.subscribe('friends/update', function () {
                update_friends(function (result) {
                    notify_if_alerts_exist();
                    if (result===null) {
                        alert("Error retrieving or updating friends list");
                    }
                    else {
                        alert(`Update Complete.\n${result.total} friends and ${result.changes} changes.`);
                    }
                });
            });
        }
    });
});
