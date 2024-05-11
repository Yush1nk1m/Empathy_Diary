require("dotenv").config();

module.exports = {
  "development": {
    "username": "root",
    "password": process.env.SEQUELIZE_PASSWORD,
    "database": "empathy_diary",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": process.env.SEQUELIZE_PASSWORD,
    "database": "empathy_diary_test",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "logging": false,
  },
  "production": {
    "username": "dbmasteruser",
    "password": process.env.AWS_MYSQL_PASSWORD,
    "database": "empathy_diary_production",
    "host": "ls-0d3643b4dce3940505ab97d7230434586c352465.cvm0cq22wskr.ap-northeast-2.rds.amazonaws.com",
    "dialect": "mysql",
    "logging": false,
  },
};
