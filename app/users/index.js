'use strict';

import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';

const loadUserRecors = () => {
    return new Promise((fulfill, reject) => {
        let filePath = path.join(__dirname, 'users.json');
        fs.access(filePath, fs.R_OK, (err) => {
            let records = [];
            if (err) {
                console.error('error', err);
                reject(err);
            } else {
                let data = fs.readFileSync(filePath);
                records = JSON.parse(data);
            }
            fulfill(records);
        });
    });
}

export function findById (id, cb) {
    loadUserRecors()
        .then((records) => {
            let idx = id - 1;
            if (records[idx]) {
                cb(null, records[idx]);
            } else {
                cb(new Error('User ' + id + ' does not exist'));
            }
        })
    ;
}

export function findByEmail (email, cb) {
    loadUserRecors()
        .then((records) => {
            for (let i = 0, len = records.length; i < len; i++) {
                let record = records[i];
                if (record.email === email) {
                    return cb(null, record);
                }
            }
            return cb(null, null);
        })
    ;
}

export function findByUsername (username, cb) {
    loadUserRecors()
        .then((records) => {
            for (let i = 0, len = records.length; i < len; i++) {
                let record = records[i];
                if (record.username === username) {
                    return cb(null, record);
                }
            }
            return cb(null, null);
        })
    ;
}