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
const { analysisDiary, analysisMainEmotion } = require("../services/openai");
analysisDiary.mockReturnValue({ emotions: ["기쁨", "사랑", "뿌듯함"], positiveScore: 50, negativeScore: 50 });
analysisMainEmotion.mockReturnValue({ emotion: "기쁨" });

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

// [u-01] GET /users
describe("[u-01] GET /users", () => {

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

    test("[uit-01-1] 로그인되지 않은 상태에서 회원 정보 조회 요청", async () => {
        const response = await request(app).get("/users");

        expect(response.status).toBe(403);
        expect(response.text).toBe("로그인이 필요합니다.");
    });

    test("[uit-01-2] 성공적인 회원 정보 조회 요청", async () => {
        const response = await agent.get("/users");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(gottenUserInfo);
    });
});

// [u-02] POST /users
describe("[u-02] POST /users", () => {

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

    test("[uit-02-1] 로그인된 상태에서 회원 가입 요청", async () => {
        const response = await agent.post("/users");

        expect(response.status).toBe(409);
        expect(response.text).toBe("이미 로그인된 상태입니다.");
    });

    test("[uit-02-2] 중복된 회원 ID로 회원 가입 요청", async () => {
        const response = await request(app).post("/users").send(joinUserInfo);

        expect(response.status).toBe(409);
        expect(response.text).toBe("이미 존재하는 회원 ID입니다.");
    });

    test("[uit-02-3] 성공적인 회원 가입 요청", async () => {
        const response = await request(app).post("/users").send(newJoinUserInfo);

        expect(response.status).toBe(200);
        expect(response.text).toBe("회원 가입에 성공했습니다.");
    });
});

// [u-03] POST /users/login
describe("[u-03] POST /users/login", () => {

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

    test("[uit-03-1] 부정확한 회원 정보로 로그인 요청", async () => {
        const response = await request(app).post("/users/login").send(wrongLoginUserInfo);

        expect(response.status).toBe(400);
        expect(response.text).toBe("사용자 정보가 일치하지 않습니다.");
    });

    test("[uit-03-2] 이미 로그인되어 있는 상태에서 로그인 요청", async () => {
        const response = await agent.post("/users/login").send(loginUserInfo);
        
        expect(response.status).toBe(409);
        expect(response.text).toBe("이미 로그인된 상태입니다.");
    });

    test("[uit-03-3] 성공적인 로그인 요청", async () => {
        const response = await request(app).post("/users/login").send(loginUserInfo);

        expect(response.status).toBe(200);
        expect(response.text).toBe("로그인에 성공했습니다.");
    });
});