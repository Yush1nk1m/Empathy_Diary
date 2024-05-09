const { sequelize, Chatroom, Chat } = require("../models");

// 추후 chatGPT API 연결 시 AI의 첫 대화를 생성하는 로직 추가
// [cr-01] AI 챗봇과의 대화방 생성
exports.createNewChatRoom = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        // 새로운 대화방 생성
        const chatroom = await Chatroom.create({
            userId: req.user.id,
        }, {
            transaction,
        });
        const roomId = chatroom.id;

        // AI의 첫 대화 생성
        const chat = {
            role: "assistant",
            content: "안녕하세요. 이 기능은 아직 구현되지 않았습니다.",
        };

        await Chat.create({
            roomId: chatroom.id,
            role: chat.role,
            content: chat.content,
        }, {
            transaction,
        });
        // AI의 첫 대화 생성

        await transaction.commit();

        return res.status(200).json({
            roomId,
            chat,
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

// 추후 chatGPT API 연결 시 대화 내용을 토대로 일기를 생성하는 로직 추가
// [cr-02] AI 챗봇과의 대화 제출
exports.summarizeChatsIntoDiary = async (req, res, next) => {
    try {
        // AI와의 채팅은 일시적인 것으로, 예전의 채팅을 불러올 수 없다.
        // 그러므로 사용자가 대화하는 채팅방은 항상 최근에 생성된 것이다.
        const chatroom = await Chatroom.findOne({
            where: {
                userId: req.user.id,
            },
            order: [["createdAt", "DESC"]],
        });
        if (!chatroom) {
            throw new Error("채팅방이 존재하지 않습니다.");
        }

        const roomId = chatroom.id;

        // 사용자와 AI의 대화 내역 조회
        let messages = await Chat.findAll({
            where: {
                roomId,
            },
            order: [["createdAt", "ASC"]],
        });
        messages = messages.map((message) => {
            return {
                role: message.role,
                content: message.content,
            }
        });
        // 마지막 메시지(AI의 응답) 제외
        messages.pop();
        
        // chatGPT API 사용하여 일기 요약하는 로직 추가
        const content = "대화 내용을 요약하여 생성된 일기입니다. 이 기능은 아직 구현되지 않았습니다.";
        // chatGPT API 사용하여 일기 요약하는 로직 추가

        return res.status(200).json({ content });
    } catch (error) {
        next(error);
    }
}

// [cr-03] AI 챗봇과의 최근 대화 내용 불러오기
exports.getLatestChatRoom = async (req, res, next) => {
    try {
        // 최근 채팅방 정보 조회
        const chatroom = await Chatroom.findOne({
            where: {
                userId: req.user.id,
            },
            order: [["createdAt", "DESC"]],
        });
        if (!chatroom) {
            throw new Error("채팅방이 존재하지 않습니다.");
        }
        const roomId = chatroom.id;

        // 채팅방의 모든 대화 시간 순으로 조회
        let chats = await Chat.findAll({
            where: {
                roomId,
            },
            order: [["createdAt", "ASC"]],
        });
        chats = chats.map((chat) => {
            return {
                role: chat.role,
                content: chat.content,
            };
        });

        return res.status(200).json({
            roomId,
            chats,
        });
    } catch (error) {
        next(error);
    }
};

// 추후 chatGPT API 연결 시 AI의 응답을 생성하는 로직 추가
// [cr-04] AI 챗봇에게 메시지 전송
exports.sendMessage = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).send("요청 바디가 유효하지 않습니다.");
        }

        // AI와의 채팅은 일시적인 것으로, 예전의 채팅을 불러올 수 없다.
        // 그러므로 사용자가 대화하는 채팅방은 항상 최근에 생성된 것이다.
        const chatroom = await Chatroom.findOne({
            where: {
                userId: req.user.id,
            },
            order: [["createdAt", "DESC"]],
        });
        if (!chatroom) {
            throw new Error("채팅방이 존재하지 않습니다.");
        }

        const roomId = chatroom.id;

        // 사용자가 보낸 채팅 기록
        await Chat.create({
            roomId,
            role: "user",
            content,
        }, {
            transaction,
        });

        // AI의 응답 생성
        const chat = {
            role: "assistant",
            content: "AI의 응답입니다. 이 기능은 아직 구현되지 않았습니다.",
        };

        await Chat.create({
            roomId,
            role: chat.role,
            content: chat.content,
        }, {
            transaction,
        });
        // AI의 응답 생성

        await transaction.commit();

        return res.status(200).json({ chat });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};