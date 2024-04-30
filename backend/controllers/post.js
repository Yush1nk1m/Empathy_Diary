const Post = require("../models/post");

// 추후 감정, 감성 정보도 함께 반환하도록 로직 추가
// [p-01] 모든 일기 조회
exports.getAllDiaries = async (req, res, next) => {
    try {
        const result = await Post.findAll({
            where: {
                writer: req.user.id,
            },
        });

        let diaries = [];

        const dateOptions = {
            year: 'numeric', month: '2-digit', day: '2-digit',
            timeZone: 'Asia/Seoul', // 한국 시간대 설정
        };
        const timeOptions = {
            hour: '2-digit', minute: '2-digit',
            timeZone: 'Asia/Seoul', // 한국 시간대 설정
            hour12: false // 24시간 표기법 사용
        }
        
        result.forEach((diary) => {

            diaries.push({
                content: diary.dataValues.content,
                writeDate: (diary.dataValues.createdAt).toLocaleString("ko-KR", dateOptions),
                writeTime: (diary.dataValues.createdAt).toLocaleString("ko-KR", timeOptions),
            });
        });

        return res.status(200).json({ diaries });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

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