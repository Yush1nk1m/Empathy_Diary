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

// [s-01] GET /sentiments/period?[startDate]&[endDate]
describe("[s-01] GET /sentiments/period?[startDate]&[endDate]", () => {

    const agent = request.agent(app);
    const yesterday = new Date(new Date().setHours(-24, 0, 0, 0));
    const yesterdayString = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`
    const today = new Date();
    const todayString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
    const tomorrow = new Date(new Date().setHours(24, 0, 0, 0));
    const tomorrowString = `${tomorrow.getFullYear()}-${tomorrow.getMonth() + 1}-${tomorrow.getDate()}`

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

    test("[sit-01-1] 로그인되지 않은 상태에서 감성 점수 조회", async () => {
        const response = await request(app).get(`/sentiments/period?startDate=${todayString}&endDate=${todayString}`);

        expect(response.status).toBe(403);
        expect(response.text).toBe("로그인이 필요합니다.");
    });

    test("[sit-01-2] 성공적인 감성 점수 조회 요청", async () => {
        await agent.post("/posts").send({ content: "내용" });
        const yesterdayResponse = await agent.get(`/sentiments/period?startDate=${yesterdayString}&endDate=${yesterdayString}`)
        const todayResponse = await agent.get(`/sentiments/period?startDate=${todayString}&endDate=${todayString}`);
        const tomorrowResponse = await agent.get(`/sentiments/period?startDate=${tomorrowString}&endDate=${tomorrowString}`);

        const resultDate = `${today.getFullYear()}. ${('0' + (today.getMonth() + 1)).slice(-2)}. ${('0' + today.getDate()).slice(-2)}.`;

        expect(yesterdayResponse.status).toBe(200);
        expect(todayResponse.status).toBe(200);
        expect(tomorrowResponse.status).toBe(200);
        
        expect(yesterdayResponse.body.sentiments).toEqual([]);
        expect(tomorrowResponse.body.sentiments).toEqual([]);
        expect(todayResponse.body.sentiments).toEqual([
            { [resultDate]: { positive: expect.any(Number), negative: expect.any(Number) } },
        ]);
    });
});