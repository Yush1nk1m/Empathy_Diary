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
const { joinUserInfo, loginUserInfo, gottenUserInfo, newJoinUserInfo, wrongLoginUserInfo, correctModifyInfo, wrongPasswordModifyInfo, wrongSameModifyInfo, wrongConfirmPasswordModifyInfo, wrongSamePasswordModifyInfo, loginNewUserInfo } = require("../data/user");

jest.setTimeout(2000);

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.sync({ force: true });
});

// [u-06] POST /users/logout
describe("[u-06] POST /users/logout", () => {
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

    // 모든 테스트 종료 후: 회원 탈퇴
    afterAll(async () => {
        await agent.post("/users/login").send(loginUserInfo);
        await agent.delete("/users").send({ confirmMessage: "회원 탈퇴를 희망합니다." });
    });

    test("[uit-06-1] 로그인되지 않은 상태에서 로그아웃 요청", async () => {
        const response = await request(app).post("/users/logout");

        expect(response.status).toBe(403);
        expect(response.text).toBe("로그인이 필요합니다.");
    });

    test("[uit-06-2] 성공적인 로그아웃 요청", async () => {
        const agent = request.agent(app);
        await agent.post("/users").send(newJoinUserInfo);
        await agent.post("/users/login").send(loginNewUserInfo);
        const response = await agent.post("/users/logout");

        expect(response.status).toBe(200);
        expect(response.text).toBe("로그아웃에 성공하였습니다.");
    });
});