const Sequelize = require("sequelize");
const User = require("./user");
const Advice = require("./advice");
const Post = require("./post");
const Emotion = require("./emotion");
const Sentiment = require("./sentiment");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];

const db = {};
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.User = User;
db.Advice = Advice;
db.Post = Post;
db.Emotion = Emotion;
db.Sentiment = Sentiment;

User.initiate(sequelize);
Advice.initiate(sequelize);
Post.initiate(sequelize);
Emotion.initiate(sequelize);
Sentiment.initiate(sequelize);

User.associate(db);
Advice.associate(db);
Post.associate(db);
Emotion.associate(db);
Sentiment.associate(db);

module.exports = db;