// Comment Navigator for 2020 New Layout
//
// This is significantly better at expanding comments, and has a better
// user interface including realtime abort.
//
// However, it entirely lacks the 'highlight comments newer than' feature,
// as FB have made comment timestamps impossible to work with.

X.ready('comment_navigator_nl', function() {
    const title = 'Comment Navigator';
    FX.add_option('navigator_order', {title, description: "Try to set comment order to (e.g. 'All' or 'New')", type: 'text', default: ''});
    FX.add_option('navigator_watch', {title, description: 'Follow Comment Navigator while expanding', default: false});
    X.publish('post/action/add', {section: 'wrench', label: 'Expand Comments', order: 10, message: 'post/action/expand'});
    X.subscribe('post/action/expand', (msg, data) => expand_post(data.id));

    // A freshly displayed post may have no comments visible, just a '123 Comments' button
    var comment_exposer_selector = [
        '[role=button][aria-expanded=false]>.b1v8xokw',
    ].join(',');

    // Once comments are displayed, some posts have a widget to select comment
    // order, like 'All Comments', 'Most Recent', or 'Top Comments'
    var order_widget_selector = [
        '[role=button].nc684nl6 .bp9cbjyn.sf5mxxl7',
    ].join(',');

    // Parent node which includes the name of the current sort order
    var order_widget_parent = [
        '[role=button]',
    ].join(',');

    // Differentiate individual menu items within the order widget
    var order_menuitem_selector = [
        '[role=menu] [role=menuitem] .oo9gr5id',
    ].join(',');

    // Count comments currently displayed (info only)
    var comment_selector = [
        '[role=article]',
    ].join(',');

    // The main event!  These are the various buttons which will fully expand a post.
    var expander_selector = [
        '[dir=auto]>.f1sip0of[role=button]:not(.gs1a9yip)',  // 'See More' on post/comment/reply
        ':not(.j9ispegn)+[role=button].m9osqain>span>[dir]', // 'N [more] comments/replies'
    ].join(',');

    var expand_start_time = {};
    var stop_expanding;
    var stop_expanding_fn = function() {
        stop_expanding && X('[id^=sfx_expanding_]').parent().remove();
        stop_expanding = true;
    };
    X.subscribe('esc/pressed', stop_expanding_fn);

    var progress = function(id, message) {
        var $popup = X(`#sfx_expanding_${id}`);
        const delta_t = ((performance.now() - expand_start_time[id]) / X.seconds).toFixed(3);
        message = message.replace(/[ ><\n\r\t]+/g, ' ');
        $popup.scrollingAppend(`<br><span>${delta_t} ${message}</span>`);
        X.publish('log/postdata', {id, message});
        // console.log(id, delta_t, message);
    };

    var display_expand = function(id) {
        expand_start_time[id] = performance.now();
        const content = X(FX.oneLineLtrim(`
            <h2>ESC to stop expanding</h2>
            <div id='sfx_expanding_${id}' class='sfx_expander_ui'></div>
        `));
        const title = `Social Fixer — Expanding comments of post ${id}`;
        // Handle our own ESC processing: 1st ESC stops expanding, 2nd ESC closes window
        return bubble_note(content, {title, position:'top_right', no_esc:true});
    };

    var stop_now = function(id) {
        stop_expanding && progress(id, 'ESC pressed, stopping comment expansion.');
        return stop_expanding;
    };

    var expose_comments = async function(id, $post) {
        var $comment_exposer = $post.find(comment_exposer_selector);
        if (!$comment_exposer.length) {
            progress(id, 'Post does not need comments exposed');
            return;
        } else {
            progress(id, 'Exposing post comments');
            $comment_exposer.click();
            await X.sleep(0.5);
        }
    };

    var choose_order = async function(id, $post) {
        var order_request = FX.option('navigator_order').trim();
        if (!order_request) {
            progress(id, 'No specific comment order is requested.');
            return;
        }
        var order_regexp = new RegExp(order_request, 'i');
        var $order_menu = $post.find(order_widget_selector).closest(order_widget_parent);
        if (stop_now(id)) return;
        if (!$order_menu.length) {
            progress(id, 'No comment order menu found');
            return;
        }
        if ($order_menu[0].innerText.match(order_regexp)) {
            progress(id, `Order '${$order_menu[0].innerText}' already matches '${order_request}'`);
            return;
        }
        $order_menu.click();
        if (stop_now(id)) return;
        // Wait for menu to be open
        await X.sleep(0.5);
        if (stop_now(id)) return;
        var clicked = false;
        X(order_menuitem_selector).forEach(function(menuitem) {
            if (menuitem.innerText.match(order_regexp)) {
                progress(id, `Menu item '${menuitem.innerText}' matches '${order_request}', clicking`);
                menuitem.click();
                clicked = true;
            } else {
                progress(id, `Menu item '${menuitem.innerText}' does not match '${order_request}', skipping`);
            }
        });
        if (!clicked || stop_now(id)) return;
        // Wait for comments to be reloaded in the new order
        await X.sleep(1.0);
    };

    var comment_count = function($post) {
        return $post.find(comment_selector).length;
    };

    var expand_comments = async function(id, $post) {
        var keep_going = true;
        var cycle_delay = 1;
        var expand_cycle = 0;
        var cycle_counts = [];
        const max_flails = 5;
        while (keep_going) {
            keep_going = false;
            var n_comments = comment_count($post);
            ++expand_cycle;
            cycle_counts[expand_cycle] = n_comments;
            if (cycle_counts[expand_cycle - max_flails] == n_comments) {
                progress(id, `cycle ${expand_cycle}, no comments exposed in ${max_flails} cycles, stopping`);
                break;
            }
            var expanders = $post.find(expander_selector);
            progress(id, `cycle ${expand_cycle}, expanding: ${expanders.length} (${n_comments} comments visible)`);
            var expand_count = 0;
            for (var expander of expanders.toArray()) {
                if (stop_now(id)) {
                    keep_going = false;
                    return;
                }
                if (expander.getRootNode() == document) {
                    keep_going = true;
                    if (FX.option('navigator_watch')) {
                        X(expander).addClass('sfx_clicked');
                        expander.scrollIntoView(false);
                    }
                    progress(id, `clicking '${expander.innerText}'`);
                    X(expander).click();
                    await X.sleep(0.1);
                    ++expand_count;
                    if (expand_count % 5 == 0) {
                        progress(id, `(${comment_count($post)} comments visible)`);
                    }
                }
            }
            await X.sleep(0.5);
            // Go slower if nothing is happening; '50 more comments' takes a while, no point in hammering.
            if (keep_going && n_comments == comment_count($post)) {
                await X.sleep(cycle_delay);
                cycle_delay = Math.min(cycle_delay + 1, 8);
            }
        }
    };

    var expand_post = async function(id) {
        const $post = X(`[id='${id}']`);
        stop_expanding = false;
        const $popup = display_expand(id);
        await expose_comments(id, $post);
        await choose_order(id, $post);
        await expand_comments(id, $post);
        progress(id, 'Done!  ESC to close, or auto-close in 15 seconds.');
        stop_expanding = true;
        if (FX.option('navigator_watch')) {
            $post.find('.sfx_clicked').removeClass('sfx_clicked');
            $post[0].scrollIntoView(true);
            setTimeout(() => window.scrollBy(0, -150));
        }
        await X.sleep(15);
        $popup.remove();
        delete expand_start_time[id];
    };
});
