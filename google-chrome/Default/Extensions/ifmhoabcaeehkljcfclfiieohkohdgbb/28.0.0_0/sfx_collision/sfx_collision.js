X.ready('sfx_collision', function () {
	// Don't run this if the page was loaded a long time ago:
	//
	// Firefox (and family?) seem to update already-installed web_extensions by
	// injecting the new script into the already running page where the old one
	// was previously injected.  Social Fixer sees that the page was previously
	// meddled with (by its own previous version!) -- but we need to ignore it.
	//
	// Collision check doesn't need to fire every time as long as it eventually
	// notifies the user on some later page load.
	//
	// Refs:
	//
	// https://www.w3.org/TR/navigation-timing/#sec-navigation-timing-interface
	// https://developer.mozilla.org/en-US/docs/Web/API/Performance/timing

	if (performance && performance.timing && performance.timing.domLoading) {
		if (X.now() - performance.timing.domLoading > 10 * X.seconds) {
			return;
		}
	}

	X.when('#sfx_badge', function () {
		// Allow all version(s) to finish init & fighting over badge
		setTimeout(function () {
			var collision_alert = function (ver_msg, advice) {
				alert(`\
WARNING: two or more copies of Social Fixer are running at once!

This one is:  version "${sfx_buildstr}".
The other is: version "${ver_msg}".

Please disable all older versions to avoid unexpected behavior!

SEE http://tiny.cc/sfx-only-1 on removing old versions.
SEE http://tiny.cc/sfx-saveprefs on saving and transferring preferences.
SEE https://socialfixer.com/support (the Support Group on FB) for help.
${advice ? "\n" + advice + "\n" : ""}
You may copy this text with CONTROL-C or COMMAND-C.`
					.replace(/\n/g,' \n') // Opera ^C-to-copy omits newlines
				);
				X.support_note('sfx_collision', `Other: '${ver_msg}'`);
			};

			var $badge = X('#sfx_badge');
			var old_buildstr = $badge.attr('old_buildstr');
			var badge_buildstr = $badge.attr('sfx_buildstr');

			// Intentionally not an else-chain: intended & tested
			// to detect multiple classes of old version at once.

			// These divs existed in at least versions 5.968 through 12.0
			if (X("div.bfb_theme_extra_div").length > 0) {
				collision_alert("below 15.0.0",
				"NOTE: preferences from this version cannot be transferred, but should be saved for manual reference."
				);
			}
			// Another >=15 SFX without collision detection
			if (!badge_buildstr || old_buildstr == "old") {
				collision_alert("between 15.0.0 and 16.0.1");
			}
			// Another >=16 SFX with collision detection who created badge 1st
			// (if we created badge 1st, he complains for us)
			if (old_buildstr && old_buildstr != "old" && old_buildstr != sfx_buildstr) {
				collision_alert(old_buildstr);
			}
		}, 8 * X.seconds);
	});
});
