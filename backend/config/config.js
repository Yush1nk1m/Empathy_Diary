const path = require("path");
// 현재 config.js 파일 위치 기준으로 한 단계 위(..), 즉 backend/ 폴더 바로 아래의 .env를 명시적으로 지정
require("dotenv").config({ path: path.join(__dirname, "../.env") });

module.exports = {
  "development": {
    "username": "root",
    "password": process.env.DB_PASSWORD,
    "database": "empathy_diary",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": process.env.DB_PASSWORD,
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