const Sequelize = require("sequelize");
const Sentiment = require("./sentiment");
const config = require("../config/config")["test"];
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

describe("Sentiment model", () => {
    test("static initiate 메소드를 호출한다.", () => {
        expect(Sentiment.initiate(sequelize)).toBe(undefined);
    });

    test("static associate 메소드를 호출한다.", () => {
        const db = {
            Sentiment: {
                belongsTo: jest.fn(),
            },
            Post: {},
        };

        Sentiment.associate(db);

        expect(db.Sentiment.belongsTo).toBeCalledWith(db.Post, { foreignKey: "postId", targetKey: "id" });
    });
});