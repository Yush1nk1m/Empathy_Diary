jest.mock("sequelize");
jest.mock("../models");

const { sequelize, Advice } = require("../models");
const { writeAdvice, getMyAllAdvices, getDailyAdvices, modifyAdviceContent, deleteAdvice } = require("./advice");

sequelize.transaction.mockReturnValue(Promise.resolve({
    commit: jest.fn(() => Promise.resolve(true)),
    rollback: jest.fn(() => Promise.resolve(true)),
}));

const dateOptions = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: 'Asia/Seoul', // 한국 시간대 설정
};
const timeOptions = {
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Seoul', // 한국 시간대 설정
    hour12: false // 24시간 표기법 사용
};

// [a-01] 오늘의 조언 조회
describe("[a-01] getDailyAdvices", () => {
    const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
    };
    const next = jest.fn();

    test("[aut-01-1] user.getPosts() 수행 중 에러 발생 시 조언 조회에 실패한다.", async () => {
        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        const req = {
            user: {
                getPosts: jest.fn(() => Promise.reject(error)),
            }
        };

        await getDailyAdvices(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[aut-01-2] post.getEmotions() 수행 중 에러 발생 시 조언 조회에 실패한다.", async () => {
        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        const posts = [{
            getEmotions: jest.fn(() => Promise.reject(error)),
        }];
        const req = {
            user: {
                getPosts: jest.fn(() => Promise.resolve(posts)),
            }
        };

        await getDailyAdvices(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[aut-01-3] 데이터베이스 조회 중 에러 발생 시 조언 조회에 실패한다.", async () => {
        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");

        const postEmotions = [{ type: "기쁨", type: "사랑", type: "뿌듯함" }];
        const posts = [{
            getEmotions: jest.fn(() => Promise.resolve(postEmotions)),
        }];
        const req = {
            user: {
                getPosts: jest.fn(() => Promise.resolve(posts)),
            }
        };

        Advice.findAll.mockReturnValueOnce(Promise.reject(error));

        await getDailyAdvices(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("[aut-01-4] 데이터베이스 조회 중 에러가 발생하지 않는다면 조언 조회에 성공한다.", async () => {
        const postEmotions = [{ type: "기쁨", type: "사랑", type: "뿌듯함" }];
        const posts = [{
            getEmotions: jest.fn(() => Promise.resolve(postEmotions)),
        }];
        const req = {
            user: {
                getPosts: jest.fn(() => Promise.resolve(posts)),
            }
        };

        const adviceEmotions = [
            { id: 1, content: "내용 1", createdAt: new Date() },
            { id: 1, content: "내용 1", createdAt: new Date() },
            { id: 1, content: "내용 1", createdAt: new Date() },
            { id: 2, content: "내용 2", createdAt: new Date() },
            { id: 2, content: "내용 2", createdAt: new Date() },
            { id: 2, content: "내용 2", createdAt: new Date() },
            { id: 3, content: "내용 3", createdAt: new Date() },            
            { id: 3, content: "내용 3", createdAt: new Date() },            
            { id: 3, content: "내용 3", createdAt: new Date() },            
        ];
        Advice.findAll.mockReturnValueOnce(Promise.resolve(adviceEmotions));

        await getDailyAdvices(req, res, next);

        let advices = new Map();
        for (const advice of adviceEmotions) {
            advices.set(advice.id, advice);
        }
        advices = advices.values();
        advices = [...advices].map((advice) => {
            return {
                content: advice.content,
                writeDate: (advice.createdAt).toLocaleString("ko-KR", dateOptions),
                writeTime: (advice.createdAt).toLocaleString("ko-KR", timeOptions),
            };
        });

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({ advices });
    });
});

// [a-02] 작성한 모든 조언 조회
describe("[a-02] getMyAllAdvices", () => {
    const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
    };
    const next = jest.fn();

    test("데이터베이스 조회 중 에러가 발생하면 조언 조회에 실패한다.", async () => {
        const req = {
            user: {
                id: 1,
            },
        };

        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        Advice.findAll.mockReturnValueOnce(Promise.reject(error));

        await getMyAllAdvices(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("데이터베이스 조회 중 에러가 발생하지 않으면 조언 조회에 성공한다.", async () => {
        const req = {
            user: {
                id: 1,
            },
        };

        let advices = [
            { id: 1, content: "내용 1", createdAt: new Date() },
            { id: 2, content: "내용 2", createdAt: new Date() },
            { id: 3, content: "내용 3", createdAt: new Date() },
        ];
        Advice.findAll.mockReturnValueOnce(Promise.resolve(advices));

        await getMyAllAdvices(req, res, next);

        advices = advices.map((advice) => {
            return {
                adviceId: advice.id,
                content: advice.content,
                writeDate: (advice.createdAt).toLocaleString("ko-KR", dateOptions),
                writeTime: (advice.createdAt).toLocaleString("ko-KR", timeOptions),
            };
        });

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({ advices });
    });
});

// [a-03] 조언 작성
describe("[a-03] writeAdvice", () => {
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
        json: jest.fn(),
    };
    const next = jest.fn();

    test("요청 바디에 문제가 있을 경우 조언 작성에 실패한다.", async () => {
        const req = {
            body: {
            }
        };

        await writeAdvice(req, res, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith("조언이 전달되지 않았습니다.");
    });

    test("주어진 조언 내용이 빈 문자열일 경우 조언 작성에 실패한다.", async () => {
        const req = {
            body: {
                content: '',
            },
        };

        await writeAdvice(req, res, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith("조언이 전달되지 않았습니다.");
    });

    test("데이터베이스 생성 중 오류가 발생하면 조언 작성에 실패한다.", async () => {
        const req = {
            body: {
                content: "조언",
            },
            user: {},
        };

        const error = new Error("데이터베이스 생성 중 오류가 발생했습니다.");
        Advice.create.mockReturnValueOnce(Promise.reject(error));

        await writeAdvice(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("user.getPosts() 수행 중 오류가 발생하면 조언 작성에 실패한다.", async () => {
        const error = new Error("데이터베이스 조회 중 오류가 발생했습니다.");
        const req = {
            body: {
                content: "조언",
            },
            user: {
                getPosts: jest.fn(() => Promise.reject(error)),
            },
        };

        Advice.create.mockReturnValueOnce(Promise.resolve({}));

        await writeAdvice(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("post.getEmotions() 수행 중 오류가 발생하면 조언 작성에 실패한다.", async () => {
        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        const posts = [{
            getEmotions: jest.fn(() => Promise.reject(error)),
        }];
        const req = {
            body: {
                content: "조언",
            },
            user: {
                getPosts: jest.fn(() => Promise.resolve(posts)),
            },
        };

        Advice.create.mockReturnValueOnce(Promise.resolve({}));

        await writeAdvice(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("advice.addEmotions() 수행 중 오류가 발생하면 조언 작성에 실패한다.", async () => {
        const error = new Error("데이터베이스 생성 중 에러가 발생했습니다.");
        const advice = {
            addEmotions: jest.fn(() => Promise.reject(error)),
        };
        const emotions = [{ type: "기쁨" }, { type: "사랑" }, { type: "뿌듯함" }];
        const posts = [{
            getEmotions: jest.fn(() => Promise.resolve(emotions)),
        }];
        const req = {
            body: {
                content: "조언",
            },
            user: {
                getPosts: jest.fn(() => Promise.resolve(posts)),
            },
        };

        Advice.create.mockReturnValueOnce(Promise.resolve(advice));

        await writeAdvice(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("요청 바디 형식이 적절하고 데이터베이스 작업 중 에러가 발생하지 않으면 조언 작성에 성공한다.", async () => {
        const advice = {
            id: 1,
            content: "조언",
            addEmotions: jest.fn(() => Promise.resolve(true)),
        };
        const emotions = [{ type: "기쁨" }, { type: "사랑" }, { type: "뿌듯함" }];
        const posts = [{
            getEmotions: jest.fn(() => Promise.resolve(emotions)),
        }];
        const req = {
            body: {
                content: "조언",
            },
            user: {
                getPosts: jest.fn(() => Promise.resolve(posts)),
            },
        };

        Advice.create.mockReturnValueOnce(Promise.resolve(advice));

        await writeAdvice(req, res, next);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            adviceId: advice.id,
            content: advice.content,
            emotions: emotions.map(emotion => emotion.type),
        });
    });
});

// [a-04] 조언 내용 수정
describe("[a-04] modifyAdviceContent", () => {
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
        json: jest.fn(),
    };
    const next = jest.fn();

    test("요청 바디에 adviceId가 없으면 조언 내용 수정에 실패한다.", async () => {
        const req = {
            body: {},
        };

        await modifyAdviceContent(req, res, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith("조언 ID가 전달되지 않았습니다.");
    });

    test("요청 바디에 newContent가 없으면 조언 내용 수정에 실패한다.", async () => {
        const req = {
            body: {
                adviceId: 1,
            },
        };

        await modifyAdviceContent(req, res, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.send).toBeCalledWith("조언 내용이 전달되지 않았습니다.");
    });

    test("데이터베이스 조회 중 에러가 발생하면 조언 내용 수정에 실패한다.", async () => {
        const req = {
            body: {
                adviceId: 1,
                newContent: "새로운 조언",
            },
        };

        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        Advice.findOne.mockReturnValueOnce(Promise.reject(error));

        await modifyAdviceContent(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("조언 작성자와 사용자가 일치하지 않으면 조언 내용 수정에 실패한다.", async () => {
        const req = {
            body: {
                adviceId: 1,
                newContent: "새로운 조언",
            },
            user: {
                id: 1,
            },
        };

        const advice = {
            writer: 2,      // req.user.id === 1
        };
        Advice.findOne.mockReturnValueOnce(Promise.resolve(advice));

        await modifyAdviceContent(req, res, next);

        expect(res.status).toBeCalledWith(403);
        expect(res.send).toBeCalledWith("접근 권한이 없습니다.");
    });

    test("데이터베이스 저장 중 에러가 발생하면 조언 내용 수정에 실패한다.", async () => {
        const req = {
            body: {
                adviceId: 1,
                newContent: "새로운 조언",
            },
            user: {
                id: 1,
            },
        };

        const error = new Error("데이터베이스 저장 중 에러가 발생했습니다.")
        const advice = {
            writer: 1,      // req.user.id === 1
            content: "기존 조언",
            save: jest.fn(() => Promise.reject(error)),
        };
        Advice.findOne.mockReturnValueOnce(Promise.resolve(advice));

        await modifyAdviceContent(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("요청 바디 형식에 문제가 없고 데이터베이스 작업 중 에러가 발생하지 않으면 조언 내용 수정에 성공한다.", async () => {
        const req = {
            body: {
                adviceId: 1,
                newContent: "새로운 조언",
            },
            user: {
                id: 1,
            },
        };

        const advice = {
            writer: 1,      // req.user.id === 1
            content: "기존 조언",
            save: jest.fn(() => Promise.resolve(true)),
        };
        Advice.findOne.mockReturnValueOnce(Promise.resolve(advice));

        await modifyAdviceContent(req, res, next);

        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith({
            adviceId: req.body.adviceId,
            newContent: req.body.newContent,
        });
    });
});

// [a-05] 조언 삭제
describe("[a-05] deleteAdvice", () => {
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
    };
    const next = jest.fn();

    test("요청 파라미터가 적절한 형식이 아니라면 다른 라우터로 넘긴다.", async () => {
        const req = {
            params: {
                adviceId: "otherPath",
            },
        };

        await deleteAdvice(req, res, next);

        expect(next).toBeCalledTimes(1);
    });

    test("데이터베이스 조회 중 에러가 발생하면 조언 삭제에 실패한다.", async () => {
        const req = {
            params: {
                adviceId: 1,
            },
        };

        const error = new Error("데이터베이스 조회 중 에러가 발생했습니다.");
        Advice.findOne.mockReturnValueOnce(Promise.reject(error));

        await deleteAdvice(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("데이터베이스 조회 결과가 없으면 조언 삭제에 실패한다.", async () => {
        const req = {
            params: {
                adviceId: 1,
            },
        };

        Advice.findOne.mockReturnValueOnce(Promise.resolve(null));

        await deleteAdvice(req, res, next);

        expect(res.status).toBeCalledWith(404);
        expect(res.send).toBeCalledWith(`[ID: ${req.params.adviceId}] 조언이 존재하지 않습니다.`);
    });

    test("조언의 작성자와 사용자가 일치하지 않으면 조언 삭제에 실패한다.", async () => {
        const req = {
            params: {
                adviceId: 1,
            },
            user: {
                id: 1,
            }
        };

        const advice = {
            writer: 2,      // req.user.id === 1
        };
        Advice.findOne.mockReturnValueOnce(Promise.resolve(advice));

        await deleteAdvice(req, res, next);

        expect(res.status).toBeCalledWith(403);
        expect(res.send).toBeCalledWith("접근 권한이 없습니다.");
    });

    test("데이터베이스 삭제 중 에러가 발생하면 조언 삭제에 실패한다.", async () => {
        const req = {
            params: {
                adviceId: 1,
            },
            user: {
                id: 1,
            }
        };

        const advice = {
            writer: 1,      // req.user.id === 1
        };
        Advice.findOne.mockReturnValueOnce(Promise.resolve(advice));

        const error = new Error("데이터베이스 삭제 중 에러가 발생했습니다.");
        Advice.destroy.mockReturnValueOnce(Promise.reject(error));

        await deleteAdvice(req, res, next);

        expect(next).toBeCalledWith(error);
    });

    test("조언의 작성자와 사용자가 일치하고 데이터베이스 작업 중 에러가 발생하지 않으면 조언 삭제에 성공한다.", async () => {
        const req = {
            params: {
                adviceId: 1,
            },
            user: {
                id: 1,
            }
        };

        const advice = {
            writer: 1,      // req.user.id === 1
        };
        Advice.findOne.mockReturnValueOnce(Promise.resolve(advice));

        Advice.destroy.mockReturnValueOnce(Promise.resolve(true));

        await deleteAdvice(req, res, next);

        expect(res.status).toBeCalledWith(200);
        expect(res.send).toBeCalledWith("조언이 삭제되었습니다.");
    });
});