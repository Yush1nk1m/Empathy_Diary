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

// [p-01] GET /posts
describe("[p-01] GET /posts", () => {

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

    test("[pit-01-1] 로그인되지 않은 상태에서 일기 조회 요청", async () => {
        const response = await request(app).get("/posts");

        expect(response.status).toBe(403);
        expect(response.text).toBe("로그인이 필요합니다.");
    });

    test("[pit-01-2] 성공적인 일기 조회 요청", async () => {
        // 사용자가 일기를 3개 등록한 상황을 가정한다.
        const post = await agent.post("/posts").send({ content: "일기 1" });
        await agent.post("/posts").send({ content: "일기 2" });
        await agent.post("/posts").send({ content: "일기 3" });
        
        const response = await agent.get("/posts");

        expect(response.status).toBe(200);
        expect(response.body.diaries.length).toBe(3);
        expect(response.body.diaries[0]).toEqual({
            id: post.body.postId,
            content: "일기 1",
            writeDate: expect.any(String),
            writeTime: expect.any(String),
            emotions: expect.any(Array),
            positiveScore: expect.any(Number),
            negativeScore: expect.any(Number),
        });
    });
});

// [p-02] GET /posts/:postId
describe("[p-02] GET /posts/:postId", () => {

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

    test("[pit-02-1] 로그인되지 않은 상태에서 일기 조회 요청", async () => {
        const response = await request(app).get("/posts/1");

        expect(response.status).toBe(403);
        expect(response.text).toBe("로그인이 필요합니다.");
    });
    
    test("[pit-02-2] 다른 사용자의 일기 조회 요청", async () => {
        // 어떤 사용자가 일기 작성
        const post = await agent.post("/posts").send({ content: "일기" });
        // 다른 사용자가 일기 조회
        const response = await agent2.get(`/posts/${post.body.postId}`);

        expect(response.status).toBe(403);
        expect(response.text).toBe("접근 권한이 없습니다.");
    });

    test("[pit-02-3] 존재하지 않는 ID를 가진 일기 조회 요청", async () => {
        const response = await agent.get("/posts/-1");

        expect(response.status).toBe(404);
        expect(response.text).toBe("[ID: -1] 일기가 존재하지 않습니다.");
    });

    test("[pit-02-4] 성공적인 일기 조회 요청", async () => {
        const post = await agent.post("/posts").send({ content: "일기" });
        const response = await agent.get(`/posts/${post.body.postId}`);

        expect(response.status).toBe(200);
        expect(response.body.diary).toEqual({
            id: post.body.postId,
            content: "일기",
            writeDate: expect.any(String),
            writeTime: expect.any(String),
            emotions: expect.any(Array),
            positiveScore: expect.any(Number),
            negativeScore: expect.any(Number),
        });
    });
});

// [p-03] POST /posts
describe("[p-03] POST /posts", () => {

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

    test("[pit-03-1] 로그인되지 않은 상태에서 일기 등록 요청", async () => {
        const response = await request(app).post("/posts").send({ content: "일기" });

        expect(response.status).toBe(403);
        expect(response.text).toBe("로그인이 필요합니다.");
    });

    test("[pit-03-2] 일기 내용 없이 일기 등록 요청", async () => {
        const response = await agent.post("/posts").send({ content: '' });

        expect(response.status).toBe(400);
        expect(response.text).toBe("일기 내용이 존재하지 않습니다.");
    });

    test("[pit-03-3] 성공적인 일기 등록 요청", async () => {
        const response = await agent.post("/posts").send({ content: "일기" });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            postId: expect.any(Number),
            emotions: expect.any(Array),
            positiveScore: expect.any(Number),
            negativeScore: expect.any(Number),
        });
    });
});