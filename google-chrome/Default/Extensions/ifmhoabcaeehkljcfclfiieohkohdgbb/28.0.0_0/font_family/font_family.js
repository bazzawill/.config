X.ready( 'font_family', function() {
    FX.add_option('font_family', {
        "section": "General"
        , "title": "Font: Custom Font"
        , "description": "Set a custom font name using CSS syntax to override the default Facebook fonts. You may add multiple fonts, separated by comma."
        , "type": "text"
        , "default": ""
    });
    var body_font_set_css = function () {
        var font = FX.option('font_family');
        var css = '';
        if (font) {
            css += `body, body *, #facebook body, #facebook body._-kb { font-family:${font} !important; }`;
        }
        X.css(css, 'sfx_body_font_css');
    };
    FX.on_option_live('font_family', body_font_set_css);
});
