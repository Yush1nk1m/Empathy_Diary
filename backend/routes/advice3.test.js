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

// [a-05] DELETE /advices/:adviceId
describe("[a-05] DELETE /advices/:adviceId", () => {

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

    test("[ait-05-1] 로그인되지 않은 상태에서 조언 삭제 요청", async () => {
        const response = await request(app).delete("/advices/-1");

        expect(response.status).toBe(403);
        expect(response.text).toBe("로그인이 필요합니다.");
    });

    test("[ait-05-2] 다른 사용자의 조언 삭제 요청", async () => {
        const advice = await agent.post("/advices").send({ content: "조언" });
        const response = await agent2.delete(`/advices/${advice.body.adviceId}`);

        expect(response.status).toBe(403);
        expect(response.text).toBe("접근 권한이 없습니다.");
    });

    test("[ait-05-3] 성공적인 조언 삭제 요청", async () => {
        const advice = await agent.post("/advices").send({ content: "조언" });
        const response = await agent.delete(`/advices/${advice.body.adviceId}`);

        expect(response.status).toBe(200);
        expect(response.text).toBe("조언이 삭제되었습니다.");
    });
});