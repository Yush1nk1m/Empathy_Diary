/*
[Chatroom Router]

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| POST | /chatrooms | cr-01 | AI 챗봇과의 대화방 생성 |
| POST | /chatrooms/posts | cr-02 | AI 챗봇과의 대화 제출(요약 생성) |
| GET | /chatrooms | cr-03 | 최근 대화방 내용 다시 불러오기 |
| POST | /chatrooms/chats | cr-04 | AI 챗봇에게 메시지 전송 |
*/
const express = require("express");

const { isLoggedIn } = require("../middlewares");
const { createNewChatRoom } = require("../controllers/chatroom");

const router = express.Router();

// [cr-01] POST /chatrooms
router.post("/", isLoggedIn, createNewChatRoom);

// [cr-02] POST /chatrooms/posts
router.post("/posts",);

// [cr-03] GET /chatrooms
router.get("/",);

// [cr-04] POST /chatrooms/chats
router.post("/chats",);

module.exports = router;