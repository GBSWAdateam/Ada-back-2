const express = require('express');
const TourAPI = require('../utils/tourAPI');
const Place = require('../models/Place');
const User = require('../models/user');
const LikedPlace = require('../models/LikedPlace');
const OpenAI = require('openai');

const router = express.Router();
const tourAPI = new TourAPI();

router.get('/random', async (req, res) => {
    try {
        const recommendedPlaces = await tourAPI.getAreaBasedList(1, 12); // 예시로 areaCode 1, contentTypeId 12 사용
        res.json(recommendedPlaces);
    } catch (error) {
        console.error('추천 장소를 가져오는 중 오류:', error);
        res.status(500).json({ error: '추천 장소를 가져오는 중 오류가 발생했습니다.' });
    }
});

class OpenAIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async generateOptimalRoute(start, end, preferences, budget, days) {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: `여행 경로를 추천해주세요:
                    출발지: ${start}
                    도착지: ${end}
                    선호도: ${preferences}
                    예산: ${budget}원
                    여행일수: ${days}일`
                }],
                temperature: 0.7,
                max_tokens: 1000
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI Error:', error);
            throw error;
        }
    }
}

// 찜한 장소 기능을 likedRoutes.js로 이동
router.get('/liked', async (req, res) => {
    try {
        const userId = req.session.user._id;
        const likedPlaces = await LikedPlace.find({ userId });
        res.json(likedPlaces);
    } catch (error) {
        console.error('찜한 장소 조회 중 오류:', error);
        res.status(500).json({ error: '찜한 장소를 가져오는 중 오류가 발생했습니다.' });
    }
});

// 최적 경로 기능을 optimalRoutes.js로 이동
router.post('/optimal', async (req, res) => {
    try {
        const { start, end, preferences, budget, days } = req.body;
        const openAIService = new OpenAIService();
        const optimalRoute = await openAIService.generateOptimalRoute(start, end, preferences, budget, days);
        res.json({ optimalRoute });
    } catch (error) {
        console.error('최적 경로 생성 중 오류:', error);
        res.status(500).json({ error: '최적 경로 생성 중 오류가 발생했습니다.' });
    }
});

module.exports = router;