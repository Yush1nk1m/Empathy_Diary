/*
[Advice Router]

어떤 회원이 다른 회원에게 보낼 수 있는 조언과 관련된 정보들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| GET | /advices/today | a-01 | 오늘 자신에게 온 조언 조회 |
| GET | /advices/me | a-02 | 작성한 모든 조언 조회 |
| POST | /advices | a-03 | 조언 작성 |
| PATCH | /advices | a-04 | 조언 내용 수정 |
| DELETE | /advices/{adviceId} | a-05 | 조언 삭제 |
*/
const express = require("express");

const { isLoggedIn } = require("../middlewares");
const { writeAdvice, getDailyAdvices } = require("../controllers/advice");

const router = express.Router();

// [a-01] GET /advices/today
router.get("/today", isLoggedIn, getDailyAdvices);

// [a-02] GET /advices/me
router.get("/me",);

// [a-03] POST /advices
router.post("/", isLoggedIn, writeAdvice);

// [a-04] PATCH /advices
router.patch("/",);

// [a-05] /advices/{adviceId}
router.delete("/:adviceId",);

module.exports = router;