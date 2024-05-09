require("dotenv").config();
const OpenAIApi = require('openai');

const openai = new OpenAIApi({
    api_key: process.env.OPENAI_API_KEY,
});

exports.analysisDiary = async (content) => {
    try {
        const prompt = `some prompt`
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: prompt },
                { role: "user", content },
            ],
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

exports.generateWelcomeMessage = async () => {
    try {
        const prompt = `some prompt`
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: prompt },
            ],
            response_format: { "type": "json_object" },
            temperature: 0.5,
            max_tokens: 1000,
        });
        const output = JSON.parse(response.choices[0].message);

        // expect(output): { "role": "assistant", "content": str }
        return output;
    } catch (error) {
        throw error;
    }
};

exports.generateResponseMessage = async (messages) => {
    try {
        const prompt = `some prompt`
        messages.unshift({ role: "system", content: prompt });
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages,
            response_format: { "type": "json_object" },
            temperature: 0.5,
            max_tokens: 1000,
        });
        const output = JSON.parse(response.choices[0].message);

        // expect(output): { "role": "assistant", "content": str }
        return output;
    } catch (error) {
        throw error;
    }
};