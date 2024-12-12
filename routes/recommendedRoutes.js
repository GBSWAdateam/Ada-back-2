const express = require('express');
const router = express.Router();
const TourAPI = require('../utils/tourAPI');

const CONTENT_TYPES = {
    12: '관광지',
    14: '문화시설',
    15: '축제/공연/행사',
    25: '여행코스',
    28: '레포츠',
    32: '숙박',
    38: '쇼핑',
    39: '음식'
};

router.get('/', async (req, res) => {
    const { region, contentType = '12', page = 1 } = req.query;
    try {
        const tourAPI = new TourAPI();
        let response;
        
        if (region) {
            const AREA_CODES = {
                '서울': 1, '인천': 2, '대전': 3, '대구': 4,
                '광주': 5, '부산': 6, '울산': 7, '세종': 8,
                '경기': 31, '강원': 32, '충북': 33, '충남': 34,
                '경북': 35, '경남': 36, '전북': 37, '전남': 38, '제주': 39
            };
            
            const areaCode = AREA_CODES[region] || 1;
            response = await tourAPI.getAreaBasedList(areaCode, contentType, page);
        } else {
            response = await tourAPI.getAreaBasedList(1, contentType, page);
        }

        console.log('API 응답 데이터:', response);

        if (!Array.isArray(response)) {
            console.error('API 응답이 배열이 아님:', response);
            return res.status(500).json({ error: '잘못된 응답 형식' });
        }

        const formattedPlaces = response.map(place => ({
            title: place.title,
            addr1: place.addr1,
            mapx: place.mapx,
            mapy: place.mapy,
            firstimage: place.firstimage,
            tel: place.tel,
            contentType: CONTENT_TYPES[place.contenttypeid] || '기타'
        }));

        res.json(formattedPlaces);
    } catch (error) {
        console.error('추천 장소 조회 실패:', error);
        res.status(500).json({ error: '데이터 로드 실패', details: error.message });
    }
});

module.exports = router;