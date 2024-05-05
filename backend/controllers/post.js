const Op = require("sequelize").Op;
const { sequelize, Post, Sentiment } = require("../models");
const db = require("../models");
const PostEmotions = db.sequelize.models.PostEmotions;

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
        const posts = await Post.findAll({
            where: {
                writer: req.user.id,
            },
        });

        let diaries = [];

        for (const diary of posts) {
            let emotions = [];
            const result = await diary.getEmotions();
            for (const emotion of result) {
                emotions.push(emotion.type);
            }

            const sentiment = await diary.getSentiment();

            diaries.push({
                id: diary.id,
                content: diary.content,
                writeDate: (diary.createdAt).toLocaleString("ko-KR", dateOptions),
                writeTime: (diary.createdAt).toLocaleString("ko-KR", timeOptions),
                emotions,
                positiveScore: sentiment.positive,
                negativeScore: sentiment.negative,
            });
        }

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

        // URL의 해당 위치에 정수 값이 온 것이 아니라면 다른 경로에 대한 요청이다.
        if (isNaN(postId))
            return next();

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

        let emotions = [];
        const result = await post.getEmotions();
        for (const emotion of result) {
            emotions.push(emotion.type);
        }

        const sentiment = await post.getSentiment();

        const diary = {
            id: post.id,
            content: post.content,
            writeDate: (post.createdAt).toLocaleString("ko-KR", dateOptions),
            writeTime: (post.createdAt).toLocaleString("ko-KR", timeOptions),
            emotions,
            positiveScore: sentiment.positive,
            negativeScore: sentiment.negative,
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
    const transaction = await sequelize.transaction();

    try {
        const { content } = req.body;
        if (content === '') {
            return res.status(400).send("일기 내용이 존재하지 않습니다.");
        }
        
        const post = await Post.create({
            content,
            image: null,
            writer: req.user.id,
        }, {
            transaction,
        });

        // chatGPT API 연결 후엔 일정한 감정을 등록하는 것에서 분석 결과를 등록하는 것으로 바꾼다.
        const emotions = ["기쁨", "사랑", "뿌듯함"];
        for (const emotion of emotions) {
            await PostEmotions.create({
                PostId: post.id,
                EmotionType: emotion,
            }, {
                transaction,
            });
        }

        const positiveScore = 50;
        const negativeScore = 50;

        await Sentiment.create({
            positive: positiveScore,
            negative: negativeScore,
            postId: post.id,
        }, {
            transaction,
        });

        // chatGPT API 연결 후엔 일정한 감정을 등록하는 것에서 분석 결과를 등록하는 것으로 바꾼다.

        await transaction.commit();

        return res.status(200).json({
            postId: post.id,
            emotions,
            positiveScore,
            negativeScore,
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        next(error);
    }
};

// 추후 chatGPT API를 연결하여 일기를 새로 작성하는 것처럼 감정, 감성 분석을 다시 수행하는 로직을 추가한다.
// [p-04] 일기 내용 수정
exports.modifyDiaryContent = async (req, res, next) => {
    const transaction = await sequelize.transaction();

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

        await post.save({ transaction });

        // chatGPT API 연결 후엔 일정한 감정을 등록하는 것에서 분석 결과를 등록하는 것으로 바꾼다.
        // 기존 정보 삭제
        await PostEmotions.destroy({
            where: {
                PostId: post.id,
            },
        }, {
            transaction,
        });

        await Sentiment.destroy({
            where: {
                postId: post.id,
            },
        }, {
            transaction,
        });

        // 수정된 정보에 맞춰 다시 추가
        const emotions = ["기쁨", "사랑", "뿌듯함"];
        for (const emotion of emotions) {
            await PostEmotions.create({
                PostId: post.id,
                EmotionType: emotion,
            }, {
                transaction,
            });
        }

        const positiveScore = 50;
        const negativeScore = 50;

        await Sentiment.create({
            positive: positiveScore,
            negative: negativeScore,
            postId: post.id,
        }, {
            transaction,
        });

        // chatGPT API 연결 후엔 일정한 감정을 등록하는 것에서 분석 결과를 등록하는 것으로 바꾼다.

        await transaction.commit();

        return res.status(200).json({
            postId: post.id,
            emotions,
            positiveScore,
            negativeScore,
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        next(error);
    }
};

// [p-05] 일기 삭제
exports.deleteDiary = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const postId = req.params.postId;

        const post = await Post.findOne({
            where: {
                id: postId,
            },
        });

        if (!post) {
            return res.status(404).send(`[ID: ${postId}] 일기가 존재하지 않습니다.`);
        }

        if (post.writer !== req.user.id) {
            return res.status(403).send("접근 권한이 없습니다.");
        }

        await Post.destroy({
            where: {
                id: postId,
            },
            transaction,
        });

        await transaction.commit();

        return res.status(200).send("일기가 삭제되었습니다.");
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        next(error);
    }
};

// 추후 chatGPT API 연결 이후 감정, 감성 점수 반환 로직 추가
// [p-06] 특정 기간 일기 조회
exports.getDiariesForSpecificPeriod = async (req, res, next) => {
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

        const posts = await Post.findAll({
            where: {
                writer: req.user.id,
                createdAt: {
                    [Op.between]: [startDate, endDate],
                },
            },
        });

        let diaries = [];

        for (const diary of posts) {
            let emotions = [];
            const result = await diary.getEmotions();
            for (const emotion of result) {
                emotions.push(emotion.type);
            }

            const sentiment = await diary.getSentiment();

            diaries.push({
                id: diary.id,
                content: diary.content,
                writeDate: (diary.createdAt).toLocaleString("ko-KR", dateOptions),
                writeTime: (diary.createdAt).toLocaleString("ko-KR", timeOptions),
                emotions,
                positiveScore: sentiment.positive,
                negativeScore: sentiment.negative,
            });
        }

        return res.status(200).json({ diaries });
    } catch (error) {
        console.error(error);
        next(error);
    }
};