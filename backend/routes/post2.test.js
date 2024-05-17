jest.mock("openai", () => {
    return jest.fn().mockImplementation(() => {
        return {
            chat: {
                completions: {
                    create: jest.fn().mockImplementation(async () => {
                        return { choices: [{ message: { content: `{}` } }]};
                    })
                }
            }
        };
    });
});
jest.mock("../services/openai");
const { analysisDiary } = require("../services/openai");
analysisDiary.mockReturnValue({ emotions: ["기쁨", "사랑", "뿌듯함"], positiveScore: 50, negativeScore: 50 });

const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");
const { setEmotion } = require("../repositories");
const { joinUserInfo, loginUserInfo, newJoinUserInfo, loginNewUserInfo } = require("../data/user");

jest.setTimeout(2000);

beforeAll(async () => {
    await sequelize.sync({ force: true });
    await setEmotion();
});

afterAll(async () => {
    await sequelize.sync({ force: true });
});


// [p-04] PATCH /posts
describe("[p-04] PATCH /posts", () => {

    const agent = request.agent(app);
    const agent2 = request.agent(app);

    // 모든 테스트 시작 전: 회원 가입
    beforeAll(async () => {
        await request(app).post("/users").send(joinUserInfo);
        await request(app).post("/users").send(newJoinUserInfo);
    });

    // 각 테스트 시작 전: 로그인
    beforeEach(async () => {
        await agent.post("/users/login").send(loginUserInfo);
        await agent2.post("/users/login").send(loginNewUserInfo);
    });

    // 각 테스트 종료 후: 로그아웃
    afterEach(async () => {
        await agent.post("/users/logout");
        await agent2.post("/users/logout");
    });

    // 모든 테스트 종료 후: 회원 탈퇴
    afterAll(async () => {
        await agent.post("/users/login").send(loginUserInfo);
        await agent.delete("/users").send({ confirmMessage: "회원 탈퇴를 희망합니다." });
        await agent2.post("/users/login").send(loginNewUserInfo);
        await agent2.delete("/users").send({ confirmMessage: "회원 탈퇴를 희망합니다." });
    });

    test("[pit-04-1] 로그인되지 않은 상태에서 일기 수정 요청", async () => {
        const response = await request(app).patch("/posts").send({
            postId: -1,
            newcontent: "새로운 내용",
        });

        expect(response.status).toBe(403);
        expect(response.text).toBe("로그인이 필요합니다.");
    });

    test("[pit-04-2] 수정할 내용 없이 일기 수정 요청", async () => {
        const post = await agent.post("/posts").send({ content: "일기" });
        const response = await agent.patch("/posts").send({
            postId: post.body.postId,
            newContent: '',
        });

        expect(response.status).toBe(400);
        expect(response.text).toBe("일기 내용이 존재하지 않습니다.");
    });

    test("[pit-04-3] 다른 사용자의 일기 수정 요청", async () => {
        const post = await agent.post("/posts").send({ content: "일기" });
        const response = await agent2.patch("/posts").send({
            postId: post.body.postId,
            newContent: "새로운 내용",
        });

        expect(response.status).toBe(403);
        expect(response.text).toBe("접근 권한이 없습니다.");
    });

    test("[pit-04-4] 존재하지 않는 ID의 일기 수정 요청", async () => {
        const response = await agent.patch("/posts").send({
            postId: -1,
            newContent: "새로운 내용",
        });

        expect(response.status).toBe(404);
        expect(response.text).toBe("[ID: -1] 일기가 존재하지 않습니다.");
    });

    test("[pit-04-5] 성공적인 일기 수정 요청", async () => {
        const post = await agent.post("/posts").send({ content: "일기" });
        const response = await agent.patch("/posts").send({
            postId: post.body.postId,
            newContent: "새로운 내용",
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            postId: post.body.postId,
            emotions: expect.any(Array),
            positiveScore: expect.any(Number),
            negativeScore: expect.any(Number),
        });
    });
});