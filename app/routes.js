'use strict';

module.exports = function (app, passport) {
    const
        _ = require('lodash'),
        github = require('./github');



    var renderPart = function (req, res, name, opts) {
        if (typeof name == 'undefined') {
            name = 'index';
        }
        console.log(req.user);
        opts = _.merge({
            page: name,
            layout: 'main',
            req: req
        }, opts);
        if (req.xhr) {
            opts.layout = 'ajax';
        }
        res.render(name, opts);
    };

    app.get('/', function (req, res) {
        if (req.user) {
            github
                .getRepos({
                    query: {
                        page: req.query.page,
                        per_page: req.query.per_page
                    },
                    user: req.query.uname
                })
                .then(function(github) {
                    renderPart.call(this, req, res, 'index', {
                        github: github
                    });
                })
                .catch(function(out) {
                    renderPart.call(this, req, res, 'index', {
                        error: out.message
                    });
                })
            ;
        } else {
            renderPart.call(this, req, res, 'index');
        }
    });

    app.get('/login', function (req, res) {
        renderPart.call(this, req, res, 'login');
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile?login=1',
        failureRedirect: '/login'
    }));

    app.get('/logout', function (req, res) {
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
