require("dotenv").config();
const OpenAIApi = require('openai');

const openai = new OpenAIApi({
    api_key: process.env.OPENAI_API_KEY,
});

// 일기 내용을 바탕으로 감정 정보 및 감성 정보를 추출한다.
exports.analysisDiary = async (content) => {
    try {
        const messages = [];

        // 시스템 프롬프트로 AI의 동작을 명시한다.
        const systemPrompts = [
            "당신은 '공감 다이어리'라는 일기 작성 서비스의 AI 일기 분석 어시스턴트입니다.",
            "지금부터 당신에게 사용자가 작성한 일기의 내용이 주어질 것입니다.",
            "첫 번째로, 당신은 사용자가 작성한 일기의 내용을 토대로 일기에 포함되어 있는 감정을 분석합니다.",
            "['기쁨', '사랑', '뿌듯함', '실망', '우울', '불안', '분노', '놀람', '외로움', '공포', '후회', '부끄러움']의 12가지 종류의 감정들 중에서 사용자가 작성한 일기의 내용에 포함되어 있는 모든 종류의 감정을 다중 분류하세요.",
            "일기 내용에 ['기쁨', '사랑', '뿌듯함', '실망', '우울', '불안', '분노', '놀람', '외로움', '공포', '후회', '부끄러움'] 외의 다른 감정이 존재하더라도 절대로 이를 응답해선 안 됩니다.",
            "두 번째로, 당신은 사용자가 작성한 일기의 내용을 토대로 긍정 점수와 부정 점수를 평가합니다.",
            "긍정 점수와 부정 점수는 양의 정수로 나타내며, 두 점수의 합은 반드시 100이어야 합니다.",
            `응답은 반드시 { "emotions": ["분류된 감정 1", "분류된 감정 2", ...], positiveScore: [긍정 점수], negativeScore: [부정 점수] }와 같은 JSON 형태여야 합니다.`,
            "사용자가 작성한 일기의 내용이 12가지의 감정 중 어떤 것으로도 분류될 수 없을 경우, 응답의 emotions 속성을 빈 배열로 응답해야 합니다.",
            "응답의 emotions 속성의 분류된 감정들은 분류될 확률에 따라 내림차순으로 나열하세요.",
            "사용자가 작성한 일기의 내용으로 긍정 점수와 부정 점수를 평가할 수 없을 경우, 중립을 표현하는 의미에서 긍정 점수와 부정 점수는 각각 50으로 응답해야 합니다.",
        ];

        for (const systemPrompt of systemPrompts) {
            messages.push({ role: "system", content: systemPrompt });
        }
        messages.push({ role: "user", content });

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages,
            response_format: { "type": "json_object" },
            temperature: 0.2,
            max_tokens: 1000,
        });

        const output = JSON.parse(response.choices[0].message.content);

        // expect(output): { "emotions": [], "positiveScore": int, "negativeScore": int }
        return output;
    } catch (error) {
        throw error;
    }
};

// 채팅방의 첫 번째 채팅을 생성한다.
exports.generateWelcomeMessage = async () => {
    try {
        // 시스템 프롬프트로 AI의 동작을 명시한다.
        const systemPrompt1 = "당신은 '공감 다이어리'라는 일기 작성 서비스의 AI 챗봇 상담사입니다.";
        const systemPrompt2 = "당신은 따뜻하고 다정하며 진실한 태도를 가지고 있습니다.";
        const systemPrompt3 = "이제부터 사용자와의 대화가 시작됩니다. 사용자에게 오늘 하루 어떤 소중한 순간들이 있었는지에 대해 물어보세요.";
        const systemPrompt4 = `응답은 반드시 { "role": "assistant", "content": "[당신이 사용자에게 전하는 말]" }와 같은 JSON 형태여야 합니다.`
        
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt1 },
                { role: "system", content: systemPrompt2 },
                { role: "system", content: systemPrompt3 },
                { role: "system", content: systemPrompt4 },
            ],
            response_format: { "type": "json_object" },
            temperature: 0.5,
            max_tokens: 1000,
        });
        
        const output = JSON.parse(response.choices[0].message.content);

        // expect(output): { "role": "assistant", "content": str }
        return output;
    } catch (error) {
        throw error;
    }
};

// 사용자의 채팅에 대한 응답을 생성한다.
exports.generateResponseMessage = async (messages) => {
    try {
        // 시스템 프롬프트로 AI의 동작을 명시한다.
        const systemPrompt1 = "당신은 '공감 다이어리'라는 일기 작성 서비스의 AI 챗봇 상담사입니다.";
        const systemPrompt2 = "당신은 따뜻하고 다정하며 진실한 태도를 가지고 있습니다.";
        const systemPrompt3 = "만약 사용자가 당신에게 자신의 경험을 공유한다면, 사용자가 그 경험에서 느낀 감정이 무엇인지 질문하세요.";
        const systemPrompt4 = "사용자가 자신의 경험에서 느낀 감정을 공유한다면, 이에 대해 100 토큰 이내로 간단히 공감하세요.";
        const systemPrompt5 = "언제나 사용자가 현재 공유하고 있는 경험에 대해 더 말하고 싶은 게 있는지 물어보세요.";
        const systemPrompt6 = "사용자가 현재 공유하고 있는 경험에 대해 더 말하고 싶은 게 없다면, 오늘 다른 소중한 순간들이 또 있었는지 질문하세요.";
        const systemPrompt7 = "사용자가 더이상 공유하고 싶은 경험이 없는 것 같다면, 이제 이 대화를 일기로 요약해 보는 것이 어떨지 제안하세요.";
        const systemPrompt8 = `응답은 반드시 { "role": "assistant", "content": "[당신이 사용자에게 전하는 말]" }와 같은 JSON 형태여야 합니다.`;

        messages.unshift({ role: "system", content: systemPrompt8 });
        messages.unshift({ role: "system", content: systemPrompt7 });
        messages.unshift({ role: "system", content: systemPrompt6 });
        messages.unshift({ role: "system", content: systemPrompt5 });
        messages.unshift({ role: "system", content: systemPrompt4 });
        messages.unshift({ role: "system", content: systemPrompt3 });
        messages.unshift({ role: "system", content: systemPrompt2 });
        messages.unshift({ role: "system", content: systemPrompt1 });

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages,
            response_format: { "type": "json_object" },
            temperature: 0.4,
            max_tokens: 1000,
        });

        const output = JSON.parse(response.choices[0].message.content);

        // expect(output): { "role": "assistant", "content": str }
        return output;
    } catch (error) {
        throw error;
    }
};

exports.generateDiary = async (messages) => {
    try {
        // 시스템 프롬프트로 AI의 동작을 명시한다.
        const systemPrompt1 = "당신은 '공감 다이어리'라는 일기 작성 서비스에서 사용자의 일기 작성을 돕는 AI 챗봇이자 동시에 사용자와의 대화를 기반으로 일기를 생성해 주는 AI 어시스턴트입니다.";
        const systemPrompt2 = "사용자는 방금 전까지 AI 챗봇 역할을 하던 당신과 대화를 나누고 있었고, 지금부터는 그 대화의 내용이 주어집니다.";
        const systemPrompt3 = "당신은 대화의 내용을 토대로 사용자의 경험들과 그 경험들에서 느낀 감정들이 상세히 표현될 수 있도록 일기를 작성해야 합니다.";
        const systemPrompt4 = `응답은 반드시 { "content": "[요약된 일기 내용]" }와 같은 JSON 형태여야 합니다.`;
        const systemPrompt5 = "사용자가 자신의 경험을 공유했을 때에만 content 속성에 일기를 작성하고, 아닐 경우엔 content 속성을 공백 문자로 응답하십시오.";
    
        messages.unshift({ role: "system", content: systemPrompt5 });
        messages.unshift({ role: "system", content: systemPrompt4 });
        messages.unshift({ role: "system", content: systemPrompt3 });
        messages.unshift({ role: "system", content: systemPrompt2 });
        messages.unshift({ role: "system", content: systemPrompt1 });

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages,
            response_format: { "type": "json_object" },
            temperature: 0.5,
            max_tokens: 1000,
        });

        const output = JSON.parse(response.choices[0].message.content);
    
        // expect(output): "{ content: [summarized diary] }"
        return output;
    } catch (error) {
        throw error;
    }
};