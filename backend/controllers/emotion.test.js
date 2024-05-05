jest.mock("../models");

const { sequelize, Post, Emotion } = require("../models");
const { getTotalEmotions } = require("./emotion");

const dateOptions = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: 'Asia/Seoul', // 한국 시간대 설정
};
const timeOptions = {
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Seoul', // 한국 시간대 설정
    hour12: false // 24시간 표기법 사용
};

// [e-01] 사용자의 누적된 모든 감정 조회
describe("[e-01] getTotalEmotions", () => {
    const req = {
        user: {
            id: 1,
        },
    };
    const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
    };
    const next = jest.fn();

    test("Emotion.findAll 수행 중 에러가 발생하면 감정 조회에 실패한다.", async () => {
        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        Emotion.findAll.mockReturnValueOnce(Promise.reject(error));

        await getTotalEmotions(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("Post.findAll 수행 중 에러가 발생하면 감정 조회에 실패한다.", async () => {
        let emotions = [
            { type: "기쁨" },
            { type: "사랑" },
            { type: "뿌듯함" },
        ];
        Emotion.findAll.mockReturnValueOnce(Promise.resolve(emotions));

        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        Post.findAll.mockReturnValueOnce(Promise.reject(error));

        await getTotalEmotions(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("데이터베이스 조회 중 에러가 발생하지 않으면 감정 조회에 성공한다.", async () => {
        let emotions = [
            { type: "기쁨" },
            { type: "사랑" },
            { type: "뿌듯함" },
        ];
        Emotion.findAll.mockReturnValueOnce(Promise.resolve(emotions));

        const posts = [
            { Emotions: [{ type: "기쁨" }, { type: "사랑" }, { type: "뿌듯함" }] },
            { Emotions: [{ type: "기쁨" }, { type: "사랑" }, { type: "뿌듯함" }] },
            { Emotions: [{ type: "기쁨" }, { type: "사랑" }, { type: "뿌듯함" }] },
        ]
        Post.findAll.mockReturnValueOnce(Promise.resolve(posts));

        await getTotalEmotions(req, res, next);

        const emotionMap = new Map();
        emotions.forEach((emotion) => {
            emotionMap.set(emotion.type, 0);
        });
        for (const post of posts) {
            for (const emotion of post.Emotions) {
                emotionMap.set(emotion.type, emotionMap.get(emotion.type) + 1);
            }
        }
        emotions = [...emotionMap.keys()].map((emotion) => {
            return {
                [emotion]: emotionMap.get(emotion),
            };
        });

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({ emotions });
    });
});