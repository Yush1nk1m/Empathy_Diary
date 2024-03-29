/**
 * [일기 테이블]
 * @postId      ID
 * @content     내용
 * @image       첨부 이미지 저장 경로
 */
const Sequelize = require("sequelize");

class Post extends Sequelize.Model {
    static initiate(sequelize) {
        Post.init({
            postId: {
                type: Sequelize.STRING(40),     // 최대 길이 40
                allowNull: false,               // 값은 null을 허용하지 않는다.
                unique: true,                   // Primary Key
            },

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

    static associate(db) {
        db.Post.belongsTo(db.User, { foreignKey: "writer", targetKey: "userId" });
        db.Post.belongsToMany(db.Emotion, { through: "PostEmotion" });
        db.Post.hasOne(db.Sentiment, { foreignKey: "postId", sourceKey: "postId", onDelete: "cascade" });
    }
}

module.exports = Post;