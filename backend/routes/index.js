const express = require("express");

const userRouter = require("./user");
const postRouter = require("./post");
const adviceRouter = require("./advice");
const emotionRouter = require("./emotion");
const sentimentRouter = require("./sentiment");
const chatroomRouter = require("./chatroom");

const router = express.Router();

router.use("/users", userRouter);

router.use("/posts", postRouter);

router.use("/advices", adviceRouter);

router.use("/emotions", emotionRouter);

router.use("/sentiments", sentimentRouter);

router.use("/chatrooms", chatroomRouter);

module.exports = router;