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
        const chats = [];
        const role = "assistant";
        const content = "안녕하세요. 이 기능은 아직 구현되지 않았습니다.";
        chats.push({
            role,
            content,
        });

        await Chat.create({
            roomId: chatroom.id,
            role,
            content,
        }, {
            transaction,
        });

        await transaction.commit();

        return res.status(200).json({
            roomId: chatroom.id,
            chats,
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        next(error);
    }
};