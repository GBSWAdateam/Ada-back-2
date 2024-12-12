const User = require('../models/user');
const NaverUser = require('../models/naverUser');
const GoogleUser = require('../models/googleUser');
const KakaoUser = require('../models/kakaoUser');

const autoLoginMiddleware = async (req, res, next) => {
    try {
        // 이미 로그인된 경우 패스
        if (req.session.user) {
            // 세션 만료 시간 갱신
            req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7일
            return next();
        }

        // 자동 로그인 토큰 확인
        const autoLoginToken = req.cookies.autoLoginToken;
        if (!autoLoginToken) {
            return next();
        }

        // provider별로 사용자 찾기
        let user;
        const [userId, provider] = autoLoginToken.split(':');

        switch (provider) {
            case 'local':
                user = await User.findById(userId);
                break;
            case 'naver':
                user = await NaverUser.findById(userId);
                break;
            case 'google':
                user = await GoogleUser.findById(userId);
                break;
            case 'kakao':
                user = await KakaoUser.findById(userId);
                break;
        }

        if (!user) {
            res.clearCookie('autoLoginToken');
            return next();
        }

        // 세션에 사용자 정보 저장
        req.session.user = {
            _id: user._id,
            email: user.email,
            name: user.name,
            provider: provider
        };
        req.session.provider = provider;

        next();
    } catch (error) {
        console.error('Auto login error:', error);
        next();
    }
};

module.exports = autoLoginMiddleware; 