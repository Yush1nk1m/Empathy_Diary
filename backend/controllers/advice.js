const Op = require("sequelize").Op;
const { sequelize, Advice, Emotion } = require("../models");

const dateOptions = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: 'Asia/Seoul', // 한국 시간대 설정
};
const timeOptions = {
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Seoul', // 한국 시간대 설정
    hour12: false // 24시간 표기법 사용
};

// [a-01] 오늘 자신에게 온 조언 조회
exports.getDailyAdvices = async (req, res, next) => {
    try {
        const user = req.user;

        // 오늘 사용자가 느낀 감정 조회
        let emotions = new Set();
        const posts = await user.getPosts();
        for (const post of posts) {
            const postEmotions = await post.getEmotions();
            for (const emotion of postEmotions) {
                emotions.add(emotion.type);
            }
        }

        const today = new Date(new Date().setHours(0, 0, 0, 0));
        const tomorrow = new Date(new Date().setHours(24, 0, 0, 0));

        // 감정별로 사용자에게 온 조언 조회
        let advices = new Map();
        for (const type of emotions) {
            const adviceEmotions = await Advice.findAll({
                include: [{
                    model: Emotion,
                    where: {
                        type,
                    },
                }],
                where: {
                    writer: {
                        [Op.ne]: user.id,                   // 자신이 작성한 조언은 제외한다.
                    },
                    createdAt: {
                        [Op.between]: [today, tomorrow],    // 오늘 작성된 조언만 포함한다.
                    },
                },
            });

            for (const advice of adviceEmotions) {
                advices.set(advice.id, advice);
            }
        }

        advices = advices.values();
        advices = [...advices].map((advice) => {
            return {
                content: advice.content,
                writeDate: (advice.createdAt).toLocaleString("ko-KR", dateOptions),
                writeTime: (advice.createdAt).toLocaleString("ko-KR", timeOptions),
            };
        });

        return res.status(200).json({ advices });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// [a-02] 작성한 모든 조언 조회
exports.getMyAllAdvices = async (req, res, next) => {
    try {
        let advices = await Advice.findAll({
            where: {
                writer: req.user.id,
            },
        });

        advices = advices.map((advice) => {
            return {
                adviceId: advice.id,
                content: advice.content,
                writeDate: (advice.createdAt).toLocaleString("ko-KR", dateOptions),
                writeTime: (advice.createdAt).toLocaleString("ko-KR", timeOptions),
            };
        });

        return res.status(200).json({ advices });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// [a-03] 조언 작성
exports.writeAdvice = async (req, res, next) => {
    const transaction = await sequelize.transaction();
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
        }, {
            transaction,
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
            await advice.addEmotions(emotion, { transaction });
        }

        emotions = [...emotions].map(emotion => emotion.type);

        await transaction.commit();

        return res.status(200).json({
            adviceId: advice.id,
            content: advice.content,
            emotions,
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        next(error);
    }
};