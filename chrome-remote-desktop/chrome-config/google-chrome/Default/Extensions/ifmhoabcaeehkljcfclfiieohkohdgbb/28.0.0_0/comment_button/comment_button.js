// ========================================================
// Fix Comments
// ========================================================
X.ready('comment_button', function () {
  var title = "Fix Enter In Comments, Replies & Chat";
  FX.add_option('comment_button', {"title": title, "order": 1, "description": "Use Enter to add a new line instead of submitting comments & replies.", "default": false, "verified":true});
  FX.add_option('comment_button_msgs', {"title": title, "order": 2, "description": "Use Enter to add a new line instead of submitting chat / messages.", "default": false, "verified":true});
  FX.add_option('comment_button_ctrl', {"title": title, "order": 3, "description": "Use Ctrl+Enter to submit comments, replies & chat / messages.", "default": false, "verified":true});
  FX.add_option('comment_button_emergency', {"title": title, "order": 4, "description": "Use alternate method (no Submit buttons; Ctrl+Enter submits).", "default": false, "verified":true});
  FX.add_option('comment_button_hint', {"hidden": true, "default": true});

  /* Changed settings might fix a failure mode, so let's try again */
  var fix_comments_failing = false;
  FX.on_option_live(['comment_button', 'comment_button_msgs', 'comment_button_ctrl', 'comment_button_emergency'], () => (fix_comments_failing = false));

  FX.on_options_load(function () {
    var nested_enter_event = false;
    var nested_enter_count = 0;

    var dispatch_enter_event = function (e, $target, shiftKey) {
      e.preventDefault();
      e.stopPropagation();

      // Set a timeout so if it fails, revert back to default behavior
      var saved_enter_count = nested_enter_count;
      setTimeout(function () {
        if (nested_enter_count > saved_enter_count) {
          return;  // It worked!
        }

        // Tell Fix Enter to stop trying; retract Submit buttons & messages
        fix_comments_failing = true;
        X('.sfx_comment_button').forEach(el => el.style.display = "none");
        X('.sfx_comment_button_msg').forEach(el => el.textContent = "Press 'Enter' to submit");

        // Then alert the user and offer some proposed solutions
        var proposed_solution = (FX.option('comment_button_emergency')) ?
                                "disable all 'Fix Enter' options" :
                                "enable the 'Use alternate method' option";
        var proposed_limitation = (FX.option('comment_button_emergency')) ?
                                `For now, 'Enter' submits and 'Shift+Enter' makes new lines
(Facebook's normal behavior)` :
                                `Enter will add new lines, Ctrl+Enter will submit,
but there will be no visible comment/reply Submit button`;
        // 0-timeout to allow button/msg retraction to redraw
        setTimeout(function () {
          alert(`Message from Social Fixer: it looks like 'Fix Enter' is failing.

Please ${proposed_solution}, and watch
the Support group, socialfixer.com/support, for announcements.

No need to report it, you won't be the first.

${proposed_limitation}.`.replace(/\n/g,' \n')); // Opera ^C-to-copy omits newlines
        });
        X.support_note('comment_button', 'failing');
      }, 250);
      nested_enter_event = true;
      $target[0].dispatchEvent(new KeyboardEvent('keydown', {
            bubbles: true
          , cancelable: true
          , charCode: 0
          , code: 'Enter'
          , key: 'Enter'
          , keyCode: 13
          , shiftKey: shiftKey
          , which: 13
      }));
      nested_enter_event = false;
      e.preventDefault();
      e.stopPropagation();
    };

    var comment_button_data = {};

    var comment_button_actions = {
      "comment_button_options": function () {
        X.publish("menu/options", {"highlight_title": title});
      },
      "comment_button_hint_off": function () {
        X.storage.set("options", "comment_button_hint", false);
        X('.sfx_comment_button_hint').remove();
      },
      "dispatch_enter_event": dispatch_enter_event,
    };

    var comment_id = 0;

    X.capture(window, 'keydown', function (e) {
      // This handler is invoked for every input key; bail
      // out early if we have nothing to do...
      // [[[ ==>

      // ==> If we already know our events aren't getting through
      if (fix_comments_failing) {
        return;
      }

      // ==> If this is a nested call (we're on the dispatch chain for
      //    our own injected Enter keys!)
      if (nested_enter_event) {
        nested_enter_count++;
        return;
      }

      // Find the target of the keypress
      var $target = X.target(e, true);

      // ==> If this isn't an editable field
      if ('true' != $target.attr('contenteditable') && 'textbox' != $target.attr('role')) {
        return;
      }

      // The containing element of the input and the submit button we will insert
      var $container = null;
      // Figure out if this is a comment or Message/Chat
      var comment_type = "comment";
      $container = $target.closest('form');
      if (!$container.length) {
        return;
      }
      if ("presentation" != $container.attr('role')) {
        comment_type = 'message';
      }

      // ==> In emergency mode, just fiddle with shift-state of Enter (no UI)
      if (FX.option('comment_button_emergency')) {
        if (e.keyCode != 13 ||
            (comment_type == 'comment' && !FX.option('comment_button')) ||
            (comment_type == 'message' && !FX.option('comment_button_msgs'))) {
          // let FB handle it normally
          return;
        }
        // Force Ctrl+Enter = submit, else no way to submit comment / reply!
        // Although chat/msgs have native FB submit button, act consistently.
        return dispatch_enter_event(e, $target, !e.ctrlKey);
      }

      // ==> If this isn't the sort of comment container we know about
      if (!$container.length) {
        return;
      }

      // ==> If we should avoid it for some other reason
      // (#birthday_reminders_dialog appears to be obsolete 2018-11-01)
      if ($target.closest('#birthday_reminders_dialog').length) {
        return;
      }
      // <== ]]]

      var this_comment_id = $target.attr('sfx_comment_id');
      if (!this_comment_id) {
        this_comment_id = comment_id++;
        $target.attr('sfx_comment_id', this_comment_id);
        comment_button_data[this_comment_id] = {
          "comment_button": null,
          "comment_button_ctrl": null,
          "comment_button_hint": null,
          // can't use $ in Vue data property names
          "Xtarget": $target,
        };
      }
      var cbd = comment_button_data[this_comment_id];

      // Communicate any option changes to Vue -- without triggering
      // any events if they *haven't* changed...
      ['comment_button','comment_button_ctrl','comment_button_hint','comment_button_msgs'].forEach(function(opt) {
        var opt_val = FX.option(opt);
        if (cbd[opt] != opt_val) {
          cbd[opt] = opt_val;
        }
      });
      // Only add our own Submit button to the post-comment/reply cases
      if (comment_type == 'comment') {
        var tabIndex = 9900 + 2 * this_comment_id;
        $target[0].tabIndex = tabIndex;
        var $note_container = null;
        $note_container = $container.parent();

        var $wrapper = $note_container.find('.sfx_comment_button_present');
        // If there is no comment text, remove the submit button after a slight delay (ex: the user erased the comment)
        // The delay is needed because we catch the keydown event, and the actual content doesn't exist in the DOM yet
        // so we can't check if there is any comment text
        setTimeout(function() {
          var $present = $note_container.find('.sfx_comment_button_present');
          if ($present.length) {
            if (
              // No text entered
              !$note_container.find('span[data-text]').text()
              // No image
              && !$note_container.find('form .uiScaledImageContainer').length)
            {
              // The logic for this isn't perfect yet, so don't remove the button
              //$present.remove();
            }
          }
        },250);
        if (!$wrapper.length) {
          var html = FX.oneLineLtrim(`
            <div class="sfx_comment_button_present sfx_clearfix">
              <input v-if="comment_button" class="sfx_comment_button" type="button" value="Submit ${/reply/.test($target.attr('data-testid')) ? 'Reply' : 'Comment'}" data-hover="tooltip" data-tooltip-delay="100" data-tooltip-position="below" data-tooltip-content="${cbd.comment_button_ctrl ? 'Click or press Ctrl+Enter to Submit' : ''}" style="cursor:pointer;" tabIndex="${9901 + 2 * this_comment_id}" @click="dispatch_enter_event($event, Xtarget, false)">
              <!--<span v-if="comment_button && comment_button_ctrl" class="sfx_comment_button_msg">(Ctrl+Enter also submits)</span>-->
              <span v-if="!comment_button && comment_button_hint" class="sfx_comment_button_msg sfx_comment_button_hint">
                Social Fixer can prevent Enter from submitting comments & replies!<br>
                <a class="sfx_link" style="color:inherit;" @click="comment_button_options">
                  'Fix Enter' Options
                </a>
                &nbsp;&nbsp;
                <a class="sfx_link" style="color:inherit;" @click="comment_button_hint_off">
                  Don't show this
                </a>
              </span>
            </div>
          `);
          var $vue = template(null, html, cbd, comment_button_actions);
          $note_container.append($vue.fragment);
        }
      } else if (comment_type == 'message' && cbd.comment_button_msgs) {
        // FB add their Chat / Messages / Messenger 'Send' tooltip after the first
        // char is in the input buffer; and may remove it (and later re-add it) if
        // the user backspaces the buffer empty.  Replace theirs with ours; do not
        // write to the DOM if ours is already in place.  Don't try to parse their
        // string, which could be in any language.  (Our tooltip is always English
        // (at the moment).)
        setTimeout(function() {
          var tooltip_str = `Enter adds new lines\n${cbd.comment_button_ctrl ? 'Press Ctrl+Enter or\n' : ''}Click here to send`;
          var $tooltip = $target.closest('._kmc').parent().find('[data-tooltip-content]');
          $tooltip.length || ($tooltip = $container.find('[label="send"]'));
          if ($tooltip.length && $tooltip.attr('data-tooltip-content') != tooltip_str) {
            $tooltip.attr('data-tooltip-content', tooltip_str);
          }
        }, 0.5 * X.seconds);  // Messages / Messenger 0.05s; chat popup is slow...
      }

      if (e.keyCode != 13 ||
          (comment_type == 'comment' && !cbd.comment_button) ||
          (comment_type == 'message' && !cbd.comment_button_msgs)) {
        // let FB handle it normally
        return;
      }
      dispatch_enter_event(e, cbd.Xtarget, !(cbd.comment_button_ctrl && e.ctrlKey));
    });
  });
});
