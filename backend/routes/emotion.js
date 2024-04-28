/*
[Emotion Router]

일기장에 매핑된 감정과 관련된 정보들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| GET | /emotions | e-01 | 사용자의 누적된 모든 감정 조회 |
| GET | /emotions/{postId} | e-02 | 특정 일기장에 매핑된 감정 모두 조회 |
| GET | /emotions/duration?{startDate}&{endDate} | e-03 | 특정 기간 동안 매핑된 감정 모두 조회 |
*/
const express = require("express");

const router = express.Router();

// [e-01] GET /emotions
router.get("/",);

// [e-02] GET /emotions/{postId}
router.get("/:postId",);

// [e-03] GET /emotions/duration?{startDate}&{endDate}
router.get("/duration",);

module.exports = router;