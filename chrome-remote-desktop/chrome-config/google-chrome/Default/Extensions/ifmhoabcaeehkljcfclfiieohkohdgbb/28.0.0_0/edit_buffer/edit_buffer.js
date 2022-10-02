X.ready('edit_buffer', function() {
    FX.add_option('edit_buffer', {
        section: 'Experiments',
        title: 'Find Edit',
        description: 'Find unsaved post / comment / reply edits.',
        type: 'action',
        action_message: 'options/close,edit_buffer/find',
        action_text: 'Find Edit In Progress',
    });

    // This still includes the selector for old layout, which I think
    // may still be used on some hybrid page types
    const substream_selector = [
            '[data-pagelet*=FeedUnit]',
            '[id^="substream"]',
    ].join(',');

    // This selector finds edit buffers on both old-new-layout and
    // new-new-layout (change happening mid-June 2021)
    const buf_selector = [
            '[contenteditable=true]',
    ].join(',');

    // The prompt text like 'Write a comment...' is marked [contenteditable=false]
    const buf_rejector = [
            '[contenteditable=false]',
    ].join(',');

    var edit_buf_scrollto = function(buf) {
        var $buf = X(buf);

        // Multi-level scrolling was required on Opera and probably all
        // Chromium / Blink / WebKit; if I don't scroll to 'substream'
        // first, it can't find 'buf' and doesn't scroll at all.  Final
        // scroll is to put it in the middle of the screen.

        setTimeout(function () {
            $buf.parents(substream_selector).forEach( el => el.scrollIntoView() );
            setTimeout(function () {
                buf.scrollIntoView();
                setTimeout(function () {
                    var offs = $buf.offset();
                    var top_tgt = offs.top - (window.innerHeight / 2);
                    window.scrollTo(0, top_tgt < 0 ? 0 : top_tgt);
                }, 50);
            }, 50);
        }, 50);
    };

    X.subscribe('edit_buffer/find', function () {
        var prev_buf = -1;

        var show_edit_buf_post = function (buf_num, is_selected) {
            if (buf_num == -1) {
                X('.sfx_edit_buf_post_show').toggleClass('sfx_edit_buf_post_show sfx_post_read_show', false);
                return;
            }
            // Highlight the selection in our menu
            X('#sfx_find_edit_dialog').find(`[_option_="${buf_num}"]`).toggleClass('selected', is_selected);

            // If selected buffer is in a post, highlight that post
            // and force it to be visible even if 'Read', hidden by
            // filter action, or in a non-current tab.
            X(dirty_buffers[buf_num]).closest('[sfx_post]').toggleClass('sfx_edit_buf_post_show sfx_post_read_show', is_selected);
        };
        var select_buf = function (e) {
            var buf_num = X(e.target).attr('_option_');
            show_edit_buf_post(prev_buf, false);
            show_edit_buf_post(buf_num, true);
            edit_buf_scrollto(dirty_buffers[buf_num]);
            prev_buf = buf_num;
        };
        var close_dialog = function () {
            if (!vue_variables.leave_visible) {
                show_edit_buf_post(-1, false);
            }
            X('#sfx_find_edit_dialog').remove();
        };
        var row_content = function (db) {
            var row = X(db).innerText();
            return (row.length == 0) ? '·'
                 : (row.length < 80) ? row
                                     : row.slice(0, 76) + '...';
        };

        var dirty_buffers = X(buf_selector).filter(function() {
            return (this.innerText.length > 1 && !X(this).find(buf_rejector).length);
        });
        var db_l = dirty_buffers.length;
        var click_msg = (db_l == 0) ? 'No edits in progress' :
                        (db_l == 1) ? 'Click to show this edit' :
                                      'Click to show one of these edits';

        var html = FX.oneLineLtrim(`
            <div class="sfx_bubble_note sfx_bubble_note_top_right" draggable="true" id="sfx_find_edit_dialog">
                <div class="sfx_bubble_note_title">
                    Find Edit In Progress
                </div>
                <div>
                    ${click_msg}
                </div>
                <br>
                <template v-for="db in dirty_buffers">
                    <template v-if="db.innerText">
                        <div @click="select_buf" draggable="false" _option_="{{$index}}" class="sfx_edit_buf_button">
                            {{row_content(db)}}
                        </div>
                        <br>
                    </template>
                </template>
                <span draggable="false">
                    <input type="button" class="sfx_button" value="Done" @click="close_dialog">
                </span>
                <label class="sfx_edit_buf_toggle" @click="leave_visible = !leave_visible"
                       data-hover="tooltip" data-tooltip-delay="300"
                       data-tooltip-content="Show editing post even if 'Read' / hidden / in other tab">
                    <input type="checkbox" class="sfx_button">
                    Leave post highlighted
                </label>
            </div>
        `);
        var vue_variables = {
            dirty_buffers,
            leave_visible: false,
        };
        var vue_methods = {
            row_content,
            select_buf,
            close_dialog,
        };

        template(document.body, html, vue_variables, vue_methods).ready(function () {
            X.draggable('#sfx_find_edit_dialog');
        });
    });
});
