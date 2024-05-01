const Post = require("../models/post");

const dateOptions = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: 'Asia/Seoul', // 한국 시간대 설정
};
const timeOptions = {
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Seoul', // 한국 시간대 설정
    hour12: false // 24시간 표기법 사용
};

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

        result.forEach((diary) => {
            diaries.push({
                id: diary.dataValues.id,
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
};

// 추후 감정, 감성 정보도 함께 반환하도록 로직 추가
// [p-02] 특정 일기 조회
exports.getDiaryById = async (req, res, next) => {
    try {
        const postId = req.params.postId;

        const post = await Post.findOne({
            where: {
                id: postId,
            },
        });
        if (!post) {
            return res.status(404).send(`[id: ${postId}] 일기가 존재하지 않습니다.`);
        }

        if (post.writer !== req.user.id) {
            return res.status(403).send("접근 권한이 없습니다.");
        }

        const diary = {
            id: post.id,
            content: post.content,
            writeDate: (post.createdAt).toLocaleString("ko-KR", dateOptions),
            writeTime: (post.createdAt).toLocaleString("ko-KR", timeOptions),
        };

        return res.status(200).json({ diary });

    } catch (error) {
        console.error(error);
        next(error);
    }
};

// 추후 chatGPT API 연동 및 감정 정보 연결 로직 추가
// [p-03] 일기 등록
exports.postDiary = async (req, res, next) => {
    const { content } = req.body;
    try {
        if (content === '') {
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
};

// 추후 chatGPT API를 연결하여 일기를 새로 작성하는 것처럼 감정, 감성 분석을 다시 수행하는 로직을 추가한다.
// [p-04] 일기 내용 수정
exports.modifyDiaryContent = async (req, res, next) => {
    try {
        const { postId, newContent } = req.body;
        if (newContent === '') {
            return res.status(400).send("일기 내용이 존재하지 않습니다.");
        }

        let post = await Post.findOne({
            where: {
                id: postId,
            },
        });
        if (!post) {
            return res.status(404).send(`[id: ${postId}] 일기가 존재하지 않습니다.`);
        }

        if (post.writer !== req.user.id) {
            return res.status(403).send("접근 권한이 없습니다.");
        }

        if (post.content === newContent) {
            return res.status(400).send("수정될 내용이 없습니다.");
        }

        post.content = newContent;

        await post.save();

        return res.status(200).send("일기 내용을 수정했습니다.");
    } catch (error) {
        console.error(error);
        next(error);
    }
}