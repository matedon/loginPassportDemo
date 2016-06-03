const
    LocalStrategy = require('passport-local').Strategy,
    users = require('./users');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        users.findById(id, function (err, user) {
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
                users.findByEmail(email, function (err, user) {
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
