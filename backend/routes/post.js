/*
[Post Router]

일기와 관련된 정보들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| GET | /posts | p-01 | 모든 일기 조회 |
| GET | /posts/{postId} | p-02 | 특정 일기 조회 |
| POST | /posts | p-03 | 일기 등록 |
| PATCH | /posts | p-04 | 일기 내용 수정 |
| DELETE | /posts/{postId} | p-05 | 일기 삭제 |
| GET | /posts/period?{startDate}&{endDate} | p-06 | 특정 기간 동안 작성한 모든 일기 조회 |
*/
const express = require("express");

const { isLoggedIn } = require("../middlewares");
const { postDiary, getAllDiaries, getDiaryById, modifyDiaryContent, deleteDiary, getDiariesForSpecificPeriod } = require("../controllers/post");

const router = express.Router();

// [p-01] GET /posts
router.get("/", isLoggedIn, getAllDiaries);

// [p-02] GET /posts/{postId}
router.get("/:postId", isLoggedIn, getDiaryById);

// [p-03] POST /posts
router.post("/", isLoggedIn, postDiary);

// [p-04] PATCH /posts
router.patch("/", isLoggedIn, modifyDiaryContent);

// [p-05] DELETE /posts/{postId}
router.delete("/:postId", isLoggedIn, deleteDiary);

// [p-06] GET /posts/period?{startDate}&{endDate}
router.get("/period", isLoggedIn, getDiariesForSpecificPeriod);

module.exports = router;