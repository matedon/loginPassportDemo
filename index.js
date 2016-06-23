'use strict';

/**
 * Use ECMAScript 6 standard!
 */
// require('babel-core/register', 'babel-preset-es2015');
require('babel-core/register')({
    "presets": ["es2015"]
});

require('./app/core.js');
