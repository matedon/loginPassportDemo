import _ from 'lodash';
import bodyParser from 'body-parser';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import * as github from './github';
import myPassport from './passport.js';
myPassport(passport);

export default (app) => {

    const
        parseForm = bodyParser.urlencoded({extended: false}),
        csrfProtection = csrf({cookie: true}),
        renderPart = (req, res, name, opts) => {
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
        },
        isLoggedIn = (req, res, next) => {
            if (req.isAuthenticated()) {
                return next();
            }
            res.redirect('/');
        },
        indexHandler = (req, res) => {
            if (req.user) {
                github.getRepos({
                    query: {
                        page: req.query.page,
                        per_page: req.query.per_page
                    },
                    user: req.query.uname
                })
                    .then((github) => {
                        renderPart.call(this, req, res, 'index', {
                            github
                        });
                    })
                    .catch((out) => {
                        renderPart.call(this, req, res, 'index', {
                            error: out.message
                        });
                    })
                ;
            } else {
                renderPart.call(this, req, res, 'index');
            }
        };

    app
        .use(bodyParser.json())
        .use(bodyParser.urlencoded({extended: true}))
        .use(passport.initialize())
        .use(passport.session())
        .use(cookieParser())
    ;

    app.get('/', indexHandler);

    app.get('/login', csrfProtection, (req, res, next) => {
        renderPart.call(this, req, res, 'login', {
            csrfToken: req.csrfToken()
        });
    });

    app.post('/login',
        parseForm,
        csrfProtection,
        (err, req, res, next) => {
            if (err.code !== 'EBADCSRFTOKEN') {
                return next();
            }
            renderPart.call(this, req, res, 'login', {
                csrfToken: req.csrfToken(),
                issue: 'CSRF token error! Reset your browser or contact with your System Administrator!'
            });
        },
        (req, res, next) => {
            passport.authenticate('local-login', function (err, user, info) {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    renderPart.call(this, req, res, 'login', {
                        issue: 'You shall not pass! Please check login details!',
                        csrfToken: req.csrfToken()
                    });
                    return;
                }
                req.logIn(user, function (err) {
                    if (err) {
                        return next(err);
                    }
                    return indexHandler.call(this, req, res);
                });
            })(req, res, next);
        }
    )
    ;

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    app.get('/profile', isLoggedIn, (req, res) => {
        renderPart.call(this, req, res, 'profile');
    });
};
