/**
 * [감성 테이블]
 * @positive        긍정 감성 확률
 * @negative        부정 감성 확률
 * @neutral         중립 감성 확률
 */

const Sequelize = require("sequelize");

class Emotion extends Sequelize.Model {
    static initiate(sequelize) {
        Emotion.initiate({
            positive: {
                type: Sequelize.FLOAT,          // 부동 소수점
                allowNull: false,               // 값은 null일 수 없다.
            },

            negative: {
                type: Sequelize.FLOAT,          // 부동 소수점
                allowNull: false,               // 값은 null일 수 없다.
            },

            neutral: {
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

    static associate(db) {}
};

module.exports = Emotion;