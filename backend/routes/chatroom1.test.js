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

// [cr-01] POST /chatrooms
describe("[cr-01] POST /chatrooms", () => {
    
    const agent = request.agent(app);

    // 모든 테스트 시작 전: 회원 가입
    beforeAll(async () => {
        await request(app).post("/users").send(joinUserInfo);
    });

    // 각 테스트 시작 전: 로그인
    beforeEach(async () => {
        await agent.post("/users/login").send(loginUserInfo);
    });

    // 각 테스트 종료 후: 로그아웃
    afterEach(async () => {
        await agent.post("/users/logout");
    });

    test("[crit-01-1] 로그인되지 않은 상태에서 대화방 생성 요청", async () => {
        const response = await request(app).post("/chatrooms");

        expect(response.status).toBe(403);
        expect(response.text).toBe("로그인이 필요합니다.");
    });

    test("[crit-01-2] 성공적인 대화방 생성 요청", async () => {
        const response = await agent.post("/chatrooms");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            roomId: expect.any(Number),
            chat: {
                role: "assistant",
                content: expect.any(String),
            },
        });
    });
});