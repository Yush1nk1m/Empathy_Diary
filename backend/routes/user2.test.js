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

// [u-04] PATCH /users
describe("[u-04] PATCH /users", () => {

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

    test("[uit-04-1] 로그인되지 않은 상태에서 회원 정보 수정 요청", async () => {
        const response = await request(app).patch("/users").send(correctModifyInfo);

        expect(response.status).toBe(403);
        expect(response.text).toBe("로그인이 필요합니다.");
    });

    test("[uit-04-2] 일치하지 않는 비밀번호로 회원 정보 수정 요청", async () => {
        const response = await agent.patch("/users").send(wrongPasswordModifyInfo);

        expect(response.status).toBe(400);
        expect(response.text).toBe("비밀번호가 일치하지 않습니다.");
    });

    test("[uit-04-3] 부정확한 확인 비밀번호로 회원 정보 수정 요청", async () => {
        const response = await agent.patch("/users").send(wrongConfirmPasswordModifyInfo);

        expect(response.status).toBe(400);
        expect(response.text).toBe("변경할 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
    });

    test("[uit-04-4] 성공적인 회원 정보 수정 요청", async () => {
        const agent = request.agent(app);
        await agent.post("/users").send(newJoinUserInfo);
        await agent.post("/users/login").send(loginNewUserInfo);
        const response = await agent.patch("/users").send(correctModifyInfo);

        expect(response.status).toBe(200);
        expect(response.text).toBe("회원 정보가 수정되었습니다.");
    });
});

// [u-05] DELETE /users
describe("[u-05] DELETE /users", () => {
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

    test("[uit-05-1] 로그인되지 않은 상태에서 회원 탈퇴 요청", async () => {
        const response = await request(app).delete("/users").send({ confirmMessage: "회원 탈퇴를 희망합니다." });

        expect(response.status).toBe(403);
        expect(response.text).toBe("로그인이 필요합니다.");
    });

    test("[uit-05-2] 부정확한 확인 메시지로 회원 탈퇴 요청", async () => {
        const response = await agent.delete("/users").send({ confirmMessage: "탈퇴" });

        expect(response.status).toBe(400);
        expect(response.text).toBe("확인 메시지가 잘못되었습니다.");
    });

    test("[uit-05-3] 성공적인 회원 탈퇴 요청", async () => {
        const response = await agent.delete("/users").send({ confirmMessage: "회원 탈퇴를 희망합니다." });

        expect(response.status).toBe(200);
        expect(response.text).toBe("회원 탈퇴가 완료되었습니다.");
    });
});