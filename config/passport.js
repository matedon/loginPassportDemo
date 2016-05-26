var LocalStrategy = require('passport-local').Strategy;

var dbLocal = require('../db');

console.log(dbLocal);

// var aa = User.users.findByEmail('jack@example.com', function () {
//     console.log(arguments);
// });

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        dbLocal.users.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {
            if (email) {
                email = email.toLowerCase();
            }
            // async
            process.nextTick(function () {
                dbLocal.users.findByEmail(email, function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        return done(null, false);
                    }
                    if (user.password != password) {
                        return done(null, false);
                    }
                    return done(null, user);
                });
            });
        })
    );

};
