var port = process.env.PORT || 5000,
    express = require('express'),
    app = express(),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    morgan = require('morgan'),
    passport = require('passport'),
    // dbLocal = require('./db'),
    Promise = require("bluebird"),
    lessMiddleware = require('less-middleware'),
    bodyParser = require('body-parser'),
    exphbs = require('express-handlebars'),
    assets = {
        styles: [
            'public/_build/css.css',
            'public/_build/less.css',
            'public/_build/fonts/fonts.css'
        ],
        scripts: [
            'public/_build/general.js'
        ]
    },
    timeStamp = (new Date()).getTime();

_.forEach(assets, function (group) {
    _.forEach(group, function (line, key) {
        group[key] = line + '?noCache=' + timeStamp;
    });
});

var hbs = exphbs.create({
    defaultLayout: "main",
    partialsDir: "views/partials/",
    layoutsDir: "views/layouts/",
    helpers: {
        equal: require("handlebars-helper-equal"),
        /**
         * Last argument is always a Handlebars argument!
         */
        styles: function () {
            var list = assets.styles;
            if (arguments.length > 1) {
                list = arguments[0];
            }
            var out = _.map(list, function (val) {
                return '<link rel="stylesheet" href="' + val + '"/>\n';
            });
            return out.join('');
        },
        scripts: function () {
            var list = assets.scripts;
            if (arguments.length > 1) {
                list = arguments[0];
            }
            var out = _.map(list, function (val) {
                return '<script src="' + val + '"></script>\n';
            });
            return out.join('');
        },
        jsonStringify: function () {
            var json;
            if (arguments.length > 1) {
                json = arguments[0];
            }
            return JSON.stringify(json);
        }
    }
});

app
// .use(auth.connect(basic))
    .use('/public/less', lessMiddleware(path.join(__dirname, 'public', 'less'), {
        force: true,
        debug: true
    }))
    .use('/bower_components', express.static('bower_components'))
    .use('/public', express.static('public'))
    .use(require('express-session')({
        secret: '3289rsldllfdsa--s',
        resave: false,
        saveUninitialized: false
    }))
    .use(passport.initialize())
    .use(passport.session())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({
        extended: true
    }))
    .use(morgan('dev'))
    .engine('handlebars', hbs.engine)
    .set('view engine', 'handlebars')
;

require('./app/routes.js')(app, passport, function (req, res, name, opts) {
    if (typeof name == 'undefined') {
        name = 'index';
    }
    opts = _.merge({
        assets: assets,
        layout: 'main',
        req: req
    }, opts);
    if (req.xhr) {
        opts.layout = 'ajax';
    }
    res.render(name, opts);
});

require('./config/passport')(passport);

app.listen(port, function () {
    console.log('App listening on port: ' + port);
});