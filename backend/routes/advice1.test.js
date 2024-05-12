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

// [a-01] GET /advices/today
describe("[a-01] GET /advices/today", () => {
    const agent = request.agent(app);
    const agent2 = request.agent(app);

    // 모든 테스트 시작 전: 회원 가입
    beforeAll(async () => {
        await request(app).post("/users").send(joinUserInfo);
        await request(app).post("/users").send(newJoinUserInfo);
    });

    // 각 테스트 시작 전: 로그인 및 일기 등록
    beforeEach(async () => {
        await agent.post("/users/login").send(loginUserInfo);
        await agent.post("/posts").send({ content: "일기" });
        await agent2.post("/users/login").send(loginNewUserInfo);
        await agent2.post("/posts").send({ content: "일기" });
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

    test("[ait-01-1] 로그인되지 않은 상태에서 조언 조회 요청", async () => {
        const response = await request(app).get("/advices/today");

        expect(response.status).toBe(403);
        expect(response.text).toBe("로그인이 필요합니다.");
    });

    test("[ait-01-2] 성공적인 조언 조회 요청", async () => {
        // agent만 조언을 작성한다.
        const advices = [];
        advices.push(await agent.post("/advices").send({ content: "조언 1" }));
        advices.push(await agent.post("/advices").send({ content: "조언 2" }));

        const agentResponse = await agent.get("/advices/today");
        const agent2Response = await agent2.get("/advices/today");

        expect(agentResponse.status).toBe(200);
        expect(agent2Response.status).toBe(200);
        expect(agentResponse.body.advices).toEqual([]);
        expect(agent2Response.body.advices.length).toBe(2);
        expect(agent2Response.body.advices[0]).toEqual({
            content: advices[0].body.content,
            writeDate: expect.any(String),
            writeTime: expect.any(String),
        });
    });
});

