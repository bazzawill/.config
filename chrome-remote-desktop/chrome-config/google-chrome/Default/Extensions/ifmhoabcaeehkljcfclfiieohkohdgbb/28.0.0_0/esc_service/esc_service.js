// Distribute a message when ESC is pressed
X(window).keyup(function(event) {
    if (event.keyCode == 27) {
        X.publish('esc/pressed');
    }
});
