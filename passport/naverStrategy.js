const passport = require('passport');
const NaverStrategy = require('passport-naver').Strategy;
const NaverUser = require('../models/naverUser');

module.exports = () => {
    passport.use(
        new NaverStrategy(
            {
                clientID: process.env.NAVER_ID,
                clientSecret: process.env.NAVER_SECRET,
                callbackURL: 'http://localhost:8080/auth/naverlogin/callback'
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails[0].value;
                    const name = profile.displayName;

                    let user = await NaverUser.findOne({ 
                        email: email 
                    });
                    
                    if (!user) {
                        user = await NaverUser.create({
                            email: email,
                            name: name,
                            snsId: profile.id,
                            provider: 'naver'
                        });
                    }

                    return done(null, user);
                } catch (error) {
                    console.error('Naver Strategy Error:', error);
                    return done(error);
                }
            }
        )
    );
};