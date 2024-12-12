// routes/mapRoutes.js
const express = require('express');
const router = express.Router();
const TourAPI = require('../utils/tourAPI');

router.get('/', async (req, res) => {
    try {
        // Tour API 인스턴스 생성
        const tourAPI = new TourAPI();
        // 초기 데이터는 서울(1) 관광지(12) 기준으로 가져오기
        const places = await tourAPI.getAreaBasedList(1, 12);
        
        // EJS에 데이터 전달
        res.render('map', { 
            title: '관광지 지도',
            places: places,
            KAKAO_MAP_API_KEY: process.env.KAKAO_MAP_API_KEY
        });
    } catch (error) {
        console.error('Tour API 데이터 로드 실패:', error);
        res.render('map', { 
            title: '관광지 지도',
            places: [],
            KAKAO_MAP_API_KEY: process.env.KAKAO_MAP_API_KEY,
            error: '데이터를 불러오는데 실패했습니다.'
        });
    }
});

// Tour API 데이터 API 엔드포인트
router.get('/api/places', async (req, res) => {
    try {
        const tourAPI = new TourAPI();
        const places = await tourAPI.getAreaBasedList(1, 12);
        res.json(places);
    } catch (error) {
        console.error('Tour API 데이터 로드 실패:', error);
        res.status(500).json({ error: '데이터를 불러오는데 실패했습니다.' });
    }
});

module.exports = router;