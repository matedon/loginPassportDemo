import express from 'express';
import path from 'path';
import _ from 'lodash';
import morgan from 'morgan';
import Promise from 'bluebird';
import lessMiddle from 'less-middleware';
import phpdate from 'phpdate-js';
import exphbs from 'express-handlebars';

import assetJs from '../public/_build/scripts.json';
import assetCss from '../public/_build/styles.json';

const
    port = process.env.PORT || 5000,
    app = express();


var hbs = exphbs.create({
    defaultLayout: "main",
    partialsDir: "views/partials/",
    layoutsDir: "views/layouts/",
    helpers: {
        equal: require("handlebars-helper-equal"),
        /**
         * Last argument is always a Handlebars argument!
         */
        styles() {
            let list = assetCss;
            if (arguments.length > 1) {
                list = arguments[0];
            }
            return _.chain(list)
                .map((val) => '<link rel="stylesheet" href="' + val + '"/>\n')
                .join('')
                .value();
        },
        scripts() {
            let list = assetJs;
            if (arguments.length > 1) {
                list = arguments[0];
            }
            return _.chain(list)
                .map((val) => '<script src="' + val + '"></script>\n')
                .join('')
                .value();
        },
        dateFormat() {
            let dateFormat = 'Y.m.d. H:i:s',
                dateText = (new Date()).getTime();
            if (arguments.length > 1) {
                dateText = arguments[0];
            }
            if (arguments.length > 2) {
                dateFormat = arguments[1];
            }
            return phpdate(dateFormat, dateText);
        },
        jsonStringify() {
            let json;
            if (arguments.length > 1) {
                json = arguments[0];
            }
            return JSON.stringify(json);
        }
    }
});

app
    .use('/public/less', lessMiddle(path.join(__dirname, 'public', 'less'), {
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
    .use(morgan('dev'))
    .engine('handlebars', hbs.engine)
    .set('view engine', 'handlebars')
;

import Routes from './routes.js';
Routes(app);

app.listen(port, () => {
    console.log('App listening on port: ' + port);
});