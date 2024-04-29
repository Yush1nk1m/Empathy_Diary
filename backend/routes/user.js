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
| POST | /users/logout | u-06 | 로그아웃 |
*/
const express = require("express");
const passport = require("passport");

const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
const { join, login, logout, getUserInfo, modifyUserInfo } = require("../controllers/user");

const router = express.Router();

// [u-01] GET /users
router.get("/", isLoggedIn, getUserInfo);

// [u-02] POST /users
router.post("/", isNotLoggedIn, join);

// [u-03] POST /users/login
router.post("/login", isNotLoggedIn, login);

// [u-04] PATCH /users
router.patch("/", isLoggedIn, modifyUserInfo);

// [u-05] DELETE /users
router.delete("/",);

// [u-06] POST /users/logout
router.post("/logout", isLoggedIn, logout);

module.exports = router;