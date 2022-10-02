X.ready('post_processor', async function() {
    var post_selector = '*[role="article"]';
    var log = X.logger('post_processor');

    //var sfx_post_selector = '*[sfx_post]';
    var sfx_post_id = 1;
    var max_posts = 50;
    var post_count = 0;
    var $first_post;
    // var pager_selector = [
    //     '*[data-testid="fbfeed_placeholder_story"] ~ a', /* News Feed */
    //     '[id^=timeline_pager_container]',                /* Timeline */
    //     '[id*=_see_more_unit]',                          /* Page home, Page posts */
    //     '#pagelet_group_pager',                          /* Group */
    // ].join(',');

    FX.add_option('max_post_load_count', {"section": "Advanced", "title": 'Post Auto-Loading', "description": 'How many posts should be allowed to load before being paused.', "type": "text", "default": max_posts});
    // When options are loaded and whenever 'max_post_load_count' is set, update the max posts value
    FX.on_option_live('max_post_load_count', function(val) {
        max_posts = val || max_posts;
    });

    // When the page is first loaded, scan it for posts that exist as part of the static content
    // and also watch for new nodes to be scalled
    FX.on_content_loaded(function () {
        // Find and handle inserted posts
        FX.on_content_inserted(function (o) {
            // If the inserted node lives within a <form> then it's in
            // the reaction part of the post, we don't need to re-process
            if (o.is('form') || o.closest('form').length) {
                return;
            }
            find_and_process_posts(o);
        });
        find_and_process_posts(X(document.body));
    });

    // Find and identify posts within any DOM element
    // This can be fired at document load, or any time content is inserted.
    function find_and_process_posts(container) {
        var posts = container.find(post_selector);
        if (container.is(post_selector)) {
            posts = posts.add(container);
        }
        posts.each(function (i, post) {
            var $post = X(post);
            // If the post has an aria-posinset attribute, we know it's legit
            // If not, we need to validate it a bit
            if (!$post.attr('aria-posinset')) {
                // In the new layout, comments also show up as [role="article"] so we need
                // to make sure they are not considered a post
                if ($post.closest('*[data-visualcompletion="ignore-dynamic"],li').length) {
                    return;
                }
                // The empty "loading" posts in the news feed trick this selector, so catch that
                if ($post.find('*[role="progressbar"]').length) {
                    return;
                }
            }
            process_post($post.attr('id'),$post);
        });
        return posts;
    }

    // Do the initial process a post and mark it as being seen by SFX
    async function process_post(id,$post) {
        if (!id) {
            id = 'sfx_post_'+sfx_post_id;
            $post.attr('id', id);
        }
        if (!id) {
            return;
        }
        //$post = X(document.getElementById(id)); // Group posts have : in the id, which causes Zepto to crash
        X.publish("log/postdata", {"id": id, "message": "processing post id=" + id});

        // The initial processing recognizes a post and marks it as such
        var is_new = false;
        if (!$post.attr('sfx_post')) {
            $post.attr('sfx_post', sfx_post_id++); // Mark this post as processed
            X.publish("log/postdata", {"id": id, "message": "sfx_post=" + $post.attr('sfx_post')});
            is_new = true;
        }

        // Check for the sfx_id, which is a post's unique identifier to SFX
        var sfx_id = $post.attr('sfx_id') || null;
        var data = {
            "id": id
            ,"selector":"#"+id
            , "sfx_id": sfx_id
        };
        if (is_new) {
            X.publish("log/postdata", {"id": id, "message": "Calling post/add"});
            X.publish("post/add", data);

            // If the post's unique id hasn't been resolved, do so async
            if (!sfx_id) {
                get_post_id($post, id).then(function(sfx_id) {
                    data.sfx_id = sfx_id;
                    $post.attr('sfx_id',sfx_id);
                    X.publish("log/postdata", {"id": id, "message": "Calling post/resolve-id"});
                    X.publish("post/resolve-id", data);
                    X.publish("post/update", data);
                });
            }

            if (!post_count) {
                $first_post = $post;
            }
            // If we have processed too many posts, stop here
            if (post_count++ > max_posts) {
                // Find the DIVs that trigger infinite scroll
                // Luckily it stops working if it's display:none
                var find_infinite_scroll_triggers = function() {
                    // This algorithm finds the pager on News Feeds, and many
                    // other page types.  When it works, it generally returns
                    // 2 empty divs; hiding the 1st (or both) stops the feed.
                    var $proposed = X('.suspended-feed').closest('.rek2kq2y').parent().find(':scope > :empty');
                    if ($proposed.length) {
                        return $proposed;
                    }

                    // This algorithm finds the pager on other types of page,
                    // like search results pages; some permalinks embedded in
                    // the 'persistent notifications' page.
                    const range = document.createRange();
                    range.setStart($first_post[0],0);
                    range.setEnd($post[0],0);
                    $proposed = X(range.commonAncestorContainer).children().last();
                    delete range;      // eslint-disable-line no-delete-var
                    var tries = 10;
                    // Find the element to the right of the last article
                    while ($proposed.length && --tries >= 0) {
                        var $prev_child = $proposed.prev();
                        if ($prev_child.find('[role=article]').length) {
                            if ($proposed.attr('id') === "sfx-feed-pager") {
                                // We don't want our element, must be to the right...
                                $proposed = $proposed.next();
                            }
                            if ($proposed.find('[role=article]').length) {
                                // Settling on an article means we're at the end of what
                                // FB will send in this feed and don't need an SFx pager
                                return X([]);
                            }
                            return $proposed;
                        }
                        $proposed = $prev_child;
                    }
                    return X([]);
                };
                var $infinite_scroll_triggers = find_infinite_scroll_triggers();
                log(`Max post count (${max_posts}) reached. Loaded ${post_count}. Trying to prevent infinite scroll.`);
                if (!$infinite_scroll_triggers.length) {
                    // We don't know what to do here, so don't screw anything up. Exit nicely.
                    log("Couldn't identify infinite scroll triggers definitively. Aborting.");
                    return;
                }
                $infinite_scroll_triggers.addClass('sfx_scroll_pause');
                var pager = X('#sfx-feed-pager');
                try {
                    if (!pager.length) {
                        pager = X(`<div id="sfx-feed-pager" class="sfx_info sfx-pager" style="cursor:pointer;"><b>Infinite Scroll Prevented</b><br>Social Fixer has paused automatic loading of more than ${max_posts} posts to prevent Facebook from going into an infinite loop. <b><u>Click this message</u></b> to continue loading about <input class="sfx_input" type="number" min="1" value="${max_posts}" style="width:7ch;" size="4" sfx-option="max_post_load_count"> more posts.<br></div>`);
                        FX.attach_options(pager);
                        pager.find('input').click(function () {
                            // Don't bubble up to pager
                            return false;
                        });
                        pager.click(function () {
                            pager.remove();
                            X('.sfx_scroll_pause').removeClass('sfx_scroll_pause');
                            post_count = 0;
                        });
                    }
                    // Make sure the pager is at the end and visible
                    X('.sfx_scroll_pause').last().after(pager);
                } catch (e) {
                    alert(e);
                }
                // Hide shimmering 'posts loading' indicator while paused
                const feed_is_loading_selector = [
                    '.suspended-feed ~ [role=article]',
                ].join(',');
                X(feed_is_loading_selector).addClass('sfx_scroll_pause');
            }
        }
    }

    // When navigating, reset post count
    FX.on_page_unload(function () {
        //sfx_post_id = 1;
        post_count = 0;
    });

    // Send FB-recognizable pointer events: they are ignored if the
    // screen & client coordinates are zero.  The sfx_event property
    // is for the benefit of mark_read.js.
    const FB_pointer_event = {
        bubbles: true,
        screenX:100, screenY:100,
        clientX:100, clientY:100,
    };
    function FB_pointerover(el) {
        // eslint-disable-next-line no-undef
        var event = new PointerEvent('pointerover', FB_pointer_event);
        event.sfx_event = true;
        el.dispatchEvent(event);
    }
    function FB_pointerout(el) {
        // eslint-disable-next-line no-undef
        var event = new PointerEvent('pointerout', FB_pointer_event);
        event.sfx_event = true;
        el.dispatchEvent(event);
    }

    async function get_post_id_internal($post, id) {
        return new Promise(async function(resolve) {
            var timestamp_selector = "span[id] a.b1v8xokw[role=link][tabindex='0']:not([href*='/user/'])";
            var timestamp;
            var post_id = null;
            var tries;
            $post.addClass('sfx_touch');
            for (tries = 0; tries < 40; ++tries) {
                if (!timestamp & tries > 3) {
                    break;
                }
                if (tries) {
                    await X.sleep(0.2);
                }
                if (!timestamp) {
                    X.publish('log/postdata', {id, message: `Look for timestamp (${tries})`});
                    timestamp = $post.find(timestamp_selector)[0];
                }
                if (timestamp) {
                    var href = timestamp.getAttribute('href');
                    if (href && href !== '#') {
                        X.publish('log/postdata', {id, message: `Found href (${tries})`});
                        post_id = extract_post_id_from_url(href);
                        break;
                    }
                    // Trigger a hover over the timestamp on the post
                    // This will switch the href from '#' to the real URL
                    FB_pointerover(timestamp);
                    X.publish('log/postdata', {id, message: `Triggering mouseover to find href (${tries})`});
                }
            }
            if (tries && timestamp) {
                FB_pointerout(timestamp);
                X.publish('log/postdata', {id, message: 'Triggering mouseout'});
            }
            setTimeout(function() { $post.removeClass('sfx_touch'); });
            if (!post_id) {
                if (!timestamp) {
                    X.publish('log/postdata', {id, message: 'No timestamp found, cannot determine ID'});
                } else {
                    X.publish('log/postdata', {id, message: 'No permalink found, cannot determine ID'});
                }
            }
            resolve(post_id);
        });
    }

    // Take a link to a post and extract the unique identifier from it
    // If it can't be done, return the whole url as the unique id
    function extract_post_id_from_url(url) {
        // 2017-03-12: most IDs are simply long strings of digits, but some
        // are of the form digits:2, where "2" so far has only been seen to
        // be a single digit.  And ft_ent_identifier may be of the form:
        //    "846660526:10158243768475527:47:1489321690:10158243768475527:2"
        // in which "10158243768475527:2" is a proper ID; that is,
        // https://facebook.com/10158243768475527:2 points to that post.
        //
        // In a collected ID with multiple digit:digit sets, take the last
        // set of digits if it's >1 digit long; take the last two if the
        // last one is a single digit.
        if (/(\d+:\d)$/.test(url) || /:(\d+)$/.test(url)) {
            return RegExp.$1;
        }
        if (/\/(posts|permalink|video)\/(\d+)/.test(url)) {
            return RegExp.$2;
        }
        if (/fbid=(\d+)/.test(url)) {
            return RegExp.$1;
        }
        // 2021-05-21: some Group posts in the News Feed are now in a format
        // of: groups/groupid/?multi_permalinks=postid&etc.
        if (/\/groups\/.*multi_permalinks=(\d+)/.test(url)) {
            return RegExp.$1;
        }
        // 2021-05-21: reject URLs which are actually Group-user resumes
        if (/\/groups\/[^/]*\/user\//.test(url)) {
            return null;
        }

        // At this point we don't have a solid lead, so let's do our best
        // Strip out url arguments & fragments so we don't accidentally match
        // the wrong thing
        url = url.replace(/\/?[#?].*/,'');

        // Make an educated guess that this is an ID
        // Grab the last long string of digits in the url
        if (/\/(\d{6,})\D*$/.test(url)) {
            return RegExp.$1;
        }

        // As a very last resort, strip the url a bit to shorten it and use it as-is
        return url.replace(/^.*?:\/\/.*?\//,'');
    }

    async function get_post_id($post, id) {
        try {
            return get_post_id_internal($post, id).then(function(sfx_id) {
                X.publish("log/postdata", {"id": id, "message": "get_post_id=" + (sfx_id == null ? "null" : sfx_id)});
                return sfx_id;
            });
        } catch(e) {
            console.log(e);
        }
    }
});
