// ===================================================
// STICKY NOTES
// ===================================================
// note_parent = selector or DOM object to point to
// left_right = 'left' | 'right' where to put note (default: 'left')
// content = stuff in the note (string of text or HTML source)
// data.close = boolean whether to include a close button
// data.closefunc = callback to invoke when note's close button
//                  is clicked or close_sticky_note() is called
function sticky_note(note_parent,left_right,content,data) {
	data = data || {};
	left_right = (left_right == 'right') ? 'right' : 'left';
	var note = X(FX.oneLineLtrim(`
		<div class="sfx_sticky_note sfx_sticky_note_${left_right}">
			<div class="sfx_sticky_note_close"></div>
			<div>${content}</div>
			<div class="sfx_sticky_note_arrow_border"></div>
			<div class="sfx_sticky_note_arrow"></div>
		</div>
	`));
	var $note_parent = X(note_parent);
	note_parent = $note_parent[0];
	try {
		note.css('visibility', 'hidden').appendTo(note_parent);
	} catch(e) { alert(e); }
	var height = note[0].offsetHeight;
	note[0].style.marginTop = -(height/2) + "px";
	note[0].style.visibility="visible";
	// Close functionality
	var close = note.find('.sfx_sticky_note_close');
	if (false!==data.close) {
		close.click(function() {
			sticky_note_remove(note, note_parent);
			if (typeof data.closefunc=="function") {
				data.closefunc();
			}
		});
	}
	else {
		close.remove();
	}
	return note;
}

// These two are explicitly different:
//
//   sticky_note_close() calls the provided closefunc, if any
//   sticky_note_remove() does not call closefunc, even if provided

function sticky_note_close(note, note_parent) {
	var close = X(note).find('.sfx_sticky_note_close');
	if (close.length) {
		close.click();
		// which calls sticky_note_remove()
	} else {
		sticky_note_remove(note, note_parent);
	}
}

function sticky_note_remove(note) {
	X(note).remove();
}
