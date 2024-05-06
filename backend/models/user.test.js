const Sequelize = require("sequelize");
const User = require("./user");
const config = require("../config/config")["test"];
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

describe("User model", () => {
    test("static initiate 메소드를 호출한다.", () => {
        expect(User.initiate(sequelize)).toBe(undefined);
    });

    test("static associate 메소드를 호출한다.", () => {
        const db = {
            User: {
                hasMany: jest.fn(),
            },
            Post: {},
            Advice: {},
            Chatroom: {},
        };

        User.associate(db);

        expect(db.User.hasMany).toBeCalledWith(db.Post, { foreignKey: "writer", sourceKey: "id" });
        expect(db.User.hasMany).toBeCalledWith(db.Advice, { foreignKey: "writer", sourceKey: "id" });
        expect(db.User.hasMany).toBeCalledWith(db.Chatroom, { foreignKey: "userId", sourceKey: "id" });        
    });
});