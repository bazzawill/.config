// Collect anti-CSRF token (DTSG) as early as possible.
// window.requireLazy() must be called in the root window
// scope; we also have to wait until that function exists!
X.inject(function() {
  var fb_dtsg_str = null;
  var called_fb = false;
  var cycle_count = 0;
  const cycle_interval = .5 * 1000;
  var technique;
  const gather_dtsg = function() {
    if (!called_fb && window.requireLazy) {
      // Preferred method -- get from FB's own internal API
      window.requireLazy(['DTSG'],
        function(DTSG_module) {
          if (DTSG_module && DTSG_module.getToken && !fb_dtsg_str) {
            technique = 'requireLazy()';
            fb_dtsg_str = DTSG_module.getToken();
          }
        }
      );
      called_fb = true;
    }
    if (!fb_dtsg_str) {
      // Fallback method.  'Old layout' (pre-2020) FB documents
      // have one or more [name=fb_dtsg] elements.  'New layout'
      // documents sometimes do, sometimes do not have any; so
      // the API method is primary, but this may still be useful
      // on some pages.  Also the API is ready earlier than the
      // document element(s).
      var fb_dtsg_el = document.querySelector('[name=fb_dtsg]');
      if (fb_dtsg_el && fb_dtsg_el.value) {
        technique = '[name=fb_dtsg]';
        fb_dtsg_str = fb_dtsg_el.value;
      }
    }
    if (!fb_dtsg_str && ++cycle_count >= 20) {
      technique = 'All techniques';
      fb_dtsg_str = 'failed';
    }
    if (fb_dtsg_str) {
      // Communicate back to extension
      var data = {
        "fb_dtsg":fb_dtsg_str,
        "technique": technique,
        "count": cycle_count
      };
      window.postMessage( {"sfx":true, "pagecontext":true, "message": { "event":'fb_dtsg/ready', "data": data } } , "*");

    } else {
      setTimeout(gather_dtsg, cycle_interval);
    }
  };
  // Can't use setInterval() early because FB replace the timeout
  // implementation during startup.  FB's clearInterval() doesn't
  // know about those early timer IDs and can't stop the interval
  // timer!  Using a setTimeout() chain, it doesn't matter if the
  // implementation changes: each one ends on schedule and we are
  // in manual control of whether another one is fired off.
  //
  // 0.025 * 100 is nominally 2.5s, but they don't fire that fast.
  setTimeout(gather_dtsg, cycle_interval);
});
