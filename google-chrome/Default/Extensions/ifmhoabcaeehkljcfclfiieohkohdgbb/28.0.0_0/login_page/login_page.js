// Detect whether we are on a login page
FX.on_content_loaded(function () {
    const login_selectors = [
        /* On 'classic' FB as of 2020-08-13: */
        /*   - 4 of these 6 selectors appear on the plain login page */
        /*   - a different 4 appear on the inline login on a 404 page */
        /*   - 0 appear on logged-in pages */
            'body[class*=LoggedOut]',
            'form#login_form',
            "form[class*=ogin][action*='/login']",
            'input[name=login_source]',
            'button[name=login][data-testid*=login]',
            'button[id*=login][data-testid*=login]',
        /* On 'new' FB as of 2020-08-13: */
        /*   - no selectors determined yet */
    ].join(',');

    // Undefined member is effectively false until set, so can be used
    // without knowing whether this has run yet
    FX.isNonLoginPage = (X(login_selectors).length < 2);

    // For users who need to wait until definitely known
    X.publish('login_page/ready');
});
