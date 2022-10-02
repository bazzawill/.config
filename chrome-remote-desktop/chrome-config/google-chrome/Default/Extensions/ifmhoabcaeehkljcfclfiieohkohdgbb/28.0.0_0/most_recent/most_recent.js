/* sticky_note.js:   */ /* global sticky_note_remove */

// =========================================================
// Force the main Newsfeed to the Most Recent view
// =========================================================
X.ready( 'most_recent', function() {
	FX.add_option('auto_switch_to_recent_stories', {"title": 'Automatically Switch to Most Recent view of the main Newsfeed', "description": "Facebook defaults to Top Posts. This option detects this view and automatically switches you to the chronological Most Recent view.", "default": false, "verified":true});
	FX.add_option('auto_switch_hide_message', {"section":"Advanced", "title": 'Hide Most Recent switch messages', "description": "When automatically switched to the Most Recent news feed, hide the message that appears to inform you of the switch.", "default": false, "verified":true});
	FX.add_option('redirect_home_links', {"section": "Advanced", "title": 'Redirect Home Links', "description": 'Try to keep links to the Home Page in your current view - Most Recent or Top Posts.', "default": true, "verified":true});
	FX.on_options_load(function () {
		var already_most_recent = function(href) {
			return (/sk=h_chr/.test(href));
		};
		if (FX.option('redirect_home_links')) {
			FX.on_content_loaded(function () {
				X.capture(document.body, 'mousedown', function (e) {
					var $e = X.target(e, true);
					if (!$e.is('a')) {
						$e = $e.closest('a');
					}
					var href = $e.attr('href');
					if (href=="/" || /facebook\.com\/$/.test(href)) {
						// Don't force Most Recent link if clicking "Back to Top Posts" which only exists in the Main container
						// Force Top Posts instead
						if ($e.closest('*[role="main"]').length) {
							e.preventDefault();
							e.stopPropagation();
							location.href = "/?sk=h_nor";
						}
						// This is a link from somewhere to the News Feed, so make sure it's a Most Recent link
						else if (FX.option('auto_switch_to_recent_stories')) {
							e.preventDefault();
							e.stopPropagation();
							location.href = "/?sk=h_chr";
						}
					}
				});
			});
		}

		// Force Most Recent
		FX.on_content_loaded(function () {
			if (FX.option('auto_switch_to_recent_stories')) {
				var href = window.location.href;
				if (/sfx_switch=true/.test(href)) {
					if (!FX.option('auto_switch_hide_message')) {
						var note = sticky_note('#sfx_badge', 'left', 'Auto-switched to Most Recent', {close: false});
						setTimeout(function () {
								//sticky_note_remove(note, '#sfx_badge');
							note.remove();
						}, 3.0 * X.seconds);
					}
					return;
				}
				if (already_most_recent(href)) {
					return;
				}
				var redirect_now = function () {
					// Failsafe in case redirect doesn't cause reload
					setTimeout(function () {
						X(document.body).css('opacity', '1');
					}, 2.0 * X.seconds);
					X(document.body).css('opacity', '.2');
					// Remove the setTimeout so this doesn't wait so long to
					// run, after other async processes in the queue run
						window.location.href = "/?sk=h_chr&sfx_switch=true"; // recent_href(href, 'sfx_switch=true');
				};
				// If you specifically asked for Top News, don't redirect
				if (/sk=h_nor/.test(href)) {
					return;
				}
				if (location.pathname=="/") {
					// The new layout always has sk=h_chr in Most Recent view
					// If we're on root Facebook, redirect
					redirect_now();
				}
			}
		});
	});
});
