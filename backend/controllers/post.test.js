jest.mock("../models/post");

const Post = require("../models/post");

const { postDiary } = require("./post");

// [p-03] 일기 등록
describe("[p-03] postDiary", () => {
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
    };
    const next = jest.fn();

    test("일기 내용이 존재하면 일기를 등록한다.", async () => {
        const req = {
            body: {
                content: "일기의 내용입니다.",
            },
            user: {
                id: 1,
            },
        };
        Post.create.mockReturnValue(Promise.resolve(true));

        await postDiary(req, res, next);

        expect(res.status).toBeCalledWith(200);
        expect(res.send).toBeCalledWith("일기가 작성되었습니다.");
    });

    test("일기 내용이 존재하지 않으면 일기 등록에 실패한다.", async () => {
        const req = {
            body: {
                content: '',
            },
            user: {
                id: 1,
            },
        };
        
        await postDiary(req, res, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith("일기 내용이 존재하지 않습니다.");
    });

    test("데이터베이스 에러 발생 시 next(error)를 호출한다.", async () => {
        const req = {
            body: {
                content: "일기의 내용입니다.",
            },
            user: {
                id: 1,
            },
        };

        const error = new Error("데이터베이스 생성 작업 중 오류가 발생했습니다.");
        Post.create.mockReturnValue(Promise.reject(error));

        await postDiary(req, res, next);

        expect(next).toBeCalledWith(error);
    });
});