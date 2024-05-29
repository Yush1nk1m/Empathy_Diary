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

        const startDate = new Date(new Date().setHours(0, 0, 0, 0));
    	const endDate = new Date(new Date().setHours(24, 0, 0, 0));

        // 오늘 사용자가 느낀 감정 조회
        let emotions = new Set();
        const posts = await user.getPosts({
    	    where: {
    	        createdAt: {
    		        [Op.between]: [startDate, endDate],
		        },
	        },
	    });
        
        // 병렬적으로 실행 가능한 프로미스들을 담을 배열을 선언한다.
        const promises = [];

        // 일기에 매핑된 감정을 불러오는 작업은 병렬 실행이 가능하므로 프로미스 배열에 저장한다.
        for (const post of posts) {
            promises.push(post.getEmotions());
        }

        // 매핑된 감정을 불러와 Set에 추가한다.
        const postEmotions = await Promise.all(promises);
        for (const postEmotion of postEmotions) {
            for (const emotion of postEmotion) {
                emotions.add(emotion.type);
            }
        }

        // 배열 초기화
        promises.length = 0;
        
        const today = new Date(new Date().setHours(0, 0, 0, 0));
        const tomorrow = new Date(new Date().setHours(24, 0, 0, 0));

        // 감정별로 사용자에게 온 조언 조회
        let advices = new Map();
        for (const type of emotions) {
            // 각 감정에 대한 조언을 찾는 작업은 병렬 실행이 가능하므로 프로미스 배열에 저장한다.
            promises.push(Advice.findAll({
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
            }));
        }

        // 조언을 불러와 Map을 사용해 Set과 같이 고유한 값만 저장한다.
        const adviceEmotions = await Promise.all(promises);
        for (const adviceEmotion of adviceEmotions) {
            for (const advice of adviceEmotion) {
                advices.set(advice.id, advice);
            }
        }

        // Map에서 값만 추출하여 Set처럼 만들고 반환 데이터를 추출한다.
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

        // 병렬 실행 가능한 프로미스들을 담을 배열을 선언한다.
        const promises = [];

        // 사용자 일기에 나타난 감정을 추출하여 Set으로 고유하게 저장한다.
        let emotions = new Set();
        for (const post of posts) {
            // 일기마다 매핑된 감정을 가져오는 작업은 병렬 실행 가능하므로 프로미스 배열에 저장한다.
            promises.push(post.getEmotions());
        }
        // 모든 프로미스를 병렬적으로 실행하고 그 결과를 Set에 저장한다.
        const postEmotions = await Promise.all(promises);
        for (const postEmotion of postEmotions) {
            for (const emotion of postEmotion) {
                emotions.add(emotion.type);
            }
        }

        // Set을 Array로 변환한다.
        emotions = [...emotions];

        // 조언과 감정 매핑
        for (const emotion of emotions) {
            await advice.addEmotions(emotion, { transaction });
        }


        await transaction.commit();

        return res.status(200).json({
            adviceId: advice.id,
            content: advice.content,
            emotions,
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

// [a-04] 조언 내용 수정
exports.modifyAdviceContent = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { adviceId, newContent } = req.body;
        if (!adviceId) {
            return res.status(400).send("조언 ID가 전달되지 않았습니다.");
        }
        if (!newContent) {
            return res.status(400).send("조언 내용이 전달되지 않았습니다.");
        }

        const advice = await Advice.findOne({
            where: {
                id: adviceId,
            },
        });

        if (advice.writer !== req.user.id) {
            return res.status(403).send("접근 권한이 없습니다.");
        }

        advice.content = newContent;

        await advice.save({ transaction });

        await transaction.commit();

        return res.status(200).json({
            adviceId,
            newContent,
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

// [a-05] 조언 삭제
exports.deleteAdvice = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const adviceId = req.params.adviceId;
        if (isNaN(adviceId)) {
            return next();
        }

        const advice = await Advice.findOne({
            where: {
                id: adviceId,
            },
        });
        if (!advice) {
            return res.status(404).send(`[ID: ${adviceId}] 조언이 존재하지 않습니다.`);
        }

        if (advice.writer !== req.user.id) {
            return res.status(403).send("접근 권한이 없습니다.");
        }

        await Advice.destroy({
            where: {
                id: adviceId,
            },
            transaction,
        })

        await transaction.commit();

        return res.status(200).send("조언이 삭제되었습니다.");
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};
