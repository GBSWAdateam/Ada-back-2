const express = require('express');
const TourAPI = require('../utils/tourAPI');

const router = express.Router();

console.log(process.env.KAKAO_MAP_API_KEY);

router.get('/recommended', async (req, res) => {
    try {
        const tourAPI = new TourAPI();
        const areaCode = 1; // 특정 지역 코드 (예: 서울)
        const contentTypeId = 12; // 관광지
        const recommendedPlaces = await tourAPI.getAreaBasedList(areaCode, contentTypeId);

        // 응답 데이터 구조 확인
        if (recommendedPlaces && recommendedPlaces.response && recommendedPlaces.response.body && recommendedPlaces.response.body.items) {
            res.json(recommendedPlaces.response.body.items.item || []);
        } else {
            res.status(500).json({ error: '추천 장소 데이터를 가져오는 중 오류가 발생했습니다.' });
        }
    } catch (error) {
        console.error('추천 장소를 가져오는 중 오류:', error);
        res.status(500).json({ error: '추천 장소를 가져오는 중 오류가 발생했습니다.' });
    }
});

module.exports = router;