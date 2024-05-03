const Op = require("sequelize").Op;
const db = require("../models");
const { Advice } = require("../models");

// [a-03] 조언 작성
exports.writeAdvice = async (req, res, next) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).send("조언이 전달되지 않았습니다.");
        }

        const user = req.user;

        // 조언 생성
        const advice = await Advice.create({
            content,
            writer: user.id,
        });

        // 오늘과 내일 날짜 계산
        const today = new Date(new Date().setHours(0, 0, 0, 0));
        const tomorrow = new Date(new Date().setHours(24, 0, 0, 0));

        // 오늘 사용자가 작성한 일기 조회
        const posts = await user.getPosts({
            where: {
                createdAt: {
                    [Op.between]: [today, tomorrow],
                },
            },
        });

        // 사용자 일기에 나타난 감정 추출
        let emotions = new Set();
        for (const post of posts) {
            const postEmotions = await post.getEmotions();
            for (const emotion of postEmotions) {
                emotions.add(emotion);
            }
        }

        // 조언과 감정 매핑
        for (const emotion of emotions) {
            await advice.addEmotions(emotion);
        }

        emotions = [...emotions].map(emotion => emotion.type);

        return res.status(200).json({
            adviceId: advice.id,
            content: advice.content,
            emotions,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};