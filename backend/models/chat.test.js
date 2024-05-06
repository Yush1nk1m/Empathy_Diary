const Sequelize = require("sequelize");
const Chat = require("./chat");
const config = require("../config/config")["test"];
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

describe("Chat model", () => {
    test("static initiate 메소드를 호출한다.", () => {
        expect(Chat.initiate(sequelize)).toBe(undefined);
    });

    test("static associate 메소드를 호출한다.", () => {
        const db = {
            Chat: {
                belongsTo: jest.fn(),
            },
            Chatroom: {},
        };

        Chat.associate(db);

        expect(db.Chat.belongsTo).toBeCalledWith(db.Chatroom, { foreignKey: "roomId", targetKey: "id", onDelete: "CASCADE", hooks: true });
    });
});