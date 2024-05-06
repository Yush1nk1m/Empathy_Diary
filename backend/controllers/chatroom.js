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
            roomId: chatroom.id,
            chat,
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        next(error);
    }
};

// 추후 chatGPT API 연결 시 AI의 응답을 생성하는 로직 추가
// [cr-04] AI 챗봇에게 메시지 전송
exports.sendMessage = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { content } = req.body;

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
        console.error(error);
        next(error);
    }
};