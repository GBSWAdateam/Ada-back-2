const dotenv = require('dotenv');   
dotenv.config();
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const express = require('express');
const passport = require('passport');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const GoogleUser = require('../models/googleUser');
const NaverUser = require('../models/naverUser');

// 이메일 인증을 위한 환경 변수
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const GMAIL_USER = process.env.GMAIL_USER;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// Google OAuth2를 위한 환경 변수
const GOOGLE_CLIENT_ID_2 = process.env.GOOGLE_CLIENT_ID_2;
const GOOGLE_CLIENT_SECRET_2 = process.env.GOOGLE_CLIENT_SECRET_2;
const GOOGLE_REDIRECT_URI_2 = process.env.GOOGLE_REDIRECT_URI_2;
const GOOGLE_CALLBACK_URI_2 = process.env.GOOGLE_CALLBACK_URI_2;

// 카카오 OAuth2를 위한 환경 변수
const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;
const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;

// 이메일 인증용 OAuth2 클라이언트
const emailOauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

emailOauth2Client.setCredentials({
  refresh_token: GOOGLE_REFRESH_TOKEN
});

// Google OAuth2 클라이언트
const googleOauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID_2,
  GOOGLE_CLIENT_SECRET_2,
  GOOGLE_REDIRECT_URI_2
);

// 카카오 OAuth2 클라이언트
const kakaoOauth2Client = new OAuth2Client(
  KAKAO_CLIENT_ID,
  KAKAO_CLIENT_SECRET,
  KAKAO_REDIRECT_URI
);

async function sendEmail(to, subject, html) {
  try {
    const accessToken = await emailOauth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: GMAIL_USER,
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        refreshToken: GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    await transporter.sendMail({
      from: `"Support" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', error.response?.data);
    throw new Error('이메일 전송 중 오류가 발생했습니다.');
  }
}

// 로그인 성공 시 자동 로그인 토큰 설정 함수
const setAutoLoginToken = (res, userId, provider) => {
    res.cookie('autoLoginToken', `${userId}:${provider}`, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    });
};

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // 일반 로그인 사용자를 찾습니다.
        const existingUser = await User.findOne({ email, provider: 'local' });
        if (existingUser) {
            return res.render('signup', { error: '이미 등록된 이메일입니다.' });
        }

        const user = new User({ name, email, password, provider: 'local' });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const verificationLink = `${req.protocol}://${req.get('host')}/auth/verify-email/${token}`;

        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="text-align: center; color: #333;">이메일 인증</h2>
                <p style="text-align: center; color: #555;">안녕하세요, ${user.name}님!</p>
                <p style="text-align: center; color: #555;">아 버튼을 클릭하여 이메일 인증을 완료하세요.</p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">이메일 인증하기</a>
                </div>
                <p style="text-align: center; color: #999;">감사합니다!</p>
            </div>
        `;

        await sendEmail(user.email, '이메일 인증', emailContent);
        const successMessage = `
            <div class="success-message">
                <p>회가입에 성공했습니다! 이메일을 확인하여 인증해주세요.</p>
                <a href="/auth/login">로그인</a>
            </div>
        `;

        res.render('login', {
            success: successMessage,
            error: null
        });
    } catch (error) {
        res.render('signup', { error: '회원가입 중 오류가 발생했습니다.' });
        console.error(error);
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.render('login', { error: '이메일이 잘못된 형식입니다.', success: '' });
        }

        if (!user.isVerified) {
            return res.render('login', { error: '이메일 인증이 필요합니다. 이메일을 확인해주세요.', success: '' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(password);
            console.log(user.password);
            console.log('Password does not match');
            return res.render('login', { error: '비밀번호가 잘못되었습니다.', success: '' });
        }

        // JWT 토큰 생성 및 쿠키 설정
        const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET);
        res.cookie('accessToken', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24시간
        });

        req.session.user = user;
        req.session.provider = 'local'; // 로그인 방법 저장
        console.log('User logged in successfully');
        res.redirect('/');
    } catch (error) {
        console.error('Error during login:', error);
        res.render('login', { error: '로그인 중 오류가 발생했습니다.', success: '' });
    }
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.params;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.render('verifyEmail', { error: '유효하지 않은 사용자입니다.', success: null });
        }

        user.isVerified = true;
        await user.save();

        // 이메일 인증 성공 메시지와 함께 로그인 페이지로 리다이렉트
        res.render('login', {
            success: '이메일이 인증되었습니다. 로그인 해주세요.',
            error: null
        });
    } catch (error) {
        res.render('verifyEmail', { error: '유효하지 않은 토큰입니다.', success: null });
    }
};

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;
    try {
        if (newPassword !== confirmPassword) {
            return res.render('resetPassword', { token, error: '비밀번호가 일치하지 않습니다.', success: '' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.render('resetPassword', { token, error: '유효하지 않은 사용자입니다.', success: '' });
        }

        // 새로운 비밀번호 해시  저
        user.password = await user.hashPassword(newPassword);
        await user.save({ validateBeforeSave: false });  // pre save 미들웨어 건너뛰기

        // 비밀번호 재설정 성공 메시지와 함께 로그인 페이지로 리다이렉트
        res.render('login', { success: '비밀번호가 변경되었습니다. 로그인 해주세요.', error: '' });
    } catch (error) {
        console.error('비밀번호 재설정 오류:', error);
        res.render('resetPassword', { token, error: '비밀번호 재설정 중 오류가 발생했습니다.', success: '' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('forgotPassword', { error: '등록된 이메일이 아닙니다.', success: '' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetLink = `${req.protocol}://${req.get('host')}/auth/reset-password/${token}`;

        await sendEmail(user.email, '비밀번호 재설정 요청', `<a href="${resetLink}">비밀번호를 재설정하려면 여를 클릭하세요.</a>`);

        res.render('forgotPassword', { success: '비밀번호 재설정 이메일을 송신했습니다.', error: '' });
    } catch (error) {
        res.render('forgotPassword', { error: '이메일 전송 중 오류가 발생했습니다.', success: '' });
        console.error(error);
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const provider = req.session.provider;
        
        // provider에 따라 적절한 모델 선택
        const UserModel = provider === 'google' ? GoogleUser : User;
        
        await UserModel.findByIdAndDelete(userId);
        
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('세션 종료 중 오류가 발생했습니다.');
            }
            res.clearCookie('connect.sid'); // 세션 쿠키 삭제
            res.redirect('/auth/login/callback');
        });
    } catch (error) {
        console.error('Delete Account Error:', error);
        res.status(500).send('계정 삭제 중 오류가 발생했습니다.');
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    try {
        const user = await User.findById(req.session.user._id);
        
        // 현재 비밀번호 확인
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.render('profile', { 
                user: req.session.user, 
                error: '현재 비밀번호가 잘못되습니다.', 
                success: null 
            });
        }

        // 새 비밀번호 확인
        if (newPassword !== confirmPassword) {
            return res.render('profile', { 
                user: req.session.user, 
                error: '새 비밀번호가 일치하지 않습니다.', 
                success: null 
            });
        }

        // 새 비밀번호 해시화 및 저장
        user.password = await user.hashPassword(newPassword);
        await user.save({ validateBeforeSave: false });  // pre save 미들웨어 건너뛰기

        res.render('profile', { 
            user: req.session.user, 
            success: '비밀번호가 변경되었습니다.', 
            error: null 
        });
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        res.render('profile', { 
            user: req.session.user, 
            error: '비밀번호 변경 중 오류가 발생했습니다.', 
            success: null 
        });
    }
};




//kakao route
exports.kakaologin = passport.authenticate('kakao');

exports.kakaologinCallback = (req, res, next) => {
    passport.authenticate('kakao', (err, user, info) => {
        if (err) return res.status(500).send('카카오 로그인 중 오류가 발생했습니다.');
        if (!user) return res.redirect('/auth/login');
        
        req.logIn(user, (loginErr) => {
            if (loginErr) return res.status(500).send('로그인 중 오류가 발생했습니다.');
            req.session.provider = 'kakao'; // 로그인 방법 저장
            return res.redirect('/');
        });
    })(req, res, next);
};

exports.kakaoProfile = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/auth/login/callback');
        }

        const user = {
            name: req.session.user.name,
            email: req.session.user.email
        };

        res.render('../kakaologin/kakaoprofile', { 
            user: user,
            success: null,
            error: null
        });
    } catch (error) {
        console.error('Kakao Profile Error:', error);
        res.redirect('/auth/login/callback');
    }
};  

//naver route
exports.naverlogin = (req, res, next) => {
    passport.authenticate('naver')(req, res, next);
};

//naver callback route
exports.naverCallback = async (req, res) => {
    try {
        const { email, name, token } = req.body;
        console.log('Received naver data:', { email, name, token });

        let naverUser = await NaverUser.findOne({ email: email });
        
        if (!naverUser) {
            naverUser = await NaverUser.create({
                email: email,
                name: name,
                snsId: token,
                provider: 'naver-2'
            });
        }

        req.session.user = {
            _id: naverUser._id,
            email: naverUser.email,
            name: naverUser.name,
            provider: 'naver-2'
        };
        
        req.session.provider = 'naver-2';
        
        // 세션 저장 후 '/'로 리다이렉트
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.redirect('/auth/login/callback');
            }
            res.redirect('/');
        });
        
    } catch (error) {
        console.error('Naver Login Error:', error);
        res.redirect('/auth/login/callback');
    }
};

//google route
exports.googlelogin = async (req, res) => {

    try {
        res.render('../googlelogin/googlelogin', {
            clientId: process.env.GOOGLE_CLIENT_ID_2,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET_2,
            redirectUri: process.env.GOOGLE_CALLBACK_URI_2
        });
    } catch (error) {
        console.error('Google Login Render Error:', error);
        res.redirect('/auth/login');
    }
};

//google callback route
exports.googleLoginCallback = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await googleOauth2Client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID_2
        });

        const payload = ticket.getPayload();
        const googleId = payload.sub;

        let googleUser = await GoogleUser.findOne({ email: payload.email });
        
        if (!googleUser) {
            googleUser = await GoogleUser.create({
                email: payload.email,
                name: payload.name,
                googleId,
                provider: 'google'
            });
        }

        // 세션에 저장할 때 provider 정보를 명확하게 포함
        const userForSession = {
            ...googleUser.toObject(),
            provider: 'google',
            googleId: googleId
        };

        req.session.user = userForSession;
        req.session.provider = 'google';

        console.log('Session after login:', req.session); // 디버깅용

        res.json({ 
            success: true, 
            redirectUrl: '/'
        });
    } catch (error) {
        console.error('Google Login Error:', error);
        res.status(500).json({ 
            success: false, 
            message: '로그인 처리 중 오류가 발생했습니다.' 
        });
    }
};

//google profile route
exports.googleProfile = async (req, res) => {
    try {
        if (!req.session.user || req.session.provider !== 'google') {
            return res.redirect('/auth/login/callback');
        }

        const googleUser = await GoogleUser.findOne({ 
            email: req.session.user.email
        });
        
        if (!googleUser) {
            return res.redirect('/auth/login/callback');
        }

        res.render('../googlelogin/googleProfile', { 
            user: googleUser,
            success: null,
            error: null
        });
    } catch (error) {
        console.error('Google Profile Error:', error);
        res.redirect('/auth/login/callback');
    }
};

//naver profile route
exports.naverProfile = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/auth/login/callback');
        }
        res.render('../naverlogin/naverProfile', { user: req.session.user });
    } catch (error) {
        console.error('Naver Profile Error:', error);
        res.redirect('/auth/login/callback');
    }
};

// 로그아웃 시 토큰 제거
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('로그아웃 중 오류가 발생했습니다.');
        }
        res.clearCookie('autoLoginToken');
        res.clearCookie('connect.sid');
        res.redirect('/auth/login/callback');
    });
};

module.exports = {
    router,
    signup: exports.signup,
    login: exports.login,
    verifyEmail: exports.verifyEmail,
    resetPassword: exports.resetPassword,
    forgotPassword: exports.forgotPassword,
    deleteAccount: exports.deleteAccount,
    changePassword: exports.changePassword,
    googlelogin: exports.googlelogin,
    googleloginCallback: exports.googleLoginCallback,
    naverlogin: exports.naverlogin,
    kakaologin: exports.kakaologin,
    naverCallback: exports.naverCallback,
    googleProfile: exports.googleProfile,
    naverProfile: exports.naverProfile,
    kakaologinCallback: exports.kakaologinCallback,
    kakaoProfile: exports.kakaoProfile,
    logout: exports.logout
};