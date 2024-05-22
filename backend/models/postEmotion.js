// models/postEmotion.js
const { Sequelize, DataTypes } = require('sequelize');

class PostEmotion extends Sequelize.Model {
  static initiate(sequelize) {
    PostEmotion.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      PostId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Post',
          key: 'id',
        },
      },
      EmotionType: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Emotion',
          key: 'type',
        },
      },
    }, {
      sequelize,
      timestamps: false,
      underscored: false,
      modelName: 'PostEmotion',
      tableName: 'PostEmotions',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }
}

module.exports = PostEmotion;