/*
[Chatroom Router]

사용자와 AI 챗봇의 대화와 관련된 내용들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| POST | /chatrooms | cr-01 | AI 챗봇과의 대화방 생성 |
| POST | /chatrooms/summary | cr-02 | AI 챗봇과의 대화 제출(요약 생성) |
| GET | /chatrooms | cr-03 | AI 챗봇과의 최근 대화 내용 불러오기 |
| POST | /chatrooms/chats | cr-04 | AI 챗봇에게 메시지 전송 |
*/
const express = require("express");

const { isLoggedIn } = require("../middlewares");
const { createNewChatRoom, sendMessage } = require("../controllers/chatroom");

const router = express.Router();

// [cr-01] POST /chatrooms
router.post("/", isLoggedIn, createNewChatRoom);

// [cr-02] POST /chatrooms/summary
router.post("/summary",);

// [cr-03] GET /chatrooms
router.get("/",);

// [cr-04] POST /chatrooms/chats
router.post("/chats", isLoggedIn, sendMessage);

module.exports = router;