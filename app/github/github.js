'use strict';

const
    _ = require('lodash'),
    Promise = require("bluebird");

function parseLinkHeader(header) {
    // https://gist.github.com/niallo/3109252
    if (!(header && header.length)) {
        console.error("input must not be of zero length");
        return false;
    }
    var parts = header.split(','),
        links = {};
    _.each(parts, function (p) {
        var section = p.split(';');
        if (section.length != 2) {
            console.error("section could not be split on ';'");
            return false;
        }
        var url = section[0].replace(/<(.*)>/, '$1').trim(),
            name = section[1].replace(/rel="(.*)"/, '$1').trim();
        url = '/' + url.slice(url.indexOf('?'));
        links[name] = url;
    });
    return links;
}

exports.getRepos = function (opts) {
    return new Promise(function (fulfill, reject) {
        const
            https = require('https'),
            url = require('url'),
            querystring = require('querystring');

        opts = _.merge({
            query: {
                page: 1,
                per_page: 10
            },
            user: 'jeresig'
        }, opts);

        var params = url.parse('https://api.github.com/users/' + opts.user + '/repos?' + querystring.stringify(opts.query));
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
                    var repos = JSON.parse(data),
                        links = parseLinkHeader(quest.headers.link);
                    if (repos.message) {
                        reject({
                            message: 'Github repository not avaliable!'
                        });
                        return;
                    }
                    fulfill({
                        repos: repos,
                        links: links,
                        user: opts.user,
                        query: opts.query
                    });
                });
            })
            .on('error', function (err) {
                console.error(err);
                reject({
                    message: 'Github repository not avaliable!'
                });
            })
        ;
    });
};
