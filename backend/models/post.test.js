const Sequelize = require("sequelize");
const Post = require("./post");
const config = require("../config/config")["test"];
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

describe("Post model", () => {
    test("static initiate 메소드를 호출한다.", () => {
        expect(Post.initiate(sequelize)).toBe(undefined);
    });

    test("static associate 메소드를 호출한다.", () => {
        const db = {
            Post: {
                belongsTo: jest.fn(),
                belongsToMany: jest.fn(),
                hasOne: jest.fn(),
            },
            User: {},
            Emotion: {},
            Sentiment: {},
        };

        Post.associate(db);

        expect(db.Post.belongsTo).toBeCalledWith(db.User, { foreignKey: "writer", targetKey: "id" });
        expect(db.Post.belongsToMany).toBeCalledWith(db.Emotion, { through: "PostEmotions" });
        expect(db.Post.hasOne).toBeCalledWith(db.Sentiment, { foreignKey: "postId", sourceKey: "id", onDelete: "CASCADE", hooks: true });
    });
});