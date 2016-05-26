module.exports = function (app, passport, renderPart) {

    app.get('/', function (req, res) {
        renderPart.call(this, req, res, 'index');
    });

    app.get('/login', function (req, res) {
        renderPart.call(this, req, res, 'login');
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile',
        failureRedirect : '/login'
    }));

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/profile', isLoggedIn, function (req, res) {
        renderPart.call(this, req, res, 'profile');
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
