const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

class OpenAIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async generateOptimalRoute(start, waypoints, end, preferences, budget, days, routeType, transportMode, arrivalTime, avoidAreas, scenicRoutes, realTimeTraffic, weatherInfo) {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: `여행 경로를 추천해주세요:
                    출발지: ${start}
                    경유지: ${waypoints.join(', ')}
                    도착지: ${end}
                    선호도: ${preferences}
                    예산: ${budget}원
                    여행일수: ${days}일
                    경로 유형: ${routeType}
                    교통 수단: ${transportMode}
                    도착 시간: ${arrivalTime}
                    피해야 할 지역: ${avoidAreas}
                    경치 좋은 경로: ${scenicRoutes}
                    실시간 교통 정보: ${realTimeTraffic}
                    날씨 정보: ${weatherInfo}
                    Google 지도 링크와 호텔 링크를 포함해주세요.`
                }],
                temperature: 0.7,
                max_tokens: 3000
            });

            const content = response.choices[0].message.content;
            const googleMapLinks = content.match(/(https:\/\/www\.google\.com\/maps\/[^\s]+)/g);
            const hotelLinks = content.match(/(https:\/\/[^\s]+hotel[^\s]+)/g);

            let formattedContent = content;
            if (googleMapLinks) {
                googleMapLinks.forEach(link => {
                    formattedContent = formattedContent.replace(link, `<a href="${link}" target="_blank">Google 지도</a>`);
                });
            }
            if (hotelLinks) {
                hotelLinks.forEach(link => {
                    formattedContent = formattedContent.replace(link, `<a href="${link}" target="_blank">호텔 링크</a>`);
                });
            }

            return formattedContent;
        } catch (error) {
            console.error('OpenAI Error:', error);
            throw error;
        }
    }
}

router.post('/optimal', async (req, res) => {
    try {
        const { start, waypoints, end, preferences, budget, days, routeType, transportMode, arrivalTime, avoidAreas, scenicRoutes, realTimeTraffic, weatherInfo } = req.body;
        const openAIService = new OpenAIService();
        const optimalRoute = await openAIService.generateOptimalRoute(start, waypoints, end, preferences, budget, days, routeType, transportMode, arrivalTime, avoidAreas, scenicRoutes, realTimeTraffic, weatherInfo);
        res.json({ optimalRoute });
    } catch (error) {
        console.error('최적 경로 생성 중 오류:', error);
        res.status(500).json({ error: '최적 경로 생성 중 오류가 발생했습니다.' });
    }
});

module.exports = router;