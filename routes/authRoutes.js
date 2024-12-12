const express = require('express');
const {
    signup,
    login,
    verifyEmail,
    resetPassword,
    forgotPassword,
    deleteAccount,
    changePassword,
    googlelogin,
    naverlogin,
    naverCallback,
    kakaologin,
    googleloginCallback,
    googleProfile,
    naverProfile,
    kakaoProfile
} = require('./authController');
const ensureAuthenticated = require('./authMiddleware');
const passport = require('passport');

const router = express.Router();

if (!signup || !login || !verifyEmail || !resetPassword || !forgotPassword || !deleteAccount || !changePassword || !googlelogin || !naverlogin || !kakaologin || !googleloginCallback || !googleProfile || !naverProfile || !kakaoProfile) {
    console.log(naverlogin);
    console.log(kakaologin);
    console.log(googlelogin);
    console.log(signup);
    console.log(login);
    console.log(verifyEmail);
    console.log(resetPassword);
    console.log(forgotPassword);
    console.log(deleteAccount);
    console.log(changePassword);
    console.log(googleloginCallback);
    console.log(googleProfile);
    console.log(naverProfile);
    console.log(kakaoProfile);
    throw new Error('authController에서 가져온 함수 중 하나가 정의되지 않았습니다.');
}


router.get('/signup/callback', (req, res) => res.render('signup', { error: '' }));
router.post('/signup/callback', signup);

router.get('/login/callback', (req, res) => res.render('login', { error: '', success: '' }));
router.post('/login/callback', login);

router.get('/verify-email/:token', verifyEmail);

router.get('/reset-password/:token', (req, res) => res.render('resetPassword', { token: req.params.token, error: '' }));
router.post('/reset-password/:token', resetPassword);

router.post('/forgot-password', forgotPassword);

router.get('/forgot-password', (req, res) => res.render('forgotPassword', { error: '', success: '' }));
router.post('/forgot-password', forgotPassword);

// 프로필 페이지에 인증 미들웨어 추가
router.get('/profile', ensureAuthenticated, (req, res) => {
    const user = req.session.user;
    if (user) {
        res.render('profile', { 
            user, 
            error: '', 
            success: req.query.success || '' 
        });
    } else {
        res.redirect('/auth/login/callback');
    }
});

router.post('/delete-account', ensureAuthenticated, deleteAccount);

router.post('/change-password', ensureAuthenticated, changePassword);

router.get('/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('로그아웃 중 오류가 발생했습니다.');
        }
        res.redirect('/auth/login/callback');
    });
});




router.get('/googlelogin/', googlelogin);
router.post('/googlelogin/', googlelogin);

router.get('/googlelogin',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

router.get('/googlelogin/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    req.session.user = req.user;
    req.session.provider = 'google';
    res.redirect('/');
  }
);

router.get('/naverlogin', naverlogin);
router.get('/naverlogin/callback', passport.authenticate('naver', { failureRedirect: '/auth/login/callback' }), (req, res) => {
    req.session.user = req.user;
    req.session.provider = 'naver';
    res.redirect('/');
});

router.post('/naverlogin/callback', naverCallback);


router.get('/kakaologin', (req, res, next) => {
    if (req.session.kakaoAuth) {
        delete req.session.kakaoAuth;
    }
    passport.authenticate('kakao')(req, res, next);
});

router.get('/kakaologin/callback',
    passport.authenticate('kakao', { failureRedirect: '/' }),
    (req, res) => {
        req.session.user = req.user;
        req.session.provider = 'kakao';
        res.redirect('/');
    }
);

// Google 로그인 관련 라우트
router.get('/googlelogin', googlelogin);
router.post('/googlelogin/callback/', googleloginCallback);
router.get('/google-profile', ensureAuthenticated, (req, res) => {
    if (req.session.provider !== 'google') {
        return res.redirect('/');
    }
    res.render('googleProfile', {
        user: req.session.user,
        provider: 'google'
    });
});

// 로그아웃 라우트 추가
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('로그아웃 중 오류가 발생했습니다.');
        }
        res.clearCookie('connect.sid');
        res.redirect('/auth/login/callback');
    });
});

router.get('/naver-profile', ensureAuthenticated, (req, res) => {
    if (req.session.provider !== 'naver') {
        return res.redirect('/');
    }
    res.render('naverProfile', {
        user: req.session.user,
        provider: 'naver'
    });
});

router.get('/kakao-profile', ensureAuthenticated, kakaoProfile);

module.exports = router;