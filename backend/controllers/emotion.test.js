jest.mock("sequelize");
jest.mock("../models");

const Op = require("sequelize").Op;
const { Post, Emotion, PostEmotion } = require("../models");
const { getTotalEmotions, getTotalEmotionsForSpecificPeriod } = require("./emotion");

const dateOptions = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: 'Asia/Seoul', // 한국 시간대 설정
};
const timeOptions = {
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Seoul', // 한국 시간대 설정
    hour12: false // 24시간 표기법 사용
};
const emotionList = ["기쁨", "사랑", "뿌듯함", "우울", "불안", "분노", "놀람", "외로움", "공포", "후회", "부끄러움"];

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

    test("[eut-01-1] Emotion.findAll 수행 중 에러가 발생하면 감정 조회에 실패한다.", async () => {
        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        Emotion.findAll.mockReturnValueOnce(Promise.reject(error));

        await getTotalEmotions(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[eut-01-2] Post.findAll 수행 중 에러가 발생하면 감정 조회에 실패한다.", async () => {
        const emotions = [
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

    test("[eut-01-3] PostEmotion.findAll 수행 중 에러가 발생하면 감정 조회에 실패한다.", async () => {
        const emotions = [
            { type: "기쁨" },
            { type: "사랑" },
            { type: "뿌듯함" },
        ];
        Emotion.findAll.mockReturnValueOnce(Promise.resolve(emotions));

        const posts = [{ id: 1 }, { id: 2 }, { id: 3 }];
        Post.findAll.mockReturnValueOnce(Promise.resolve(posts));

        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        PostEmotion.findAll.mockReturnValue(Promise.reject(error));

        await getTotalEmotions(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[eut-01-4] 데이터베이스 조회 중 에러가 발생하지 않으면 감정 조회에 성공한다.", async () => {
        const emotions = emotionList.map((emotion) => {
            return {
                type: emotion,
            };
        });
        Emotion.findAll.mockReturnValueOnce(Promise.resolve(emotions));

        const posts = [{ id: 1 }, { id: 2 }, { id: 3 }];
        Post.findAll.mockReturnValueOnce(Promise.resolve(posts));

        const postEmotions = [
            { EmotionType: "기쁨" },
            { EmotionType: "사랑" },
            { EmotionType: "뿌듯함" },
        ];
        PostEmotion.findAll.mockReturnValue(Promise.resolve(postEmotions));

        await getTotalEmotions(req, res, next);

        const emotionMap = new Map();
        emotions.forEach((emotion) => {
            emotionMap.set(emotion.type, 0);
        });

        // 위에서 일기가 세 개 조회되고 각각 기쁨, 사랑, 뿌듯함이 매핑되어 있도록 가정하였다.
        emotionMap.set("기쁨", 3);
        emotionMap.set("사랑", 3);
        emotionMap.set("뿌듯함", 3);

        const emotionsArray = [...emotionMap.keys()].map((emotion) => {
            return {
                [emotion]: emotionMap.get(emotion),
            };
        });

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({ emotions: emotionsArray });
    });
});

// [e-02] 특정 기간 동안 누적된 감정 모두 조회
describe("[e-02] getTotalEmotionsForSpecificPeriod", () => {
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
        json: jest.fn(),
    };
    const next = jest.fn();

    test("[eut-02-1] 쿼리 파라미터가 충분히 주어지지 않으면 감정 조회에 실패한다.", async () => {
        const req = {
            query: {
                startDate: '',
                endDate: '',
            },
            user: {
                id: 1,
            },
        };

        await getTotalEmotionsForSpecificPeriod(req, res, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith("충분한 쿼리 파라미터가 제공되지 않았습니다.");
    });

    test("[eut-02-2] 쿼리 파라미터의 값이 유효하지 않으면 감정 조회에 실패한다.", async () => {
        const req = {
            query: {
                startDate: "Cannot Parse",
                endDate: "Cannot Parse",
            },
            user: {
                id: 1,
            },
        };

        await getTotalEmotionsForSpecificPeriod(req, res, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith("쿼리 파라미터의 값이 유효하지 않습니다.");
    });

    test("[eut-02-3] Emotion.findAll 수행 중 에러가 발생하면 감정 조회에 실패한다.", async () => {
        const req = {
            query: {
                startDate: "2024-05-05",
                endDate: "2024-05-05",
            },
            user: {
                id: 1,
            },
        };

        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        Emotion.findAll.mockReturnValueOnce(Promise.reject(error));

        await getTotalEmotionsForSpecificPeriod(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[eut-02-4] Post.findAll 수행 중 에러가 발생하면 감정 조회에 실패한다.", async () => {
        const req = {
            query: {
                startDate: "2024-05-05",
                endDate: "2024-05-05",
            },
            user: {
                id: 1,
            },
        };

        let emotions = [
            { type: "기쁨" },
            { type: "사랑" },
            { type: "뿌듯함" },
        ];
        Emotion.findAll.mockReturnValueOnce(Promise.resolve(emotions));

        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        Post.findAll.mockReturnValueOnce(Promise.reject(error));

        await getTotalEmotionsForSpecificPeriod(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[eut-02-5] PostEmotion.findAll 수행 중 에러가 발생하면 감정 조회에 실패한다.", async () => {
        const req = {
            query: {
                startDate: "2024-05-05",
                endDate: "2024-05-05",
            },
            user: {
                id: 1,
            },
        };
        const emotions = [
            { type: "기쁨" },
            { type: "사랑" },
            { type: "뿌듯함" },
        ];
        Emotion.findAll.mockReturnValueOnce(Promise.resolve(emotions));

        const posts = [{ id: 1 }, { id: 2 }, { id: 3 }];
        Post.findAll.mockReturnValueOnce(Promise.resolve(posts));

        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        PostEmotion.findAll.mockReturnValue(Promise.reject(error));

        await getTotalEmotionsForSpecificPeriod(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[eut-02-6] 데이터베이스 조회 중 에러가 발생하지 않으면 감정 조회에 성공한다.", async () => {
        const req = {
            query: {
                startDate: "2024-05-05",
                endDate: "2024-05-05",
            },
            user: {
                id: 1,
            },
        };

        let emotions = [
            { type: "기쁨" },
            { type: "사랑" },
            { type: "뿌듯함" },
        ];
        Emotion.findAll.mockReturnValueOnce(Promise.resolve(emotions));

        const posts = [{ id: 1 }, { id: 2 }, { id: 3 }];
        Post.findAll.mockReturnValueOnce(Promise.resolve(posts));

        const postEmotions = [
            { EmotionType: "기쁨" },
            { EmotionType: "사랑" },
            { EmotionType: "뿌듯함" },
        ];
        PostEmotion.findAll.mockReturnValue(Promise.resolve(postEmotions));

        await getTotalEmotionsForSpecificPeriod(req, res, next);

        const emotionMap = new Map();
        emotions.forEach((emotion) => {
            emotionMap.set(emotion.type, 0);
        });

        // 위에서 일기가 세 개 조회되고 각각 기쁨, 사랑, 뿌듯함이 매핑되어 있도록 가정하였다.
        emotionMap.set("기쁨", 3);
        emotionMap.set("사랑", 3);
        emotionMap.set("뿌듯함", 3);

        const emotionsArray = [...emotionMap.keys()].map((emotion) => {
            return {
                [emotion]: emotionMap.get(emotion),
            };
        });

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({ emotions: emotionsArray });
    });
});