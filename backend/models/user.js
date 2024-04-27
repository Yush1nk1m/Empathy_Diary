/**
 * [사용자 테이블]
 * @id          로우 고유의 ID
 * @userId      로그인 시 사용되는 ID
 * @email       이메일
 * @nickname    닉네임
 * @password    비밀번호
 * @createdAt   회원 가입 일시
 * @updatedAt   회원 정보 수정 일시
 * @deletedAt   탈퇴 일시
 */
const Sequelize = require("sequelize");

class User extends Sequelize.Model {
    static initiate(sequelize) {
        User.init({
            userId: {
                type: Sequelize.STRING(20),     // 최대 길이 20
                allowNull: false,               // null을 허용하지 않는다.
                unique: true,                   // 유일한 값을 갖는다.
            },

            email: {
                type: Sequelize.STRING(50),     // 최대 길이 50
                allowNull: true,                // null을 허용한다.
                unique: true,                   // 값이 유일해야 한다.
            },

            nickname: {
                type: Sequelize.STRING(20),     // 최대 길이 20
                allowNull: false,               // null을 허용하지 않는다.
            },

            password: {
                type: Sequelize.STRING(100),    // 최대 길이 100
                allowNull: false,               // null을 허용하지 않는다.
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: "User",
            tableName: "users",
            paranoid: true,
            charset: "utf8",
            collate: "utf8_general_ci",
        });
    }

    static associate(db) {
        db.User.hasMany(db.Post, { foreignKey: "writer", sourceKey: "id", onDelete: "cascade" });
        db.User.hasMany(db.Advice, { foreignKey: "writer", sourceKey: "id", onDelete: "cascade" });
        db.User.hasMany(db.Chatroom, { foreignKey: "user", sourceKey: "id", onDelete: "cascade" });
    }
};

module.exports = User;