X.ready( 'post_font', function() {
    FX.add_option('post_font_size_2', {
        "section": "General"
        , "title": "Font: Post Font Size"
        , "description": "Set a custom size for post text, including comments."
        , "type": "number"
        , "min": 5
        , "default": ""
    });
    FX.add_option('post_font_family_2', {
        "section": "General"
        , "title": "Font: Post Font Family"
        , "description": "Set a custom font to be used for post text, including comments."
        , "type": "text"
        , "default": ""
    });
    FX.add_option('post_comment_font_size_2', {
        "section": "General"
        , "title": "Font: Post Comment Font Size"
        , "description": "Set a custom size only for comments to posts."
        , "type": "number"
        , "min": 5
        , "default": ""
    });
    FX.add_option('post_comment_font_family_2', {
        "section": "General"
        , "title": "Font: Post Comment Font Family"
        , "description": "Set a custom font to be used only on comments to posts."
        , "type": "text"
        , "default": ""
    });

    var post_font_set_css = function () {
        var post_font_size_2 = FX.option('post_font_size_2');
        var post_font_family_2 = FX.option('post_font_family_2');
        var post_comment_font_size_2 = FX.option('post_comment_font_size_2');
        var post_comment_font_family_2 = FX.option('post_comment_font_family_2');

        const post_text_selector = '[role=article] *';
        const comment_text_selector = '[role=article] ul *';

        var css = "";
        if (post_font_size_2 && +post_font_size_2>5) {
            css += `${post_text_selector} { font-size: ${post_font_size_2}px !important; }`;
        }
        if (post_font_family_2) {
            css += `${post_text_selector} { font-family: "${post_font_family_2}" !important; }`;
        }
        if (post_comment_font_size_2 && +post_comment_font_size_2>5) {
            css += `${comment_text_selector} { font-size: ${post_comment_font_size_2}px !important; }`;
        }
        if (post_comment_font_family_2) {
            css += `${comment_text_selector} { font-family: "${post_comment_font_family_2}" !important; }`;
        }

        X.css(css, 'sfx_post_font_css');
    };
    FX.on_option_live(['post_font_size_2','post_font_family_2',
                       'post_comment_font_size_2','post_comment_font_family_2'],
                      post_font_set_css);
});
