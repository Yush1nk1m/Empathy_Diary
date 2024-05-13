const Sequelize = require("sequelize");
const Advice = require("./advice");
const config = require("../config/config")["test"];
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

describe("Advice model", () => {
    test("static initiate 메소드를 호출한다.", () => {
        expect(Advice.initiate(sequelize)).toBe(undefined);
    });

    test("static associate 메소드를 호출한다.", () => {
        const db = {
            Advice: {
                belongsTo: jest.fn(),
                belongsToMany: jest.fn(),
            },
            User: {},
            Emotion: {},
        };

        Advice.associate(db);

        expect(db.Advice.belongsTo).toBeCalledWith(db.User, { foreignKey: "writer", targetKey: "id" });
        expect(db.Advice.belongsToMany).toBeCalledWith(db.Emotion, { through: "AdviceEmotions", onDelete: "CASCADE", hooks: true });
    });
});