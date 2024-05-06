/**
 * [대화방 테이블]
 * @id          로우 고유의 ID
 * @userId      대화 사용자
 * @createdAt   대화 시작 일시
 * @updatedAt   로우 수정 일시
 * @deletedAt   로우 삭제 일시
 */
const Sequelize = require("sequelize");

class Chatroom extends Sequelize.Model {
    static initiate(sequelize) {
        Chatroom.init({

        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: "Chatroom",
            tableName: "chatrooms",
            paranoid: true,
            charset: "utf8",
            collate: "utf8_general_ci",
        });
    }

    static associate(db) {
        db.Chatroom.belongsTo(db.User, { foreignKey: "userId", targetKey: "id", onDelete: "CASCADE", hooks: true });
        db.Chatroom.hasMany(db.Chat, { foreignKey: "roomId", sourceKey: "id" });
    }
};

module.exports = Chatroom;