require("dotenv").config();
const OpenAIApi = require('openai');

const openai = new OpenAIApi({
    api_key: process.env.OPENAI_API_KEY,
});

// 일기 내용을 바탕으로 감정 정보 및 감성 정보를 추출한다.
exports.analysisDiary = async (content) => {
    try {
        const prompt = `some prompt`
        // const response = await openai.chat.completions.create({
        //     model: "gpt-4-turbo-preview",
        //     messages: [
        //         { role: "system", content: prompt },
        //         { role: "user", content },
        //     ],
        //     response_format: { "type": "json_object" },
        //     temperature: 0.2,
        //     max_tokens: 1000,
        // });
        // const output = JSON.parse(response.choices[0].message.content);

        // expect(output): { "emotions": [], "positiveScore": int, "negativeScore": int }
        return { "emotions": ["기쁨", "사랑", "뿌듯함"], positiveScore: 50, negativeScore: 50 };
    } catch (error) {
        throw error;
    }
};

// 채팅방의 첫 번째 채팅을 생성한다.
exports.generateWelcomeMessage = async () => {
    try {
        const prompt = `some prompt`
        // const response = await openai.chat.completions.create({
        //     model: "gpt-4-turbo-preview",
        //     messages: [
        //         { role: "system", content: prompt },
        //     ],
        //     response_format: { "type": "json_object" },
        //     temperature: 0.5,
        //     max_tokens: 1000,
        // });
        // const output = JSON.parse(response.choices[0].message);

        // expect(output): { "role": "assistant", "content": str }
        return { "role": "assistant", "content": "안녕하세요. 이 기능은 아직 구현되지 않았습니다." };
    } catch (error) {
        throw error;
    }
};

// 사용자의 채팅에 대한 응답을 생성한다.
exports.generateResponseMessage = async (messages) => {
    try {
        const prompt = `some prompt`
        messages.unshift({ role: "system", content: prompt });
        // const response = await openai.chat.completions.create({
        //     model: "gpt-4-turbo-preview",
        //     messages,
        //     response_format: { "type": "json_object" },
        //     temperature: 0.5,
        //     max_tokens: 1000,
        // });
        // const output = JSON.parse(response.choices[0].message);

        // expect(output): { "role": "assistant", "content": str }
        return { "role": "assistant", "content": "이 기능은 아직 구현되지 않았습니다." };
    } catch (error) {
        throw error;
    }
};

exports.generateDiary = async (messages) => {
    const prompt = `some prompt`
    messages.unshift({ role: "system", content: prompt });
    messages.pop();     // 마지막 AI의 응답 제거
    // const response = await openai.chat.completions.create({
    //     model: "gpt-4-turbo-preview",
    //     messages,
    //     response_format: { "type": "json_object" },
    //     temperature: 0.5,
    //     max_tokens: 1000,
    // });
    // const output = JSON.parse(response.choices[0].message);

    // expect(output): "{ content: [summarized diary] }"
    return { content: "대화 내용을 요약하여 생성된 일기입니다. 이 기능은 아직 구현되지 않았습니다." };
};