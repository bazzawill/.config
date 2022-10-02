X.ready( 'debug_post_html', function() {
    // Add an item to the wrench PAI
    X.publish('post/action/add', {"section": "wrench", "label": "Show Post HTML", order: 30, "message": "post/action/post_html"});
    X.subscribe("post/action/post_html", function (msg, data) {
        var html = X('<div>').append( X(document.getElementById(data.id)).clone(true) ).html().replace(/</g,'&lt;').replace(/>/g,'&gt;');

        var Ctrl = (/Macintosh|Mac OS X/.test(sfx_user_agent)) ? 'Command' : 'Ctrl';
        var content = FX.oneLineLtrim(`
        <div draggable="false">Click in the box, press ${Ctrl}+a to select all, then ${Ctrl}+c to copy.</div>
        <div draggable="false">
            <textarea style="white-space:pre-wrap;width:500px;height:250px;overflow:auto;background-color:white;">${html}</textarea>
        </div>
        `);
        bubble_note(content, {"position": "top_right", "title": "Post Debug HTML", "close": true});
    });
});
