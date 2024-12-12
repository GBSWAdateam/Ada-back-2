const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

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