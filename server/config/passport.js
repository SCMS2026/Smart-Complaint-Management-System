const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/authModels");
require("dotenv").config();

// Google Login Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:9060/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        // Create new user if not found
        const newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          profileImage:
            profile.photos && profile.photos.length > 0
              ? profile.photos[0].value
              : "",
          isVerified: true,
        });

        await newUser.save();
        done(null, newUser);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// Store user id in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Get user from id stored in session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
