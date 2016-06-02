'use strict';

module.exports = function (app, passport) {
    const _ = require('lodash');

    var parseLinkHeader = function(header) {
        // https://gist.github.com/niallo/3109252
        if (header.length == 0) {
            throw new Error("input must not be of zero length");
        }
        var parts = header.split(','),
            links = {};
        _.each(parts, function(p) {
            var section = p.split(';');
            if (section.length != 2) {
                throw new Error("section could not be split on ';'");
            }
            var url = section[0].replace(/<(.*)>/, '$1').trim(),
                name = section[1].replace(/rel="(.*)"/, '$1').trim();
            url = '/' + url.slice(url.indexOf('?'));
            links[name] = url;
        });
        return links;
    };

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
            const
                https = require('https'),
                url = require('url'),
                querystring = require('querystring');
            var query = {
                    page: req.query.page ? req.query.page : 1,
                    per_page: req.query.per_page ? req.query.per_page : 10
                },
                params = url.parse('https://api.github.com/users/jeresig/repos?' + querystring.stringify(query));
            params.headers = {
                'user-agent': 'virgoNode'
            };
            https
                .get(params, function (quest) {
                    var data = '';
                    quest.on('data', function (d) {
                        data += d;
                    });
                    quest.on('end', function () {
                        data = JSON.parse(data);
                        var links = parseLinkHeader(quest.headers.link);
                        console.log(links);
                        renderPart.call(this, req, res, 'index', {
                            github: data,
                            links: links,
                            query: query
                        });
                    });
                })
                .on('error', function (err) {
                    renderPart.call(this, req, res, 'index', {
                        error: 'Github repository not avaliable!'
                    });
                    console.error(err);
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
