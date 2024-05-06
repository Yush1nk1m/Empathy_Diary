const Sequelize = require("sequelize");
const Chatroom = require("./chatroom");
const config = require("../config/config")["test"];
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

describe("Chatroom model", () => {
    test("static initiate 메소드를 호출한다.", () => {
        expect(Chatroom.initiate(sequelize)).toBe(undefined);
    });

    test("static associate 메소드를 호출한다.", () => {
        const db = {
            Chatroom: {
                belongsTo: jest.fn(),
                hasMany: jest.fn(),
            },
            User: {},
            Chat: {},
        };

        Chatroom.associate(db);

        expect(db.Chatroom.belongsTo).toBeCalledWith(db.User, { foreignKey: "userId", targetKey: "id", onDelete: "CASCADE", hooks: true });
        expect(db.Chatroom.hasMany).toBeCalledWith(db.Chat, { foreignKey: "roomId", sourceKey: "id" });
    });
});