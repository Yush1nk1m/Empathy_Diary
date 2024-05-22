const Sequelize = require("sequelize");
const Emotion = require("./emotion");
const PostEmotion = require("./postEmotion");
const config = require("../config/config")["test"];
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

describe("Emotion model", () => {
    test("static initiate 메소드를 호출한다.", () => {
        expect(Emotion.initiate(sequelize)).toBe(undefined);
    });

    test("static associate 메소드를 호출한다.", () => {
        const db = {
            Emotion: {
                belongsToMany: jest.fn(),
            },
            Post: {},
            Advice: {},
        };

        Emotion.associate(db);

        expect(db.Emotion.belongsToMany).toBeCalledWith(db.Post, { through: db.PostEmotion, onDelete: "CASCADE", hooks: true });
        expect(db.Emotion.belongsToMany).toBeCalledWith(db.Advice, { through: "AdviceEmotions", onDelete: "CASCADE", hooks: true });
    });
});