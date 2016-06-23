import {Strategy} from 'passport-local'
import * as users from './users'

export default (passport) => {

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        users.findById(id, (err, user) => {
            done(err, user)
        })
    })

    passport.use('local-login', new Strategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        (req, email, password, done) => {
            if (email) {
                email = email.toLowerCase()
            }
            // async
            process.nextTick(() => {
                users.findByEmail(email, (err, user) => {
                    if (err) {
                        return done(err)
                    }
                    if (!user) {
                        return done(null, false)
                    }
                    if (user.password != password) {
                        return done(null, false)
                    }
                    return done(null, user)
                })
            })
        })
    )

}
