/**
 * [감정 테이블]
 * @id          로우 고유의 ID
 * @typeName    감정의 종류
 */
const Sequelize = require("sequelize");

class Emotion extends Sequelize.Model {
    static initiate(sequelize) {
        Emotion.init({
            typeName: {
                type: Sequelize.STRING(10),     // 최대 길이 10
                allowNull: false,               // 값은 null일 수 없다.
                unique: true,                   // 값은 유일해야 한다.
            },
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: "Emotion",
            tableName: "emotions",
            paranoid: false,
            charset: "utf8mb4",
            collate: "utf8mb4_general_ci",
        });
    }

    static associate(db) {
        db.Emotion.belongsToMany(db.Post, { through: "PostEmotion", onDelete: "cascade" });
    }
};

module.exports = Emotion;