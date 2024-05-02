/**
 * [조언 테이블]
 * @id          로우 고유의 ID
 * @content     조언 내용
 * @createdAt   작성 일시
 * @updatedAt   수정 일시
 * @writer      조언 작성자
 */
const Sequelize = require("sequelize");

class Advice extends Sequelize.Model {
    static initiate(sequelize) {
        Advice.init({
            content: {
                type: Sequelize.STRING(100),    // 최대 길이 100
                allowNull: false,               // null을 허용하지 않는다.
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: "Advice",
            tableName: "advices",
            paranoid: false,
            charset: "utf8mb4",
            collate: "utf8mb4_general_ci",
        });
    }

    static associate(db) {
        db.Advice.belongsTo(db.User, { foreignKey: "writer", targetKey: "id" });
        db.Advice.belongsToMany(db.Emotion, { through: "AdviceEmotion", onDelete: "cascade" });
    }
}

module.exports = Advice;