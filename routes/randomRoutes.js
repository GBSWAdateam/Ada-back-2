const express = require('express');
const router = express.Router();
const axios = require('axios');

console.log(process.env.TOUR_API_KEY);

if (!process.env.TOUR_API_KEY) {
    console.error('TOUR_API_KEY가 설정되지 않았습니다.');
    process.exit(1);
}

router.get('/', async (req, res) => {
    try {
        const tourApiKey = process.env.TOUR_API_KEY;

        const url = 'http://apis.data.go.kr/B551011/KorService1';
        const params = {
            serviceKey: tourApiKey,
            numOfRows: '20',
            pageNo: '1',
            MobileOS: 'ETC',
            MobileApp: 'AppTest',
            _type: 'json',
            arrange: 'A',
            areaCode: '1',
            contentTypeId: '12'
        };

        const response = await axios.get(url, { 
            params,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Tour API 오류:', error.message);
        res.status(500).send('Tour API 요청 실패');
    }
});

module.exports = router;