const Post = require("../models/post");

// 추후 chatGPT API 연동 및 감정 정보 연결 로직 추가
// [p-03] 일기 등록
exports.postDiary = async (req, res, next) => {
    const { content } = req.body;
    try {
        if (content === '' || content === null) {
            return res.status(400).send("일기 내용이 존재하지 않습니다.");
        }
        
        await Post.create({
            content,
            image: null,
            writer: req.user.id,
        });

        return res.status(200).send("일기가 작성되었습니다.");        
    } catch (error) {
        console.error(error);
        next(error);
    }
}