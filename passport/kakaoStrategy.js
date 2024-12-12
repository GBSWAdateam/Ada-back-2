const dotenv = require('dotenv');
dotenv.config();

const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const KakaoUser = require('../models/kakaoUser');

module.exports = () => {
    passport.use(
        new KakaoStrategy(
            {
                clientID: process.env.KAKAO_CLIENT_ID,
                clientSecret: process.env.KAKAO_CLIENT_SECRET,
                callbackURL: process.env.KAKAO_REDIRECT_URI,
                scope: ['account_email', 'profile_nickname']
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    console.log('Kakao profile:', profile);
                    
                    const kakaoAccount = profile._json.kakao_account;
                    let email = kakaoAccount?.email;
                    
                    if (!email) {
                        const randomString = Math.random().toString(36).substring(2, 8);
                        email = `kakao_${profile.id}_${randomString}@gmail.com`;
                    }

                    const nickname = profile.displayName || kakaoAccount.profile.nickname || 'Kakao User';

                    let user = await KakaoUser.findOne({ 
                        $or: [
                            { snsId: profile.id },
                            { email: email }
                        ]
                    });
                    
                    if (user) {
                        user.name = nickname;
                        user.email = email;
                        user.accessToken = accessToken;
                        user.refreshToken = refreshToken;
                        await user.save();
                    } else {
                        user = await KakaoUser.create({
                            email: email,
                            name: nickname,
                            snsId: profile.id,
                            provider: 'kakao',
                            accessToken,
                            refreshToken
                        });
                    }
                    return done(null, user);
                } catch (error) {
                    console.error('Kakao Strategy Error:', error);
                    return done(error);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        KakaoUser.findById(id)
            .then(user => done(null, user))
            .catch(err => done(err));
    });
};