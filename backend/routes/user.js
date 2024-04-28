/*
[User Router]

회원과 관련된 정보들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| GET | /users | u-01 | 회원 정보 조회 |
| POST | /users | u-02 | 회원 가입 |
| POST | /users/login | u-03 | 로그인 |
| PATCH | /users | u-04 | 회원 정보 수정 |
| DELETE | /users | u-05 | 회원 탈퇴 |
*/
const express = require("express");

const router = express.Router();

// [u-01] GET /users
router.get("/",);

// [u-02] POST /users
router.post("/",);

// [u-03] POST /users/login
router.post("/login",);

// [u-04] PATCH /users
router.patch("/",);

// [u-05] DELETE /users
router.delete("/",);

module.exports = router;