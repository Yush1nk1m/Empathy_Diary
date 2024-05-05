const Op = require("sequelize").Op;
const { sequelize, Post, Emotion } = require("../models");

const dateOptions = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: 'Asia/Seoul', // 한국 시간대 설정
};
const timeOptions = {
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Seoul', // 한국 시간대 설정
    hour12: false // 24시간 표기법 사용
};

// [e-01] 사용자의 누적된 모든 감정 조회
exports.getTotalEmotions = async (req, res, next) => {
    try {
        // 모든 감정의 종류를 조회하고 맵을 생성한다.
        let emotions = await Emotion.findAll();
        const emotionMap = new Map();
        
        emotions.forEach((emotion) => {
            emotionMap.set(emotion.type, 0);
        });

        // 사용자가 작성한 모든 일기를 조회하고 감정 개수를 맵에 매핑한다.
        const posts = await Post.findAll({
            include: {
                model: Emotion,
            },
            where: {
                writer: req.user.id,
            },
        });

        for (const post of posts) {
            for (const emotion of post.Emotions) {
                emotionMap.set(emotion.type, emotionMap.get(emotion.type) + 1);
            }
        }

        // 맵의 키와 값을 리스트로 만든다.
        emotions = [...emotionMap.keys()].map((emotion) => {
            return {
                [emotion]: emotionMap.get(emotion),
            };
        });

        return res.status(200).json({ emotions });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// [e-02] 특정 기간 동안 누적된 감정 모두 조회
exports.getTotalEmotionsForSpecificPeriod = async (req, res, next) => {
    try {
        let { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).send("충분한 쿼리 파라미터가 제공되지 않았습니다.");
        }
        
        startDate = new Date(new Date(startDate).setHours(0, 0, 0, 0));
        endDate = new Date(new Date(endDate).setHours(24, 0, 0, 0));

        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).send("쿼리 파라미터의 값이 유효하지 않습니다.");
        }

        // 모든 감정의 종류를 조회하고 맵을 생성한다.
        let emotions = await Emotion.findAll();
        const emotionMap = new Map();
        
        emotions.forEach((emotion) => {
            emotionMap.set(emotion.type, 0);
        });

        // 사용자가 작성한 모든 일기를 조회하고 감정 개수를 맵에 매핑한다.
        const posts = await Post.findAll({
            include: {
                model: Emotion,
            },
            where: {
                writer: req.user.id,
                createdAt: {
                    [Op.between]: [startDate, endDate],
                },
            },
        });

        for (const post of posts) {
            for (const emotion of post.Emotions) {
                emotionMap.set(emotion.type, emotionMap.get(emotion.type) + 1);
            }
        }

        // 맵의 키와 값을 리스트로 만든다.
        emotions = [...emotionMap.keys()].map((emotion) => {
            return {
                [emotion]: emotionMap.get(emotion),
            };
        });

        return res.status(200).json({ emotions });
    } catch (error) {
        console.error(error);
        next(error);
    }
};