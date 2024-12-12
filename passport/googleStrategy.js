const dotenv = require('dotenv');
dotenv.config();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GoogleUser = require('../models/googleUser');

module.exports = () => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID_2,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET_2,
    callbackURL: process.env.GOOGLE_CALLBACK_URI_2,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName || 'Google User';
      const googleId = profile.id;

      let user = await GoogleUser.findOne({ email });
      if (!user) {
        user = await GoogleUser.create({
          email,
          name,
          googleId,
          isVerified: true
        });
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  }));
};

passport.serializeUser((user, done) => {
    done(null, { id: user.id, provider: 'google' });
});

passport.deserializeUser(async ({ id, provider }, done) => {
    try {
        let user;
        if (provider === 'google') {
            user = await GoogleUser.findById(id);
        } else {
            // 다른 provider에 대한 처리
        }
        done(null, user);
    } catch (error) {
        done(error);
    }
});