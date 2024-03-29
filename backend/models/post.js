/**
 * [일기 테이블]
 * @content     내용
 * @image       첨부 이미지 저장 경로
 */
const Sequelize = require("sequelize");

class Post extends Sequelize.Model {
    static initiate(sequelize) {
        Post.init({
            content: {
                type: Sequelize.STRING(2000),   // 최대 길이 2000
                allowNull: false,               // null을 허용하지 않는다.
            },

            image: {
                type: Sequelize.STRING(200),    // 최대 길이 200
                allowNull: true,                // null을 허용한다.
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: "Post",
            tableName: "posts",
            paranoid: false,
            charset: "utf8mb4",
            collate: "utf8mb4_general_ci",
        });
    }

    static associate(db) {}
}

module.exports = Post;