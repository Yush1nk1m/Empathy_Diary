const Sequelize = require("sequelize");
const PostEmotion = require("./postEmotion");
const config = require("../config/config")["test"];
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

describe("PostEmotion model", () => {
    test("static initiate 메소드를 호출한다.", () => {
        expect(PostEmotion.initiate(sequelize)).toBe(undefined);
    });
});