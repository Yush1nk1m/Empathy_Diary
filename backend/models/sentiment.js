/**
 * [감성 테이블]
 * @id          로우 고유의 ID
 * @positive    긍정 감성 확률
 * @negative    부정 감성 확률
 * @neutral     중립 감성 확률
 * @postId      일기의 고유한 ID
 */

const Sequelize = require("sequelize");

class Sentiment extends Sequelize.Model {
    static initiate(sequelize) {
        Sentiment.init({
            positive: {
                type: Sequelize.FLOAT,          // 부동 소수점
                allowNull: false,               // 값은 null일 수 없다.
            },

            negative: {
                type: Sequelize.FLOAT,          // 부동 소수점
                allowNull: false,               // 값은 null일 수 없다.
            },
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: "Sentiment",
            tableName: "sentiments",
            paranoid: false,
            charset: "utf8mb4",
            collate: "utf8mb4_general_ci",
        });
    }

    static associate(db) {
        db.Sentiment.belongsTo(db.Post, { foreignKey: "postId", targetKey: "id" });
    }
};

module.exports = Sentiment;