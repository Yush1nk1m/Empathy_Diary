jest.mock("openai", () => {
    return jest.fn().mockImplementation(() => {
        return {
            chat: {
                completions: {
                    create: jest.fn().mockImplementation(async () => {
                        return { choices: [{ message: { content: "AI 응답" } }]};
                    })
                }
            }
        };
    });
});
require("openai");

jest.mock("sequelize");
jest.mock("../models");
jest.mock("../services/openai");

const { sequelize, Chatroom, Chat } = require("../models");
const { createNewChatRoom, summarizeChatsIntoDiary, getLatestChatRoom, sendMessage } = require("./chatroom");
const { generateWelcomeMessage, generateDiary, generateResponseMessage } = require("../services/openai");

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
    generateWelcomeMessage.mockReturnValue(Promise.resolve({
        role: "assistant",
        content: "응답",
    }));

    test("[crut-01-1] 데이터베이스에 새로운 대화방 생성 중 에러가 발생하면 대화 시작에 실패한다.", async () => {
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

    test("[crut-01-2] 데이터베이스에 AI의 첫 번째 대화 생성 중 에러가 발생하면 대화 시작에 실패한다.", async () => {
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

    test("[crut-01-3] 데이터베이스 작업 중 에러가 발생하지 않으면 대화 시작에 성공한다.", async () => {
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

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            roomId: chatroom.id,
            chat: {
                role: "assistant",
                content: expect.any(String),
            },
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
    generateDiary.mockReturnValue(Promise.resolve({
        content: "내용",
    }));

    test("[crut-02-1] 데이터베이스에서 채팅방 조회 중 에러가 발생하면 대화 제출에 실패한다.", async () => {
        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        Chatroom.findOne.mockReturnValueOnce(Promise.reject(error));

        await summarizeChatsIntoDiary(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[crut-02-2] 데이터베이스에서 조회된 채팅방이 없으면 대화 제출에 실패한다.", async () => {
        const error = new Error("채팅방이 존재하지 않습니다.");

        Chatroom.findOne.mockReturnValueOnce(Promise.resolve(null));

        await summarizeChatsIntoDiary(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[crut-02-3] 데이터베이스 작업 중 에러가 발생하지 않으면 대화 제출에 성공한다.", async () => {
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

        expect(res.status).toBeCalledWith(200);
        expect(res.json({ content: expect.any(String) }));
    });
});

// [cr-03] AI 챗봇과의 최근 대화 내용 불러오기
describe("[cr-03] getLatestChatRoom", () => {
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

    test("[crut-03-1] 데이터베이스에서 채팅방 정보 조회 중 에러가 발생하면 대화 내용 불러오기에 실패한다.", async () => {
        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        Chatroom.findOne.mockReturnValueOnce(Promise.reject(error));

        await getLatestChatRoom(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[crut-03-2] 조회된 채팅방이 존재하지 않으면 대화 내용 불러오기에 실패한다.", async () => {
        Chatroom.findOne.mockReturnValueOnce(Promise.resolve(null));
        
        const error = new Error("채팅방이 존재하지 않습니다.");

        await getLatestChatRoom(req, res, next);

        expect(next).toBeCalledWith(error);
    });
    
    test("[crut-03-3] 데이터베이스에서 대화 조회 중 에러가 발생하면 대화 내용 불러오기에 실패한다.", async () => {
        const chatroom = {
            id: 1,
        };
        Chatroom.findOne.mockReturnValueOnce(Promise.resolve(chatroom));
        
        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        Chat.findAll.mockReturnValueOnce(Promise.reject(error));

        await getLatestChatRoom(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[crut-03-4] 데이터베이스 작업 중 에러가 발생하지 않으면 대화 내용 불러오기에 성공한다.", async () => {
        const chatroom = {
            id: 1,
        };
        Chatroom.findOne.mockReturnValueOnce(Promise.resolve(chatroom));
        
        const chats = [
            { role: "assistant", content: "AI의 메시지 1" },
            { role: "user", content: "사용자의 메시지 1" },
            { role: "assistant", content: "AI의 메시지 2" },
        ]
        Chat.findAll.mockReturnValueOnce(Promise.resolve(chats));

        await getLatestChatRoom(req, res, next);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            roomId: chatroom.id,
            chats,
        });
    });
});

// [cr-04] AI 챗봇에게 메시지 전송
describe("[cr-04] sendMessage", () => {
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
        json: jest.fn(),
    };
    const next = jest.fn();
    generateResponseMessage.mockReturnValue(Promise.resolve({
        role: "assistant",
        content: "응답",
    }));

    test("[crut-04-1] 요청 바디가 유효하지 않을 경우 메시지 전송에 실패한다.", async () => {
        const req = {
            user: {
                id: 1,
            },
            body: {},
        };

        await sendMessage(req, res, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith("요청 바디가 유효하지 않습니다.");
    });

    test("[crut-04-2] 데이터베이스에서 채팅방 조회 중 에러가 발생하면 메시지 전송에 실패한다.", async () => {
        const req = {
            user: {
                id: 1,
            },
            body: {
                content: "메시지 내용",
            },
        };

        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        Chatroom.findOne.mockReturnValueOnce(Promise.reject(error));

        await sendMessage(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[crut-04-3] 조회된 채팅방이 존재하지 않으면 메시지 전송에 실패한다.", async () => {
        const req = {
            user: {
                id: 1,
            },
            body: {
                content: "메시지 내용",
            },
        };

        Chatroom.findOne.mockReturnValueOnce(Promise.resolve(null));
        
        const error = new Error("채팅방이 존재하지 않습니다.");

        await sendMessage(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[crut-04-4] 데이터베이스에 사용자의 채팅 저장 중 에러가 발생하면 메시지 전송에 실패한다.", async () => {
        const req = {
            user: {
                id: 1,
            },
            body: {
                content: "메시지 내용",
            },
        };

        const chatroom = {
            id: 1,
        };
        Chatroom.findOne.mockReturnValueOnce(Promise.resolve(chatroom));

        const error = new Error("데이터베이스 저장 중 에러가 발생했습니다.");
        Chat.create.mockReturnValueOnce(Promise.reject(error));

        await sendMessage(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[crut-04-5] 데이터베이스에서 대화 내역 조회 중 에러가 발생하면 메시지 전송에 실패한다.", async () => {
        const req = {
            user: {
                id: 1,
            },
            body: {
                content: "메시지 내용",
            },
        };

        const chatroom = {
            id: 1,
        };
        Chatroom.findOne.mockReturnValueOnce(Promise.resolve(chatroom));

        Chat.create.mockReturnValueOnce(Promise.resolve(true));
        
        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        Chat.findAll.mockReturnValueOnce(Promise.reject(error));

        await sendMessage(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[crut-04-6] 데이터베이스에 AI의 응답 저장 중 에러가 발생하면 메시지 전송에 실패한다.", async () => {
        const req = {
            user: {
                id: 1,
            },
            body: {
                content: "메시지 내용",
            },
        };

        const chatroom = {
            id: 1,
        };
        Chatroom.findOne.mockReturnValueOnce(Promise.resolve(chatroom));
        
        Chat.create.mockReturnValueOnce(Promise.resolve(true));

        Chat.findAll.mockReturnValueOnce(Promise.resolve([]));

        const error = new Error("데이터베이스 저장 중 에러가 발생했습니다.");
        Chat.create.mockReturnValueOnce(Promise.reject(error));

        await sendMessage(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[crut-04-7] 요청 형식이 유효하고 데이터베이스 작업 중 에러가 발생하지 않으면 메시지 전송에 성공한다.", async () => {
        const req = {
            user: {
                id: 1,
            },
            body: {
                content: "메시지 내용",
            },
        };

        const chatroom = {
            id: 1,
        };
        Chatroom.findOne.mockReturnValueOnce(Promise.resolve(chatroom));
        
        Chat.create.mockReturnValueOnce(Promise.resolve(true));

        Chat.findAll.mockReturnValueOnce(Promise.resolve([]));

        Chat.create.mockReturnValueOnce(Promise.resolve(true));

        await sendMessage(req, res, next);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            chat: {
                role: "assistant",
                content: expect.any(String),
            }
        });
    });
});