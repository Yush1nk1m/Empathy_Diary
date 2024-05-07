jest.mock("sequelize");
jest.mock("../models");

const { sequelize, Chatroom, Chat } = require("../models");
const { createNewChatRoom, summarizeChatsIntoDiary } = require("./chatroom");

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

// [cr-02] AI 챗봇과의 대화 제출
describe("[cr-02] summarizeChatsIntoDiary", () => {
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

    test("데이터베이스에서 채팅방 조회 중 에러가 발생하면 대화 제출에 실패한다.", async () => {
        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        Chatroom.findOne.mockReturnValueOnce(Promise.reject(error));

        await summarizeChatsIntoDiary(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("데이터베이스에서 조회된 채팅방이 없으면 대화 제출에 실패한다.", async () => {
        const error = new Error("채팅방이 존재하지 않습니다.");

        Chatroom.findOne.mockReturnValueOnce(Promise.resolve(null));

        await summarizeChatsIntoDiary(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("데이터베이스 작업 중 에러가 발생하지 않으면 대화 제출에 성공한다.", async () => {
        const chatroom = {
            id: 1,
        };
        Chatroom.findOne.mockReturnValueOnce(Promise.resolve(chatroom));

        const messages = [
            { role: "assistant", content: "AI의 메시지 1" },
            { role: "user", content: "사용자의 메시지 1" },
            { role: "assistant", content: "AI의 메시지 2" },
        ];
        Chat.findAll.mockReturnValueOnce(Promise.resolve(messages));

        await summarizeChatsIntoDiary(req, res, next);

        const content = "대화 내용을 요약하여 생성된 일기입니다. 이 기능은 아직 구현되지 않았습니다.";

        expect(res.status).toBeCalledWith(200);
        expect(res.json({ content }));
    });
});