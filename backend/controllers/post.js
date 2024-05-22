const Op = require("sequelize").Op;
const { sequelize, Post, Sentiment, PostEmotion } = require("../models");
const db = require("../models");
const { analysisDiary, analysisMainEmotion } = require("../services/openai");

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
        console.error(error);
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
        let LLMResponse = await analysisDiary(content);
        let LLMResponse2 = await analysisMainEmotion(content);

        // 환각 현상으로 올바른 데이터가 응답되지 않을 경우 다시 요청을 발생시킨다.
        const retryCount = 0;
        while (LLMResponse.emotions === undefined || LLMResponse.positiveScore === undefined || LLMResponse.negativeScore === undefined || LLMResponse2.emotion === undefined) {
            if (retryCount >= 3) throw new Error("반복적인 시도에도 환각 현상이 해결되지 않아 서버 에러를 발생시킵니다.");
            LLMResponse = await analysisDiary(content);
            LLMResponse2 = await analysisMainEmotion(content);
            retryCount++;
        }

        // LLM의 환각 현상으로 잘못된 데이터가 추가되는 것을 방지하기 위해 데이터베이스에 저장된 감정 리스트를 가져온다.
        const emotionList = ["기쁨", "사랑", "뿌듯함", "우울", "불안", "분노", "놀람", "외로움", "공포", "후회", "부끄러움"];
        // 환각 현상으로 생성된 목록 외 감정을 제거한다.
        LLMResponse.emotions = LLMResponse.emotions.filter((emotion) => {
            return emotionList.includes(emotion) && emotion !== LLMResponse2.emotion;
        });
        // 가장 강렬하게 나타난 감정이 맨 앞에 오도록 한다.
        LLMResponse.emotions.unshift(LLMResponse2.emotion);

        // 데이터베이스에 감정 정보 등록하는 프로미스 저장
        for (const emotion of LLMResponse.emotions) {
            await PostEmotion.create({
                PostId: post.id,
                EmotionType: emotion,
            }, {
                transaction,
            });
        }
        
        // 데이터베이스에 감성 정보 등록하는 프로미스 저장
        await Sentiment.create({
            positive: LLMResponse.positiveScore,
            negative: LLMResponse.negativeScore,
            postId: post.id,
        }, {
            transaction,
        });
        
        await transaction.commit();

        return res.status(200).json({
            postId: post.id,
            emotions: LLMResponse.emotions,
            positiveScore: LLMResponse.positiveScore,
            negativeScore: LLMResponse.negativeScore,
        });
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        next(error);
    }
};

// 시연용 임시 기능
exports.postDiaryTest = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { content, date } = req.body;
        if (!content || !date) {
            return res.status(400).send("요청 바디 형식이 부적절합니다.");
        }
        
        const post = await Post.create({
            content,
            image: null,
            writer: req.user.id,
            createdAt: new Date(date),
        }, {
            transaction,
        });

        // chatGPT API를 통해 일기 내용을 분석하고 감정, 감성 정보를 데이터베이스에 등록한다.
        let LLMResponse = await analysisDiary(content);
        let LLMResponse2 = await analysisMainEmotion(content);

        // 환각 현상으로 올바른 데이터가 응답되지 않을 경우 다시 요청을 발생시킨다.
        const retryCount = 0;
        while (LLMResponse.emotions === undefined || LLMResponse.positiveScore === undefined || LLMResponse.negativeScore === undefined || LLMResponse2.emotion === undefined) {
            if (retryCount >= 3) throw new Error("반복적인 시도에도 환각 현상이 해결되지 않아 서버 에러를 발생시킵니다.");
            LLMResponse = await analysisDiary(content);
            LLMResponse2 = await analysisMainEmotion(content);
            retryCount++;
        }

        // LLM의 환각 현상으로 잘못된 데이터가 추가되는 것을 방지하기 위해 데이터베이스에 저장된 감정 리스트를 가져온다.
        const emotionList = ["기쁨", "사랑", "뿌듯함", "우울", "불안", "분노", "놀람", "외로움", "공포", "후회", "부끄러움"];
        // 환각 현상으로 생성된 목록 외 감정을 제거한다.
        LLMResponse.emotions = LLMResponse.emotions.filter((emotion) => {
            return emotionList.includes(emotion) && emotion !== LLMResponse2.emotion;
        });
        // 가장 강렬하게 나타난 감정이 맨 앞에 오도록 한다.
        LLMResponse.emotions.unshift(LLMResponse2.emotion);

        // 데이터베이스에 감정 정보 등록하는 프로미스 저장
        for (const emotion of LLMResponse.emotions) {
            await PostEmotion.create({
                PostId: post.id,
                EmotionType: emotion,
            }, {
                transaction,
            });
        }
        
        // 데이터베이스에 감성 정보 등록하는 프로미스 저장
        await Sentiment.create({
            positive: LLMResponse.positiveScore,
            negative: LLMResponse.negativeScore,
            postId: post.id,
        }, {
            transaction,
        });
        
        await transaction.commit();

        return res.status(200).json({
            postId: post.id,
            emotions: LLMResponse.emotions,
            positiveScore: LLMResponse.positiveScore,
            negativeScore: LLMResponse.negativeScore,
        });
    } catch (error) {
        console.error(error);
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

        // 변경된 일기 내용을 저장
        await post.save({ transaction });

        // 감정 정보 삭제
        await PostEmotion.destroy({
            where: {
                PostId: post.id,
            },
            transaction,
        });

        // 감성 정보 삭제
        await Sentiment.destroy({
            where: {
                postId: post.id,
            },
            transaction,
        });

        // chatGPT API를 통해 일기 내용을 분석하고 감정, 감성 정보를 데이터베이스에 등록한다.
        let LLMResponse = await analysisDiary(newContent);
        let LLMResponse2 = await analysisMainEmotion(newContent);

        // 환각 현상으로 올바른 데이터가 응답되지 않을 경우 다시 요청을 발생시킨다.
        const retryCount = 0;
        while (LLMResponse.emotions === undefined || LLMResponse.positiveScore === undefined || LLMResponse.negativeScore === undefined || LLMResponse2.emotion === undefined) {
            if (retryCount >= 3) throw new Error("반복적인 시도에도 환각 현상이 해결되지 않아 서버 에러를 발생시킵니다.");
            LLMResponse = await analysisDiary(newContent);
            LLMResponse2 = await analysisMainEmotion(newContent);
            retryCount++;
        }

        // LLM의 환각 현상으로 잘못된 데이터가 추가되는 것을 방지하기 위해 데이터베이스에 저장된 감정 리스트를 가져온다.
        const emotionList = ["기쁨", "사랑", "뿌듯함", "우울", "불안", "분노", "놀람", "외로움", "공포", "후회", "부끄러움"];
        // 환각 현상으로 생성된 목록 외 감정을 제거한다.
        LLMResponse.emotions = LLMResponse.emotions.filter((emotion) => {
            return emotionList.includes(emotion) && emotion !== LLMResponse2.emotion;
        });
        // 가장 강렬하게 나타난 감정이 맨 앞에 오도록 한다.
        LLMResponse.emotions.unshift(LLMResponse2.emotion);
        console.log(LLMResponse.emotions);

        // 감정 정보 등록
        for (const emotion of LLMResponse.emotions) {
            await PostEmotion.create({
                PostId: post.id,
                EmotionType: emotion,
            }, {
                transaction,
            });
        }

        // 감성 정보 등록
        await Sentiment.create({
            positive: LLMResponse.positiveScore,
            negative: LLMResponse.negativeScore,
            postId: post.id,
        }, {
            transaction,
        });

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

        // 조회된 일기들을 저장할 배열을 선언한다.
        const diaries = [];
        // 병렬적으로 실행 가능한 프로미스들을 담을 배열을 선언한다.
        const emotionPromises = [];
        const sentimentPromises = [];

        // 각 일기에서 매핑된 감정, 감성 정보를 불러오는 작업을 모두 프로미스 배열에 저장한다.
        for (const post of posts) {
            diaries.push({
                id: post.id,
                content: post.content,
                writeDate: (post.createdAt).toLocaleString("ko-KR", dateOptions),
                writeTime: (post.createdAt).toLocaleString("ko-KR", timeOptions),
            });  // 미리 일기 자체의 속성만으로 일겨 배열을 구성한다.
            emotionPromises.push(post.getEmotions());
            sentimentPromises.push(post.getSentiment());
        }

        // 프로미스를 병렬적으로 실행한다.
        const [emotionArrays, sentimentArrays] = await Promise.all([
            Promise.all(emotionPromises),
            Promise.all(sentimentPromises),
        ]);

        // 일기 배열에 감정, 감성 정보를 추가한다.
        for (let i = 0; i < diaries.length; i++) {
            diaries[i].emotions = emotionArrays[i].map(emotion => emotion.type);
            diaries[i].positiveScore = sentimentArrays[i].positive;
            diaries[i].negativeScore = sentimentArrays[i].negative;
        }

        return res.status(200).json({ diaries });
    } catch (error) {
        next(error);
    }
};