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

// [p-05] DELETE /posts/:postId
describe("[p-05] DELETE /posts/:postId", () => {

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

    test("[pit-05-1] 로그인되지 않은 상태에서 일기 삭제 요청", async () => {
        const response = await request(app).delete("/posts/-1");

        expect(response.status).toBe(403);
        expect(response.text).toBe("로그인이 필요합니다.");
    });

    test("[pit-05-2] 다른 사용자의 일기 삭제 요청", async () => {
        const post = await agent.post("/posts").send({ content: "일기" });
        const response = await agent2.delete(`/posts/${post.body.postId}`);

        expect(response.status).toBe(403);
        expect(response.text).toBe("접근 권한이 없습니다.");
    });

    test("[pit-05-3] 존재하지 않는 ID의 일기 삭제 요청", async () => {
        const response = await agent.delete("/posts/-1");

        expect(response.status).toBe(404);
        expect(response.text).toBe("[ID: -1] 일기가 존재하지 않습니다.");
    });

    test("[pit-05-4] 성공적인 일기 삭제 요청", async () => {
        const post = await agent.post("/posts").send({ content: "일기" });
        const response = await agent.delete(`/posts/${post.body.postId}`);

        expect(response.status).toBe(200);
        expect(response.text).toBe("일기가 삭제되었습니다.");
    });
});

// [p-06] GET /posts/period?[startDate]&[endDate]
describe("[p-06] GET /posts/period?[startDate]&[endDate]", () => {

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

    test("[pit-06-1] 로그인되지 않은 상태에서 일기 조회 요청", async () => {
        const response = await request(app).get(`/posts/period?startDate=${todayString}&endDate=${todayString}`);

        expect(response.status).toBe(403);
        expect(response.text).toBe("로그인이 필요합니다.");
    });

    test("[pit-06-2] 충분한 쿼리 파라미터 없이 일기 조회 요청", async () => {
        const response = await agent.get("/posts/period");

        expect(response.status).toBe(400);
        expect(response.text).toBe("충분한 쿼리 파라미터가 제공되지 않았습니다.");
    });

    test("[pit-06-3] 유효하지 않은 쿼리 파라미터 값으로 일기 조회 요청", async () => {
        const response = await agent.get("/posts/period?startDate=invalid&endDate=invalid");

        expect(response.status).toBe(400);
        expect(response.text).toBe("쿼리 파라미터의 값이 유효하지 않습니다.");
    });

    test("[pit-06-4] 성공적인 일기 조회 요청", async () => {
        const posts = [];
        posts.push(await agent.post("/posts").send({ content: "일기 1" }));
        posts.push(await agent.post("/posts").send({ content: "일기 2" }));
        posts.push(await agent.post("/posts").send({ content: "일기 3" }));

        const yesterdayResponse = await agent.get(`/posts/period?startDate=${yesterdayString}&endDate=${yesterdayString}`);
        const todayResponse = await agent.get(`/posts/period?startDate=${todayString}&endDate=${todayString}`);
        const tomorrowResponse = await agent.get(`/posts/period?startDate=${tomorrowString}&endDate=${tomorrowString}`);

        expect(yesterdayResponse.status).toBe(200);
        expect(todayResponse.status).toBe(200);
        expect(tomorrowResponse.status).toBe(200);

        const result = posts.map((post) => {
            return {
                id: post.body.postId,
                content: expect.any(String),
                writeDate: expect.any(String),
                writeTime: expect.any(String),
                emotions: expect.any(Array),
                positiveScore: expect.any(Number),
                negativeScore: expect.any(Number),
            };
        });

        expect(yesterdayResponse.body.diaries).toEqual([]);
        expect(tomorrowResponse.body.diaries).toEqual([]);
        expect(todayResponse.body.diaries.length).toBe(3);
        expect(todayResponse.body.diaries).toEqual(result);
    });
});