jest.mock("openai", () => {
    return jest.fn().mockImplementation(() => {
        return {
            chat: {
                completions: {
                    create: jest.fn().mockImplementation(async () => {
                        return { choices: [{ message: { content: "AI 응답" } }]};
                    })
                }
            }
        };
    });
});
require("openai");

jest.mock("../models");
jest.mock("../services/openai");

const db = require("../models");
const { sequelize, Post, Sentiment } = require("../models");
const PostEmotions = db.sequelize.models.PostEmotions;
const { postDiary, getAllDiaries, getDiaryById, modifyDiaryContent, deleteDiary, getDiariesForSpecificPeriod } = require("./post");
const { analysisDiary } = require("../services/openai");

analysisDiary.mockReturnValue(Promise.resolve({
    emotions: ["기쁨", "사랑", "뿌듯함"],
    positiveScore: 50,
    negativeScore: 50,
}));

sequelize.transaction.mockReturnValue(Promise.resolve({
    commit: jest.fn(() => Promise.resolve(true)),
    rollback: jest.fn(() => Promise.resolve(true)),
}));

// [p-01] 모든 일기 조회
describe("[p-01] getAllDiaries", () => {
    const dateOptions = {
        year: 'numeric', month: '2-digit', day: '2-digit',
        timeZone: 'Asia/Seoul', // 한국 시간대 설정
    };
    const timeOptions = {
        hour: '2-digit', minute: '2-digit',
        timeZone: 'Asia/Seoul', // 한국 시간대 설정
        hour12: false // 24시간 표기법 사용
    }

    const req = {
        user: {
            id: 1,
        },
    };
    const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
    };
    const next = jest.fn();

    test("[put-01-1] 사용자가 작성한 일기가 없으면 빈 리스트를 반환한다.", async () => {
        Post.findAll.mockReturnValue(Promise.resolve([]));

        await getAllDiaries(req, res, next);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({ diaries: [] });
    });

    test("[put-01-2] 데이터베이스 조회 중 에러 발생 시 next(error)를 호출한다.", async () => {
        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        Post.findAll.mockReturnValue(Promise.reject(error));

        await getAllDiaries(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[put-01-3] getEmotions() 수행 중 에러 발생 시 next(error)를 호출한다.", async () => {
        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        const result = [{
            getEmotions: jest.fn(async () => Promise.reject(error)),
        }];
        Post.findAll.mockReturnValue(Promise.resolve(result));

        await getAllDiaries(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[put-01-4] getSentiment() 수행 중 에러 발생 시 next(error)를 호출한다.", async () => {
        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        const emotions = [{ type: "기쁨" }, { type: "사랑" }, { type: "뿌듯함" }];
        const result = [{
            id: 1,
            content: "내용 1",
            createdAt: new Date("2024-05-02"),
            getEmotions: jest.fn(async () => Promise.resolve(emotions)),
            getSentiment: jest.fn(async () => Promise.reject(error)),
        }];
        Post.findAll.mockReturnValueOnce(Promise.resolve(result));

        await getAllDiaries(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[put-01-5] 데이터베이스 작업 중 에러가 발생하지 않으면 일기 조회에 성공한다.", async () => {
        const sentiment = { positive: 50, negative: 50 };
        const emotions = [{ type: "기쁨" }, { type: "사랑" }, { type: "뿌듯함" }];
        const result = [{
            id: 1,
            content: "내용 1",
            createdAt: new Date("2024-05-02"),
            getEmotions: jest.fn(async () => Promise.resolve(emotions)),
            getSentiment: jest.fn(async () => Promise.resolve(sentiment)),
        }, {
            id: 2,
            content: "내용 2",
            createdAt: new Date("2024-05-02"),
            getEmotions: jest.fn(async () => Promise.resolve(emotions)),
            getSentiment: jest.fn(async () => Promise.resolve(sentiment)),
        }];
        Post.findAll.mockReturnValueOnce(Promise.resolve(result));

        await getAllDiaries(req, res, next);

        let diaries = [];

        for (const diary of result) {
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

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({ diaries });
    });
});

// [p-02] 특정 일기 조회
describe("[p-02] getDiaryById", () => {
    const dateOptions = {
        year: 'numeric', month: '2-digit', day: '2-digit',
        timeZone: 'Asia/Seoul', // 한국 시간대 설정
    };
    const timeOptions = {
        hour: '2-digit', minute: '2-digit',
        timeZone: 'Asia/Seoul', // 한국 시간대 설정
        hour12: false // 24시간 표기법 사용
    }

    const req = {
        params: {
            postId: 1,
        },
        user: {
            id: 1,
        },
    };
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
        json: jest.fn(),
    };
    const next = jest.fn();

    test("[put-02-1] URL 경로에 전달된 것이 쿼리 파라미터가 아닌 다른 값이라면 next()를 반환한다.", async () => {
        const req = {
            params: {
                postId: "period",       //GET /posts/period 
            },
        };

        await getDiaryById(req, res, next);

        expect(next).toBeCalledTimes(1);
        expect(next).toBeCalledWith();
    });

    test("[put-02-2] 데이터베이스에서 일기가 조회되지 않으면 일기 조회에 실패한다.", async () => {
        Post.findOne.mockReturnValue(Promise.resolve(null));

        await getDiaryById(req, res, next);

        expect(res.status).toBeCalledWith(404);
        expect(res.send).toBeCalledWith(`[ID: ${req.params.postId}] 일기가 존재하지 않습니다.`);
    });

    test("[put-02-3] 일기 작성자와 사용자의 ID가 일치하지 않으면 일기 조회에 실패한다.", async () => {
        Post.findOne.mockReturnValue(Promise.resolve({
            writer: 2,      // req.params.id === 1
        }));

        await getDiaryById(req, res, next);

        expect(res.status).toBeCalledWith(403);
        expect(res.send).toBeCalledWith("접근 권한이 없습니다.");
    });

    test("[put-02-4] 데이터베이스 조회 중 에러가 발생하면 next(error)를 호출한다.", async () => {
        const error = new Error("데이터베이스 조회 중 에러가 발생하였습니다.");
        Post.findOne.mockReturnValue(Promise.reject(error));

        await getDiaryById(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[put-02-5] getEmotions() 수행 중 에러가 발생하면 next(error)를 호출한다.", async () => {
        const req = {
            params: {
                postId: 1,       //GET /posts/period 
            },
            user: {
                id: 1,
            }
        };

        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        const post = {
            writer: 1,
            getEmotions: jest.fn(async () => Promise.reject(error)),
        };
        Post.findOne.mockReturnValueOnce(Promise.resolve(post));

        await getDiaryById(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[put-02-6] getSentiment() 수행 중 에러가 발생하면 next(error)를 호출한다.", async () => {
        const req = {
            params: {
                postId: 1,       //GET /posts/period 
            },
            user: {
                id: 1,
            }
        };

        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        const emotions = ["기쁨", "사랑", "뿌듯함"];
        const post = {
            writer: 1,
            getEmotions: jest.fn(async () => Promise.resolve(emotions)),
            getSentiment: jest.fn(async () => Promise.reject(error)),
        };
        Post.findOne.mockReturnValueOnce(Promise.resolve(post));

        await getDiaryById(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[put-02-7] 데이터베이스 작업 중 에러가 발생하지 않고 사용자가 작성한 일기에 대한 요청이라면 일기 조회에 성공한다.", async () => {
        const req = {
            params: {
                postId: 1,       //GET /posts/period 
            },
            user: {
                id: 1,
            }
        };

        const result = [{
            type: "기쁨",
        }, {
            type: "사랑",
        }, {
            type: "뿌듯함",
        }];
        const sentiment = {
            positive: 50,
            negative: 50,
        };
        const post = {
            id: 1,
            writer: 1,
            content: "내용",
            createdAt: new Date("2024-05-02"),
            getEmotions: jest.fn(async () => Promise.resolve(result)),
            getSentiment: jest.fn(async () => Promise.resolve(sentiment)),
        };
        Post.findOne.mockReturnValueOnce(Promise.resolve(post));

        await getDiaryById(req, res, next);

        let emotions = [];
        for (const emotion of result) {
            emotions.push(emotion.type);
        }

        const diary = {
            id: post.id,
            content: post.content,
            writeDate: (post.createdAt).toLocaleString("ko-KR", dateOptions),
            writeTime: (post.createdAt).toLocaleString("ko-KR", timeOptions),
            emotions,
            positiveScore: sentiment.positive,
            negativeScore: sentiment.negative,
        };

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({ diary });
    });
});

// [p-03] 일기 등록
describe("[p-03] postDiary", () => {
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
        json: jest.fn(),
    };
    const next = jest.fn();

    test("[put-03-1] 일기 내용이 존재하면 일기를 등록한다.", async () => {
        const req = {
            body: {
                content: "일기의 내용입니다.",
            },
            user: {
                id: 1,
            },
        };

        const post = {
            id: 1,
        };
        Post.create.mockReturnValueOnce(Promise.resolve(post));
        const emotions = ["기쁨", "사랑", "뿌듯함"];
        
        PostEmotions.create.mockReturnValue(Promise.resolve(true));

        const positiveScore = 50;
        const negativeScore = 50;

        await postDiary(req, res, next);
        
        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            postId: post.id,
            emotions,
            positiveScore,
            negativeScore,
        });
    });

    test("[put-03-2] 일기 내용이 존재하지 않으면 일기 등록에 실패한다.", async () => {
        const req = {
            body: {
                content: '',
            },
            user: {
                id: 1,
            },
        };
        
        await postDiary(req, res, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith("일기 내용이 존재하지 않습니다.");
    });

    test("[put-03-3] Post 모델에서 데이터베이스 생성 중 에러 발생 시 next(error)를 호출한다.", async () => {
        const req = {
            body: {
                content: "일기의 내용입니다.",
            },
            user: {
                id: 1,
            },
        };

        const error = new Error("데이터베이스 생성 중 에러가 발생했습니다.");
        Post.create.mockReturnValue(Promise.reject(error));

        await postDiary(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[put-03-4] PostEmotion 모델에서 데이터베이스 생성 중 에러 발생 시 next(error)를 호출한다.", async () => {
        const req = {
            body: {
                content: "일기의 내용입니다.",
            },
            user: {
                id: 1,
            },
        };

        const post = {
            id: 1,
        };
        Post.create.mockReturnValueOnce(Promise.resolve(post));
        
        const error = new Error("데이터베이스 생성 중 에러가 발생하였습니다.")
        PostEmotions.create.mockReturnValue(Promise.reject(error));

        await postDiary(req, res, next);
        
        expect(next).toBeCalledWith(error);
    });

    test("[put-03-5] Sentiment 모델에서 데이터베이스 생성 중 에러 발생 시 next(error)를 호출한다.", async () => {
        const req = {
            body: {
                content: "일기의 내용입니다.",
            },
            user: {
                id: 1,
            },
        };

        const post = {
            id: 1,
        };
        Post.create.mockReturnValueOnce(Promise.resolve(post));
        
        PostEmotions.create.mockReturnValue(Promise.resolve(true));
        
        const error = new Error("데이터베이스 생성 중 에러가 발생하였습니다.")
        Sentiment.create.mockReturnValueOnce(Promise.reject(error));

        await postDiary(req, res, next);
        
        expect(next).toBeCalledWith(error);
    });
});

// [p-04] 일기 내용 수정
describe("[p-04] modifyDiaryContent", () => {
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
        json: jest.fn(),
    };
    const next = jest.fn();

    test("[put-04-1] 요청 바디에 속성이 존재하지 않으면 일기 내용 수정에 실패패한다.", async () => {
        const req = {
            body: {
            },
        };

        await modifyDiaryContent(req, res, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith("일기 내용이 존재하지 않습니다.");
    });

    test("[put-04-2] 새로운 일기의 내용이 빈 문자열이면 일기 내용 수정에 실패한다.", async () => {
        const req = {
            body: {
                postId: 1,
                newContent: '',
            },
        };

        await modifyDiaryContent(req, res, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith("일기 내용이 존재하지 않습니다.");
    });

    test("[put-04-3] 데이터베이스 조회 중 에러가 발생하면 next(error)가 호출된다.", async () => {
        const req = {
            body: {
                postId: 1,
                newContent: "새로운 내용입니다.",
            },
        };
        
        const error = new Error("데이터베이스 조회 작업 중 에러가 발생하였습니다.");
        Post.findOne.mockReturnValue(Promise.reject(error));

        await modifyDiaryContent(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[put-04-4] 데이터베이스에서 조회된 일기가 없으면 일기 내용 수정에 실패한다.", async () => {
        const req = {
            body: {
                postId: 1,
                newContent: "새로운 내용입니다.",
            },
        };

        Post.findOne.mockReturnValue(Promise.resolve(null));

        await modifyDiaryContent(req, res, next);

        expect(res.status).toBeCalledWith(404);
        expect(res.send).toBeCalledWith(`[ID: ${req.body.postId}] 일기가 존재하지 않습니다.`);
    });

    test("[put-04-5] 일기의 작성자가 일치하지 않으면 일기 내용 수정에 실패한다.", async () => {
        const req = {
            body: {
                postId: 1,
                newContent: "새로운 내용입니다.",
            },
            user: {
                id: 1,
            }
        };

        const post = {
            writer: 2,      // req.user.id === 1
        };
        Post.findOne.mockReturnValue(Promise.resolve(post));

        await modifyDiaryContent(req, res, next);

        expect(res.status).toBeCalledWith(403);
        expect(res.send).toBeCalledWith("접근 권한이 없습니다.");
    });

    test("[put-04-6] 데이터베이스 저장 중 에러가 발생하면 next(error)가 호출된다.", async () => {
        const req = {
            body: {
                postId: 1,
                newContent: "새로운 내용입니다.",
            },
            user: {
                id: 1,
            }
        };

        const error = new Error("데이터베이스 저장 작업 중 에러가 발생하였습니다.");
        const post = {
            writer: 1,      // req.user.id === 1
            content: "기존의 내용입니다.",
            save: jest.fn(() => Promise.reject(error)),
        };
        Post.findOne.mockReturnValue(Promise.resolve(post));

        await modifyDiaryContent(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[put-04-7] PostEmotions 모델의 데이터베이스 삭제 중 에러가 발생하면 next(error)가 호출된다.", async () => {
        const req = {
            body: {
                postId: 1,
                newContent: "새로운 내용입니다.",
            },
            user: {
                id: 1,
            }
        };

        const post = {
            writer: 1,      // req.user.id === 1
            content: "기존의 내용입니다.",
            save: jest.fn(() => Promise.resolve(true)),
        };
        Post.findOne.mockReturnValueOnce(Promise.resolve(post));

        const error = new Error("데이터베이스 삭제 중 에러가 발생하였습니다.");
        PostEmotions.destroy.mockReturnValueOnce(Promise.reject(error));

        await modifyDiaryContent(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[put-04-8] Sentiment 모델의 데이터베이스 삭제 중 에러가 발생하면 next(error)가 호출된다.", async () => {
        const req = {
            body: {
                postId: 1,
                newContent: "새로운 내용입니다.",
            },
            user: {
                id: 1,
            }
        };

        const post = {
            writer: 1,      // req.user.id === 1
            content: "기존의 내용입니다.",
            save: jest.fn(() => Promise.resolve(true)),
        };
        Post.findOne.mockReturnValueOnce(Promise.resolve(post));

        PostEmotions.destroy.mockReturnValueOnce(Promise.resolve(true));
        
        const error = new Error("데이터베이스 삭제 중 에러가 발생하였습니다.");
        Sentiment.destroy.mockReturnValueOnce(Promise.reject(error));

        await modifyDiaryContent(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[put-04-9] PostEmotions 모델의 데이터베이스 생성 중 에러가 발생하면 next(error)가 호출된다.", async () => {
        const req = {
            body: {
                postId: 1,
                newContent: "새로운 내용입니다.",
            },
            user: {
                id: 1,
            }
        };

        const post = {
            writer: 1,      // req.user.id === 1
            content: "기존의 내용입니다.",
            save: jest.fn(() => Promise.resolve(true)),
        };
        Post.findOne.mockReturnValueOnce(Promise.resolve(post));

        PostEmotions.destroy.mockReturnValueOnce(Promise.resolve(true));
        
        Sentiment.destroy.mockReturnValueOnce(Promise.resolve(true));
        
        const error = new Error("데이터베이스 생성 중 에러가 발생하였습니다.");
        PostEmotions.create.mockReturnValue(Promise.reject(error));

        await modifyDiaryContent(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[put-04-10] Sentiment 모델의 데이터베이스 생성 중 에러가 발생하면 next(error)가 호출된다.", async () => {
        const req = {
            body: {
                postId: 1,
                newContent: "새로운 내용입니다.",
            },
            user: {
                id: 1,
            }
        };

        const post = {
            writer: 1,      // req.user.id === 1
            content: "기존의 내용입니다.",
            save: jest.fn(() => Promise.resolve(true)),
        };
        Post.findOne.mockReturnValueOnce(Promise.resolve(post));

        PostEmotions.destroy.mockReturnValueOnce(Promise.resolve(true));
        
        Sentiment.destroy.mockReturnValueOnce(Promise.resolve(true));
        
        PostEmotions.create.mockReturnValue(Promise.resolve(true));
        
        const error = new Error("데이터베이스 생성 중 에러가 발생하였습니다.");
        Sentiment.create.mockReturnValueOnce(Promise.reject(error));

        await modifyDiaryContent(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[put-04-11] 데이터베이스 작업 중 에러가 발생하지 않고 같은 사용자의 일기 내용에 수정 사항이 있으면 일기 내용 수정에 성공한다.", async () => {
        const emotions = ["기쁨", "사랑", "뿌듯함"];
        const positiveScore = 50;
        const negativeScore = 50;
        
        const req = {
            body: {
                postId: 1,
                newContent: "새로운 내용입니다.",
            },
            user: {
                id: 1,
            }
        };

        const post = {
            id: 1,
            writer: 1,      // req.user.id === 1
            content: "기존의 내용입니다.",
            save: jest.fn(() => Promise.resolve(true)),
        };
        Post.findOne.mockReturnValueOnce(Promise.resolve(post));

        PostEmotions.destroy.mockReturnValueOnce(Promise.resolve(true));
        
        Sentiment.destroy.mockReturnValueOnce(Promise.resolve(true));
        
        PostEmotions.create.mockReturnValue(Promise.resolve(true));
        
        Sentiment.create.mockReturnValueOnce(Promise.resolve(true));

        await modifyDiaryContent(req, res, next);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            postId: post.id,
            emotions,
            positiveScore,
            negativeScore,
        });
    });
});

// [p-05] 일기 삭제
describe("[p-05] deleteDiary", () => {
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
    };
    const next = jest.fn();

    test("[put-05-1] 데이터베이스 작업 중 문제가 없고, 같은 사용자의 일기에 대한 삭제 요청이 들어오면 일기 삭제에 성공한다.", async () => {
        const req = {
            params: {
                postId: 1,
            },
            user: {
                id: 1,
            },
        };

        const post = {
            writer: 1,      // req.user.id === 1
        }
        Post.findOne.mockReturnValue(Promise.resolve(post));
        Post.destroy.mockReturnValueOnce(Promise.resolve(true));

        await deleteDiary(req, res, next);

        expect(res.status).toBeCalledWith(200);
        expect(res.send).toBeCalledWith("일기가 삭제되었습니다.");
    });

    test("[put-05-2] 데이터베이스 조회 중 에러가 발생하면 next(error)를 호출한다.", async () => {
        const req = {
            params: {
                postId: 1,
            },
        };

        const error = new Error("데이터베이스 조회 중 에러가 발생하였습니다.");
        Post.findOne.mockReturnValue(Promise.reject(error));

        await deleteDiary(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[put-05-3] 데이터베이스 조회 결과가 존재하지 않으면 일기 삭제에 실패한다.", async () => {
        const req = {
            params: {
                postId: 1,
            },
        };

        Post.findOne.mockReturnValue(Promise.resolve(null));

        await deleteDiary(req, res, next);

        expect(res.status).toBeCalledWith(404);
        expect(res.send).toBeCalledWith(`[ID: ${req.params.postId}] 일기가 존재하지 않습니다.`);
    });

    test("[put-05-4] 일기 작성자와 삭제를 요청한 사용자가 일치하지 않으면 일기 삭제에 실패한다.", async () => {
        const req = {
            params: {
                postId: 1,
            },
            user: {
                id: 1,
            },
        };

        const post = {
            writer: 2,      // req.user.id === 1
        }
        Post.findOne.mockReturnValue(Promise.resolve(post));

        await deleteDiary(req, res, next);

        expect(res.status).toBeCalledWith(403);
        expect(res.send).toBeCalledWith("접근 권한이 없습니다.");
    });

    test("[put-05-5] 데이터베이스 삭제 중 에러가 발생하면 next(error)를 호출한다.", async () => {
        const req = {
            params: {
                postId: 1,
            },
            user: {
                id: 1,
            },
        };

        const error = new Error("데이터베이스 삭제 중 에러가 발생했습니다.");
        const post = {
            writer: 1,      // req.user.id === 1
        }
        Post.findOne.mockReturnValue(Promise.resolve(post));
        Post.destroy.mockReturnValueOnce(Promise.reject(error));

        await deleteDiary(req, res, next);

        expect(next).toBeCalledWith(error);
    });
});

// [p-06] 특정 기간 일기 조회
describe("[p-06] getDiariesForSpecificPeriod", () => {
    const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
        send: jest.fn(),
    };
    const next = jest.fn();

    test("[put-06-1] 해당 기간 동안 작성한 게시글이 존재하지 않으면 빈 리스트를 반환하고 일기 조회에 성공한다.", async () => {
        const req = {
            query: {
                startDate: new Date(),
                endDate: new Date(),
            },
            user: {
                id: 1,
            },
        };

        Post.findAll.mockReturnValue(Promise.resolve([]));

        await getDiariesForSpecificPeriod(req, res, next);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({ diaries: [] });
    });

    test("[put-06-2] 쿼리 파라미터가 존재하지 않으면 일기 조회에 실패한다.", async () => {
        const req = {
            query: {},
        };

        await getDiariesForSpecificPeriod(req, res, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith("충분한 쿼리 파라미터가 제공되지 않았습니다.");
    });

    test("[put-06-3] 쿼리 파라미터가 Date 객체로 파싱이 불가능하면 일기 조회에 실패한다.", async () => {
        const req = {
            query: {
                startDate: "Cannot Parse",
                endDate: "Cannot Parse",
            },
        };

        await getDiariesForSpecificPeriod(req, res, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith("쿼리 파라미터의 값이 유효하지 않습니다.");
    });

    test("[put-06-4] 데이터베이스 조회 중 에러가 발생하면 next(error)를 호출한다.", async () => {
        const req = {
            query: {
                startDate: new Date(),
                endDate: new Date(),
            },
            user: {
                id: 1,
            },
        };

        const error = new Error("데이터베이스 조회 중 에러가 발생하였습니다.");
        Post.findAll.mockReturnValueOnce(Promise.reject(error));

        await getDiariesForSpecificPeriod(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[put-06-5] getEmotions() 수행 중 에러가 발생하면 next(error)를 호출한다.", async () => {
        const req = {
            query: {
                startDate: new Date(),
                endDate: new Date(),
            },
            user: {
                id: 1,
            },
        };

        const error = new Error("getEmotion() 수행 중 에러가 발생했습니다.");
        const result = [{
            getEmotions: jest.fn(async () => Promise.reject(error)),
        }]
        Post.findAll.mockReturnValueOnce(Promise.resolve(result));

        await getDiariesForSpecificPeriod(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[put-06-6] getSentiment() 수행 중 에러가 발생하면 next(error)를 호출한다.", async () => {
        const req = {
            query: {
                startDate: new Date(),
                endDate: new Date(),
            },
            user: {
                id: 1,
            },
        };

        const error = new Error("getSentiment() 수행 중 에러가 발생했습니다.");
        const emotions = [{ type: "기쁨" }, { type: "사랑" }, { type: "뿌듯함" }];
        const result = [{
            getEmotions: jest.fn(async () => Promise.resolve(emotions)),
            getSentiment: jest.fn(async () => Promise.reject(error)),
        }]
        Post.findAll.mockReturnValueOnce(Promise.resolve(result));

        await getDiariesForSpecificPeriod(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[put-06-7] 쿼리 파라미터에 문제가 없고 데이터베이스 작업 중 에러가 발생하지 않으면 일기 조회에 성공한다.", async () => {
        const req = {
            query: {
                startDate: new Date("2024-05-02"),
                endDate: new Date("2024-05-02"),
            },
            user: {
                id: 1,
            },
        };

        const sentiment = { positive: 50, negative: 50 };
        const emotions = [{ type: "기쁨" }, { type: "사랑" }, { type: "뿌듯함" }];
        const result = [{
            id: 1,
            content: "내용 1",
            createdAt: new Date("2024-05-02"),
            getEmotions: jest.fn(async () => Promise.resolve(emotions)),
            getSentiment: jest.fn(async () => Promise.resolve(sentiment)),
        }, {
            id: 2,
            content: "내용 2",
            createdAt: new Date("2024-05-02"),
            getEmotions: jest.fn(async () => Promise.resolve(emotions)),
            getSentiment: jest.fn(async () => Promise.resolve(sentiment)),
        }];
        Post.findAll.mockReturnValueOnce(Promise.resolve(result));

        await getDiariesForSpecificPeriod(req, res, next);

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

        for (const diary of result) {
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

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({ diaries });
    });
});