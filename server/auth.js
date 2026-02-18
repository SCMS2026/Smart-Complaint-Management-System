const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const router = express.Router();

passport.use(new GoogleStrategy({
    clientID: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: '/api/auth/google/callback'
  },
  function(accessToken, refreshToken, profile, cb) {
    // Save or update user in DB here
    return cb(null, profile);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

router.use(session({ secret: 'SECRET', resave: false, saveUninitialized: true }));
router.use(passport.initialize());
router.use(passport.session());

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect or send token
    res.redirect('/');
  }
);

module.exports = router;
