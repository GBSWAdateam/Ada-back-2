const authMiddleware = (req, res, next) => {
    // 인증 코드가 이미 사용되었는지 확인
    if (req.session.kakaoAuth && req.session.kakaoAuth.authenticated) {
        const timePassed = Date.now() - req.session.kakaoAuth.timestamp;
        if (timePassed > 300000) { // 5분이 지났다면
            delete req.session.kakaoAuth;
            return res.redirect('/auth/kakaologin'); // 재인증 요청
        }
    }
    next();
};

module.exports = authMiddleware; 