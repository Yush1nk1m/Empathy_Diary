/*
[Sentiment Router]

일기장에 매핑된 감성과 관련된 정보들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| GET | /sentiments/{postId} | e-01 | 특정 일기장의 감성 점수 조회 |
| GET | /sentiments/duration?{startDate}&{endDate} | e-02 | 특정 기간 동안의 감성 점수 조회 |
*/
const express = require("express");

const router = express.Router();

// [e-01] GET /sentiments/{postId}
router.get("/:postId",);

// [e-02] GET /sentiments/duration?{startDate}&{endDate}
router.get("/duration",);

module.exports = router;