jest.mock("sequelize");
jest.mock("../models");

const Op = require("sequelize").Op;
const { Post, Sentiment } = require("../models");
const { getSentimentScoresForSpecificPeriod } = require("./sentiment");

const dateOptions = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: 'Asia/Seoul', // 한국 시간대 설정
};

// [s-01] 특정 기간 동안의 감성 점수 조회
describe("[s-01] getSentimentScoresForSpecificPeriod", () => {
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
        json: jest.fn(),
    };
    const next = jest.fn();

    test("[sut-01-1] 쿼리 파라미터가 주어지지 않으면 감성 점수 조회에 실패한다.", async () => {
        const req = {
            query: {},
        };

        await getSentimentScoresForSpecificPeriod(req, res, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith("충분한 쿼리 파라미터가 전달되지 않았습니다.");
    });

    test("[sut-01-2] 쿼리 파라미터의 값이 유효하지 않으면 감성 점수 조회에 실패한다.", async () => {
        const req = {
            query: {
                startDate: "Cannot Parse",
                endDate: "Cannot Parse",
            },
        };

        await getSentimentScoresForSpecificPeriod(req, res, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith("쿼리 파라미터의 값이 유효하지 않습니다.");
    });

    test("[sut-01-3] 데이터베이스 조회 중 에러가 발생하면 감성 점수 조회에 실패한다.", async () => {
        const req = {
            query: {
                startDate: "2024-05-01",
                endDate: "2024-05-05",
            },
            user: {
                id: 1,
            },
        };

        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        Sentiment.findAll.mockReturnValueOnce(Promise.reject(error));

        await getSentimentScoresForSpecificPeriod(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[sut-01-4] 데이터베이스 조회 중 에러가 발생하면 감성 점수 조회에 실패한다.", async () => {
        const req = {
            query: {
                startDate: "2024-05-01",
                endDate: "2024-05-05",
            },
            user: {
                id: 1,
            },
        };

        let sentiments = [
            {
                Post: {
                    writer: 1,
                    createdAt: new Date(),
                },
                positive: 50,
                negative: 50,
            },
            {
                Post: {
                    writer: 1,
                    createdAt: new Date(),
                },
                positive: 50,
                negative: 50,
            },
            {
                Post: {
                    writer: 1,
                    createdAt: new Date(),
                },
                positive: 50,
                negative: 50,
            },
        ];
        Sentiment.findAll.mockReturnValueOnce(Promise.resolve(sentiments));

        await getSentimentScoresForSpecificPeriod(req, res, next);

        const countMap = new Map();
        const positiveMap = new Map();
        const negativeMap = new Map();

        for (const sentiment of sentiments) {
            const date = (sentiment.Post.createdAt).toLocaleString("ko-KR", dateOptions);
            if (!countMap.has(date)) {
                countMap.set(date, 1);
                positiveMap.set(date, sentiment.positive);
                negativeMap.set(date, sentiment.negative);
            } else {
                countMap.set(date, countMap.get(date) + 1);
                positiveMap.set(date, positiveMap.get(date) + sentiment.positive);
                negativeMap.set(date, negativeMap.get(date) + sentiment.negative);
            }
        }

        sentiments = [];
        for (const date of countMap.keys()) {
            positiveMap.set(date, positiveMap.get(date) / countMap.get(date));
            negativeMap.set(date, negativeMap.get(date) / countMap.get(date));

            sentiments.push({
                [date]: {
                    positive: positiveMap.get(date),
                    negative: negativeMap.get(date),
                }
            });
        }

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({ sentiments });
    });
});