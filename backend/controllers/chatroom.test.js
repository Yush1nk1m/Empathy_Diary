jest.mock("sequelize");
jest.mock("../models");

const { sequelize, Chatroom, Chat } = require("../models");
const { createNewChatRoom } = require("./chatroom");

sequelize.transaction.mockReturnValue(Promise.resolve({
    commit: jest.fn(() => Promise.resolve(true)),
    rollback: jest.fn(() => Promise.resolve(true)),
}));

// [cr-01] AI 챗봇과의 대화방 생성
describe("[cr-01] createNewChatRoom", () => {
    const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
    };
    const next = jest.fn();

    test("데이터베이스에 새로운 대화방 생성 중 에러가 발생하면 대화 시작에 실패한다.", async () => {
        const req = {
            user: {
                id: 1,
            },
        };

        const error = new Error("데이터베이스 생성 중 에러가 발생했습니다.");
        Chatroom.create.mockReturnValue(Promise.reject(error));

        await createNewChatRoom(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("데이터베이스에 AI의 첫 번째 대화 생성 중 에러가 발생하면 대화 시작에 실패한다.", async () => {
        const req = {
            user: {
                id: 1,
            },
        };

        Chatroom.create.mockReturnValueOnce(Promise.resolve(true));

        const error = new Error("데이터베이스 생성 중 에러가 발생했습니다.");
        Chat.create.mockReturnValueOnce(Promise.reject(error));

        await createNewChatRoom(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("데이터베이스 작업 중 에러가 발생하지 않으면 대화 시작에 성공한다.", async () => {
        const req = {
            user: {
                id: 1,
            },
        };

        const chatroom = {
            id: 1,
        };
        Chatroom.create.mockReturnValueOnce(Promise.resolve(chatroom));

        Chat.create.mockReturnValueOnce(Promise.resolve(true));
        
        await createNewChatRoom(req, res, next);
        
        const chat = {
            role: "assistant",
            content: "안녕하세요. 이 기능은 아직 구현되지 않았습니다.",
        };

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            roomId: chatroom.id,
            chat,
        });
    });
});