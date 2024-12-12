const dotenv = require('dotenv');
dotenv.config();

const axios = require('axios');
const passport = require('passport');
const localStrategy = require('./localStrategy'); // 경로가 올바른지 확인하세요
const naver = require('./naverStrategy'); // 네이버서버로 로그인할때
const google = require('./googleStrategy'); // 구글 전략
const kakao = require('./kakaoStrategy'); // 카카오 전략 추가

const User = require('../models/user');

module.exports = () => {
  passport.serializeUser((user, done) => {
      done(null, user.id);
   });

  passport.deserializeUser((id, done) => {
      User.findOne({ where: { id } })
         .then(user => done(null, user))
         .catch(err => done(err));
   });

   localStrategy();
   naver(); // 네이버 전략 등록
   google(); // 구글 전략 등록
   kakao(); // 카카오 전략 등록
};