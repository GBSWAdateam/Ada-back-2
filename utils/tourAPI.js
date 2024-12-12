const axios = require('axios');

class TourAPI {
    constructor() {
        this.apiKey = process.env.TOUR_API_KEY;
        this.baseUrl = 'http://apis.data.go.kr/B551011/KorService1';
    }

    async getAreaBasedList(areaCode, contentTypeId, pageNo = 1, numOfRows = 30) {
        try {
            const url = `${this.baseUrl}/areaBasedList1`;
            const params = {
                serviceKey: decodeURIComponent(this.apiKey),
                numOfRows: numOfRows,
                pageNo: pageNo,
                MobileOS: 'ETC',
                MobileApp: 'AppTest',
                _type: 'json',
                arrange: 'R',
                contentTypeId: contentTypeId,
                areaCode: areaCode
            };

            const response = await axios.get(url, { params });
            
            console.log('Tour API 응답:', JSON.stringify(response.data, null, 2));
            
            if (response.data?.response?.body?.items?.item) {
                return response.data.response.body.items.item;
            }
            
            return [];
        } catch (error) {
            console.error('Tour API 오류:', error.response?.data || error.message);
            throw error;
        }
    }

    // 지역별 관광지 검색
    async getRegionPlaces(region) {
        const AREA_CODES = {
            '서울': 1, '인천': 2, '대전': 3, '대구': 4,
            '광주': 5, '부산': 6, '울산': 7, '세종': 8,
            '경기': 31, '강원': 32, '충북': 33, '충남': 34,
            '경북': 35, '경남': 36, '전북': 37, '전남': 38, '제주': 39
        };

        const areaCode = AREA_CODES[region];
        if (!areaCode) return [];
        
        return this.getAreaBasedList(areaCode, 12);
    }
}

module.exports = TourAPI;