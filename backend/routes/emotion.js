/*
[Emotion Router]

일기장에 매핑된 감정과 관련된 정보들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| GET | /emotions | e-01 | 사용자의 누적된 모든 감정 조회 |
| GET | /emotions/period?{startDate}&{endDate} | e-02 | 특정 기간 동안 누적된 감정 모두 조회 |
*/
const express = require("express");

const { isLoggedIn } = require("../middlewares");
const { getTotalEmotions, getTotalEmotionsForSpecificPeriod } = require("../controllers/emotion");

const router = express.Router();

// [e-01] GET /emotions
router.get("/", isLoggedIn, getTotalEmotions);

// [e-03] GET /emotions/period?{startDate}&{endDate}
router.get("/period", isLoggedIn, getTotalEmotionsForSpecificPeriod);

module.exports = router;