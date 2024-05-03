jest.mock("sequelize");
jest.mock("../models");

const { sequelize, Advice } = require("../models");
const { writeAdvice } = require("./advice");

sequelize.transaction.mockReturnValue(Promise.resolve({
    commit: jest.fn(() => Promise.resolve(true)),
    rollback: jest.fn(() => Promise.resolve(true)),
}));

// [a-03] 조언 작성
describe("[a-03] writeAdvice", () => {
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
        json: jest.fn(),
    };
    const next = jest.fn();

    test("요청 바디에 문제가 있을 경우 조언 작성에 실패한다.", async () => {
        const req = {
            body: {
            }
        };

        await writeAdvice(req, res, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith("조언이 전달되지 않았습니다.");
    });

    test("주어진 조언 내용이 빈 문자열일 경우 조언 작성에 실패한다.", async () => {
        const req = {
            body: {
                content: '',
            },
        };

        await writeAdvice(req, res, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith("조언이 전달되지 않았습니다.");
    });

    test("데이터베이스 생성 중 오류가 발생하면 조언 작성에 실패한다.", async () => {
        const req = {
            body: {
                content: "조언",
            },
            user: {},
        };

        const error = new Error("데이터베이스 생성 중 오류가 발생했습니다.");
        Advice.create.mockReturnValueOnce(Promise.reject(error));

        await writeAdvice(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("user.getPosts() 수행 중 오류가 발생하면 조언 작성에 실패한다.", async () => {
        const error = new Error("데이터베이스 조회 중 오류가 발생했습니다.");
        const req = {
            body: {
                content: "조언",
            },
            user: {
                getPosts: jest.fn(() => Promise.reject(error)),
            },
        };

        Advice.create.mockReturnValueOnce(Promise.resolve({}));

        await writeAdvice(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("post.getEmotions() 수행 중 오류가 발생하면 조언 작성에 실패한다.", async () => {
        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        const posts = [{
            getEmotions: jest.fn(() => Promise.reject(error)),
        }];
        const req = {
            body: {
                content: "조언",
            },
            user: {
                getPosts: jest.fn(() => Promise.resolve(posts)),
            },
        };

        Advice.create.mockReturnValueOnce(Promise.resolve({}));

        await writeAdvice(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("advice.addEmotions() 수행 중 오류가 발생하면 조언 작성에 실패한다.", async () => {
        const error = new Error("데이터베이스 생성 중 에러가 발생했습니다.");
        const advice = {
            addEmotions: jest.fn(() => Promise.reject(error)),
        };
        const emotions = [{ type: "기쁨" }, { type: "사랑" }, { type: "뿌듯함" }];
        const posts = [{
            getEmotions: jest.fn(() => Promise.resolve(emotions)),
        }];
        const req = {
            body: {
                content: "조언",
            },
            user: {
                getPosts: jest.fn(() => Promise.resolve(posts)),
            },
        };

        Advice.create.mockReturnValueOnce(Promise.resolve(advice));

        await writeAdvice(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("요청 바디 형식이 적절하고 데이터베이스 작업 중 에러가 발생하지 않으면 조언 작성에 성공한다.", async () => {
        const advice = {
            id: 1,
            content: "조언",
            addEmotions: jest.fn(() => Promise.resolve(true)),
        };
        const emotions = [{ type: "기쁨" }, { type: "사랑" }, { type: "뿌듯함" }];
        const posts = [{
            getEmotions: jest.fn(() => Promise.resolve(emotions)),
        }];
        const req = {
            body: {
                content: "조언",
            },
            user: {
                getPosts: jest.fn(() => Promise.resolve(posts)),
            },
        };

        Advice.create.mockReturnValueOnce(Promise.resolve(advice));

        await writeAdvice(req, res, next);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            adviceId: advice.id,
            content: advice.content,
            emotions: emotions.map(emotion => emotion.type),
        });
    });
});