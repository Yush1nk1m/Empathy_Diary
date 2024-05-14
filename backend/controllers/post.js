const Op = require("sequelize").Op;
const { sequelize, Post, Sentiment } = require("../models");
const db = require("../models");
const PostEmotions = db.sequelize.models.PostEmotions;
const { analysisDiary } = require("../services/openai");

const dateOptions = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: 'Asia/Seoul', // 한국 시간대 설정
};
const timeOptions = {
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Seoul', // 한국 시간대 설정
    hour12: false // 24시간 표기법 사용
};

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
        next(error);
    }
};

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
            return res.status(404).send(`[ID: ${postId}] 일기가 존재하지 않습니다.`);
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
        next(error);
    }
};

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

        // chatGPT API를 통해 일기 내용을 분석하고 감정, 감성 정보를 데이터베이스에 등록한다.
        const LLMResponse = await analysisDiary(content);

        // 병렬적으로 실행할 수 있는 모든 프로미스 저장
        const promises = [];

        // 데이터베이스에 감정 정보 등록하는 프로미스 저장
        for (const emotion of LLMResponse.emotions) {
            promises.push(PostEmotions.create({
                PostId: post.id,
                EmotionType: emotion,
            }, {
                transaction,
            }));
        }
        
        // 데이터베이스에 감성 정보 등록하는 프로미스 저장
        promises.push(Sentiment.create({
            positive: LLMResponse.positiveScore,
            negative: LLMResponse.negativeScore,
            postId: post.id,
        }, {
            transaction,
        }));
        
        // 저장된 프로미스들 병렬 실행
        await Promise.all(promises);

        await transaction.commit();

        return res.status(200).json({
            postId: post.id,
            emotions: LLMResponse.emotions,
            positiveScore: LLMResponse.positiveScore,
            negativeScore: LLMResponse.negativeScore,
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

// [p-04] 일기 내용 수정
exports.modifyDiaryContent = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { postId, newContent } = req.body;
        if (!newContent) {
            return res.status(400).send("일기 내용이 존재하지 않습니다.");
        }

        let post = await Post.findOne({
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

        post.content = newContent;

        // 동시 실행 가능한 프로미스들 저장
        const promises = [];

        // 변경된 일기 내용을 저장
        promises.push(post.save({ transaction }));

        // 기존 정보를 삭제하는 연산들은 동시 실행 가능하므로 저장한다.

        // 감정 정보 삭제
        promises.push(PostEmotions.destroy({
            where: {
                PostId: post.id,
            },
        }, {
            transaction,
        }));

        // 감성 정보 삭제
        promises.push(Sentiment.destroy({
            where: {
                postId: post.id,
            },
        }, {
            transaction,
        }));

        // 프로미스 병렬 실행 및 배열 초기화
        await Promise.all(promises);
        promises.length = 0;

        // chatGPT API를 통해 일기 내용을 분석하고 감정, 감성 정보를 데이터베이스에 등록한다.
        const LLMResponse = await analysisDiary(newContent);

        // 데이터베이스에 새로운 정보를 추가하는 연산들은 동시 실행 가능하므로 프로미스 목록에 추가한다.

        // 감정 정보 등록
        for (const emotion of LLMResponse.emotions) {
            promises.push(PostEmotions.create({
                PostId: post.id,
                EmotionType: emotion,
            }, {
                transaction,
            }));
        }

        // 감성 정보 등록
        promises.push(Sentiment.create({
            positive: LLMResponse.positiveScore,
            negative: LLMResponse.negativeScore,
            postId: post.id,
        }, {
            transaction,
        }));

        // 프로미스 병렬 실행
        await Promise.all(promises);

        await transaction.commit();

        return res.status(200).json({
            postId: post.id,
            emotions: LLMResponse.emotions,
            positiveScore: LLMResponse.positiveScore,
            negativeScore: LLMResponse.negativeScore,
        });
    } catch (error) {
        await transaction.rollback();
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
        next(error);
    }
};

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
        next(error);
    }
};