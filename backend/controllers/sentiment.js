const Op = require("sequelize").Op;
const { Post, Sentiment } = require("../models");

const dateOptions = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: 'Asia/Seoul', // 한국 시간대 설정
};

// [s-01] 특정 기간 동안의 감성 점수 조회
exports.getSentimentScoresForSpecificPeriod = async (req, res, next) => {
    try {
        let { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).send("충분한 쿼리 파라미터가 전달되지 않았습니다.");
        }

        startDate = new Date(new Date(startDate).setHours(0, 0, 0, 0));
        endDate = new Date(new Date(endDate).setHours(24, 0, 0, 0));

        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).send("쿼리 파라미터의 값이 유효하지 않습니다.");
        }

        // 특정 기간 동안의 감성 점수 조회
        let sentiments = await Sentiment.findAll({
            include: {
                model: Post,
                attributes: ["writer", "createdAt"],
                where: {
                    writer: req.user.id,
                    createdAt: {
                        [Op.between]: [startDate, endDate],
                    },
                },
            },
        });

        const countMap = new Map();         // 감성 점수 평균을 계산하기 위한 카운트 맵
        const positiveMap = new Map();      // 일별 긍정 점수 맵
        const negativeMap = new Map();      // 일별 부정 점수 맵

        // 맵에 감성 점수 정보 저장
        for (const sentiment of sentiments) {
            const date = (sentiment.Post.createdAt).toLocaleString("ko-KR", dateOptions);
            if (!countMap.has(date)) {
                countMap.set(date, 1);
                positiveMap.set(date, sentiment.positive);
                negativeMap.set(date, sentiment.negative);
            } else {
                countMap.set(date, countMap.get(date) + 1);
                positiveMap.set(date, positiveMap.get(date) + sentiment.positive);
                negativeMap.set(date, negativeMap.get(date) + sentiment.negative);
            }
        }

        // 긍정 점수 맵, 부정 점수 맵의 점수 평균 계산 및 반환할 리스트에 저장
        sentiments = [];
        for (const date of countMap.keys()) {
            positiveMap.set(date, positiveMap.get(date) / countMap.get(date));
            negativeMap.set(date, negativeMap.get(date) / countMap.get(date));

            sentiments.push({
                [date]: {
                    positive: positiveMap.get(date),
                    negative: negativeMap.get(date),
                }
            });
        }

        return res.status(200).json({ sentiments });
    } catch (error) {
        console.error(error);
        next(error);
    }
};