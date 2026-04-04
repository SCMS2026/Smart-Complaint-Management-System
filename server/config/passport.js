const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/authModels');

// Debug logging
console.log('=== GOOGLE OAUTH CONFIG ===');
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...');
console.log('Callback URL:', process.env.GOOGLE_CALLBACK_URL);
console.log('Client Secret Present:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('===========================');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('✅ Google OAuth Success - Profile:', profile.emails[0].value);
        const googleId = profile.id;
        const email = profile.emails[0].value;
        const profileImage = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : "";

        let user = await User.findOne({ googleId });

        if (user) {
          console.log('✅ User exists:', user.email);
          // Update profileImage on every login to keep it fresh
          if (profileImage && user.profileImage !== profileImage) {
            await User.findByIdAndUpdate(user._id, { profileImage });
            user.profileImage = profileImage;
          }
          return done(null, user);
        }

        // Check if email already exists
        let existingEmailUser = await User.findOne({ email });
        if (existingEmailUser) {
          console.log('✅ User with email exists:', email);
          // Attach Google ID to existing user
          existingEmailUser.googleId = googleId;
          existingEmailUser.profileImage = profileImage || existingEmailUser.profileImage;
          existingEmailUser.isVerified = true;
          await existingEmailUser.save();
          return done(null, existingEmailUser);
        }

        const newUser = new User({
          name: profile.displayName,
          email,
          googleId,
          profileImage,
          isVerified: true
        });

        await newUser.save();
        console.log('✅ New user created:', newUser.email);
        return done(null, newUser);
      } catch (err) {
        console.error('❌ Google Strategy Error:', err.message);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
