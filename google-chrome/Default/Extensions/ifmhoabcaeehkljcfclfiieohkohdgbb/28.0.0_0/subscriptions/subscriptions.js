// Tag each subscribable item with boolean .subscribed indicating whether
// user is subscribed to it
var mark_subscribed_items = function (subscriptions, user_items) {
    // Build up a list of user item id's
    var subscription_ids = {};
    if (user_items && user_items.length) {
        user_items.forEach(function (f) {
            if (f.id) {
                subscription_ids[f.id] = true;
            }
        });
    }
    (subscriptions || []).forEach(function (item) {
        item.subscribed = (!!subscription_ids[item.id]);
    });
};

// Retrieve the JSON list of subscribable items of this type; tag each
// item with boolean .subscribed indicating whether it was found in
// user_items; pass to callback
//
// `name' is used as both filename[.json] and field name in the JSON in
// that file; if they're different, pass in an array containing:
// [ filename, fieldname ]

var retrieve_item_subscriptions = function (name, user_items, callback) {
    var filename = name;
    if (typeof name != "string") {
        filename = name[0];
        name = name[1];
    }
    X.ajax(`https://matt-kruse.github.io/socialfixerdata/${filename}.json`, function (content) {
        if (content && content[name] && content[name].length > 0) {
            // Mark the subscribed ones
            mark_subscribed_items(content[name], user_items);
        }
        if (callback) {
            callback((content && content[name]) ? content[name] : null);
        }
    });
};

// Retrieve the JSON list of subscribable items of this type; update
// user's subscribed items with any changes found in the JSON (except
// .enabled, and a special case for customized filter actions).  If
// anything changed, write back to storage.
//
// `name' is used as both filename[.json] and field name in the JSON in
// that file; if they're different, pass in an array containing:
// [ filename, fieldname ]

var update_subscribed_items = function (name, user_items, callback) {
    retrieve_item_subscriptions(name, user_items, function (subscriptions) {
        if (typeof name != "string") {
            name = name[1];
        }
        var any_dirty = false;
        // Loop through the subscriptions to see if user items need to be updated
        var subscribed = {};
        // This was user_items.forEach(...): but `hiddens' is a non-array object
        for (var key in user_items) {
            // Don't be tricked by prototype properties
            if (!user_items.hasOwnProperty(key)) {
                continue;
            }
            var f = user_items[key];
            if (f.id) {
                subscribed[f.id] = f;
            }
        }
        (subscriptions || []).forEach(function (item) {
            var user_item = subscribed[item.id];
            if (!user_item) {
                return;
            }
            var key, dirty = false;
            // Map the properties of the subscription to the user item
            // Don't overwrite the entire object because things like 'enabled' are stored locally
            for (key in item) {
                if (key == "subscribed" || key == "enabled") {
                    continue;
                }
                // Check to see if the user item data needs updated
                // If user has customized actions, don't over-write, otherwise update
                if (name == 'filters' && key == 'actions' &&
                    item.configurable_actions && user_item.custom_actions) {
                    continue;
                }
                if (name == 'filters' && key == 'stop_on_match') {
                    continue;
                }
                if (JSON.stringify(user_item[key]) != JSON.stringify(item[key])) {
                    user_item[key] = item[key];
                    dirty = true;
                }
            }
            if (dirty) {
                user_item.subscription_last_updated_on = X.now();
                any_dirty = true;
            }
        });
        // if any of the subscriptions were dirty, save the items
        if (any_dirty) {
            X.storage.save(name, X.clone(user_items), function () {
            });
        }
        if (callback) {
            callback(subscriptions);
        }
    });
};
