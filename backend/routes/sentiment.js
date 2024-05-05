/*
[Sentiment Router]

일기장에 매핑된 감성과 관련된 정보들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| GET | /sentiments/period?{startDate}&{endDate} | s-01 | 특정 기간 동안의 감성 점수 조회 |
*/
const express = require("express");

const { isLoggedIn } = require("../middlewares");
const { getSentimentScoresForSpecificPeriod } = require("../controllers/sentiment");

const router = express.Router();

// [s-01] GET /sentiments/period?{startDate}&{endDate}
router.get("/period", isLoggedIn, getSentimentScoresForSpecificPeriod);

module.exports = router;