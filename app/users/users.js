const
    Promise = require("bluebird"),
    fs = require('fs'),
    path = require('path');

function loadUserRecors() {
    return new Promise(function (fulfill, reject) {
        var filePath = path.join(__dirname, 'users.json');
        fs.access(filePath, fs.R_OK, function (err) {
            var records = [];
            if (err) {
                console.error('error', err);
                reject(err);
            } else {
                var data = fs.readFileSync(filePath);
                records = JSON.parse(data);
            }
            fulfill(records);
        });
    });
};

exports.findById = function (id, cb) {
    loadUserRecors()
        .then(function (records) {
            var idx = id - 1;
            if (records[idx]) {
                cb(null, records[idx]);
            } else {
                cb(new Error('User ' + id + ' does not exist'));
            }
        })
    ;
};

exports.findByEmail = function (email, cb) {
    loadUserRecors()
        .then(function (records) {
            for (var i = 0, len = records.length; i < len; i++) {
                var record = records[i];
                if (record.email === email) {
                    return cb(null, record);
                }
            }
            return cb(null, null);
        })
    ;
};

exports.findByUsername = function (username, cb) {
    loadUserRecors()
        .then(function (records) {
            for (var i = 0, len = records.length; i < len; i++) {
                var record = records[i];
                if (record.username === username) {
                    return cb(null, record);
                }
            }
            return cb(null, null);
        })
    ;
};