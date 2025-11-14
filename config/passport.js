const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

passport.use(
  new LocalStrategy(
    { passReqToCallback: true }, // For username access in middleware
    async (req, username, password, done) => {
      try {
        // For username access in middleware
        req.session.attemptedUsername = username;

        const user = await User.findByUsername(username);
        if (!user) {
          return done(null, false, { message: 'User does not exist.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        delete req.session.attemptedUsername;
        return done(null, user, {
          message: 'You have been successfully logged in!',
        });
      } catch (err) {
        delete req.session.attemptedUsername;
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});
