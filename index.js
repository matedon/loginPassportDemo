var port = process.env.PORT || 5000,
    express = require('express'),
    app = express(),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
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
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({
        extended: true
    }))
    .engine('handlebars', hbs.engine)
    .set('view engine', 'handlebars')
;

var renderPart = function (req, res, name, opts) {
    if (typeof name == 'undefined') {
        name = 'index';
    }
    opts = _.merge({
        assets: assets,
        layout: 'main'
    }, opts);
    if (req.xhr) {
        opts.layout = 'ajax';
    }
    res.render(name, opts);
};

var mailerTest = function () {
    var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport({
        host: 'smtp.mandrillapp.com',
        port: '587',
        auth: {
            user: 'info@talentscreener.com',
            pass: 'Ub7yiIhWBHb4lA88Ii1cjg'
        }
    });

// setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"Fred Foo" <foo@blurdybloop.com>', // sender address
        to: 'kotroczo.mate@virgo.hu', // list of receivers
        subject: 'Hello OK', // Subject line
        text: 'Hello world', // plaintext body
        html: '<b>Hello world</b>' // html body
    };

// send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
};

app.get('/', function (req, res) {
    mailerTest();
    renderPart.call(this, req, res, 'index');
});

app.listen(port, function () {
    console.log('App listening on port: ' + port);
});