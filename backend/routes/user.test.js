const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");
const { joinUserInfo, loginUserInfo, gottenUserInfo, newJoinUserInfo } = require("../data/user");

beforeAll(async () => {
    await sequelize.sync({ force: true });
})

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

    test("[uit-011] 로그인되지 않은 상태에서 회원 정보 조회 요청", async () => {
        const response = await request(app).get("/users");

        expect(response.status).toBe(403);
        expect(response.text).toEqual("로그인이 필요합니다.");
    });

    test("[uit-012] 성공적인 회원 정보 조회 요청", async () => {
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

    test("[uit-021] 로그인된 상태에서 회원 가입 요청", async () => {
        const response = await agent.post("/users");

        expect(response.status).toBe(409);
        expect(response.text).toEqual("이미 로그인된 상태입니다.");
    });

    test("[uit-022] 중복된 회원 ID로 회원 가입 요청", async () => {
        const response = await request(app).post("/users").send(joinUserInfo);

        expect(response.status).toBe(409);
        expect(response.text).toEqual("이미 존재하는 회원 ID입니다.");
    });

    test("[uit-023] 성공적인 회원 가입 요청", async () => {
        const response = await request(app).post("/users").send(newJoinUserInfo);

        expect(response.status).toBe(200);
        expect(response.text).toEqual("회원 가입에 성공했습니다.");
    });
});