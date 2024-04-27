/**
 * [대화 테이블]
 * @id          로우 고유의 ID
 * @roomId      대화방의 ID
 * @role        메시지 생성자(AI or 사용자)
 * @content     메시지 내용
 * @createdAt   대화 전송 일시
 * @updatedAt   로우 수정 일시
 */
const Sequelize = require("sequelize");

class Chat extends Sequelize.Model {
    static initiate(sequelize) {
        Chat.init({
            role: {
                type: Sequelize.ENUM(
                    "user",                     // 사용자
                    "assistant"                 // AI
                ),                              // 메시지 생성자
                allowNull: false,               // null을 허용하지 않는다.
            },

            content: {
                type: Sequelize.STRING(400),    // 최대 길이 400(한글 200자)
                allowNull: false,               // null을 허용하지 않는다.
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: "Chat",
            tableName: "chats",
            charset: "utf8",
            collate: "utf8_general_ci",
        });
    }

    static associate(db) {
        db.Chat.belongsTo(db.Chatroom, { foreignKey: "roomId", targetKey: "id" });
    }
};

module.exports = Chat;