'use strict';

import {_} from 'lodash';
import {bodyParser} from 'body-parser';

module.exports = function (app) {

    const
        _ = require('lodash'),
        bodyParser = require('body-parser'),
        passport = require('passport'),
        github = require('./github'),
        cookieParser = require('cookie-parser'),
        parseForm = bodyParser.urlencoded({extended: false}),
        csrf = require('csurf'),
        csrfProtection = csrf({cookie: true});

    app
        .use(bodyParser.json())
        .use(bodyParser.urlencoded({extended: true}))
        .use(passport.initialize())
        .use(passport.session())
        .use(cookieParser())
    ;

    require('./passport.js')(passport);

    var renderPart = function (req, res, name, opts) {
        if (typeof name == 'undefined') {
            name = 'index';
        }
        opts = _.merge({
            page: name,
            layout: 'main',
            loginUser: req.user
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
                .then(function (github) {
                    renderPart.call(this, req, res, 'index', {
                        github: github
                    });
                })
                .catch(function (out) {
                    renderPart.call(this, req, res, 'index', {
                        error: out.message
                    });
                })
            ;
        } else {
            renderPart.call(this, req, res, 'index');
        }
    });

    app.get('/login', csrfProtection, function (req, res) {
        renderPart.call(this, req, res, 'login', {
            csrfToken: req.csrfToken()
        });
    });

    app.post('/login', parseForm, csrfProtection, function (err, req, res, next) {
        if (err.code !== 'EBADCSRFTOKEN') {
            return next();
        }
        renderPart.call(this, req, res, 'login', {
            csrfToken: req.csrfToken(),
            issue: 'CSRF token error! Reset your browser or contact with your System Administrator!'
        });
    }, passport.authenticate('local-login', {
        failureRedirect: '/login?issue=1'
    }), function (req, res) {
        renderPart.call(this, req, res, 'profile', {
            loginRedirect: true
        });
    });

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
