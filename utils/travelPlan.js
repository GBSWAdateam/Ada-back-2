const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function generateTravelPlan(start, end, keywords, budget, days) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: `여행 경로를 제안해줘. 출발지는 ${start}, 목적지는 ${end}, 키워드는 ${keywords}, 예산은 ${budget}원, 여행 기간은 ${days}일이야.`,
                },
            ],
        });

        if (response && response.choices && response.choices.length > 0) {
            return response.choices[0].message.content;
        } else {
            throw new Error('OpenAI API 응답이 예상과 다릅니다.');
        }
    } catch (error) {
        console.error('OpenAI API 호출 오류:', error);
        throw new Error('여행 경로 생성 중 오류가 발생했습니다.');
    }
}

module.exports = {
    generateTravelPlan,
}; 