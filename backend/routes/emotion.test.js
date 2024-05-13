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

// [e-01] GET /emotions
describe("[e-01] GET /emotions", () => {
    
    const agent = request.agent(app);

    const emotions = ["기쁨", "사랑", "뿌듯함", "우울함", "불안함", "분노", "놀람", "외로움", "공포", "후회", "부끄러움"];
    emotions.sort();
    
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

    test("[eit-01-1] 로그인되지 않은 상태에서 감정 조회 요청", async () => {
        const response = await request(app).get("/emotions");

        expect(response.status).toBe(403);
        expect(response.text).toBe("로그인이 필요합니다.");
    });

    test("[eit-01-2] 성공적인 감정 조회 요청", async () => {
        const response = await agent.get("/emotions");

        const result = emotions.map((emotion) => {
            return {
                [emotion]: expect.any(Number),
            };
        });

        expect(response.status).toBe(200);
        expect(response.body.emotions).toEqual(result);
    });
});

// [e-02] GET /emotions/period?[startDate]&[endDate]
describe("[e-02] GET /emotions/period?[startDate]&[endDate]", () => {

    const agent = request.agent(app);

    const today = new Date();
    const todayString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`

    const emotions = ["기쁨", "사랑", "뿌듯함", "우울함", "불안함", "분노", "놀람", "외로움", "공포", "후회", "부끄러움"];
    emotions.sort();
    
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
    
    test("[eit-02-1] 로그인되지 않은 상태에서 감정 조회 요청", async () => {
        const response = await request(app).get(`/emotions/period?startDate=${todayString}&endDate=${todayString}`);

        expect(response.status).toBe(403);
        expect(response.text).toBe("로그인이 필요합니다.");
    });

    test("[eit-02-2] 불충분한 쿼리 파라미터로 감정 조회 요청", async () => {
        const response = await agent.get("/emotions/period");

        expect(response.status).toBe(400);
        expect(response.text).toBe("충분한 쿼리 파라미터가 제공되지 않았습니다.");
    });

    test("[eit-02-3] 유효하지 않은 쿼리 파라미터 값으로 감정 조회 요청", async () => {
        const response = await agent.get("/emotions/period?startDate=invalid&endDate=invalid");

        expect(response.status).toBe(400);
        expect(response.text).toBe("쿼리 파라미터의 값이 유효하지 않습니다.");
    });

    test("[eit-02-4] 성공적인 감정 조회 요청", async () => {
        const response = await agent.get(`/emotions/period?startDate=${todayString}&endDate=${todayString}`);

        const result = emotions.map((emotion) => {
            return {
                [emotion]: expect.any(Number),
            };
        });

        expect(response.status).toBe(200);
        expect(response.body.emotions).toEqual(result);
    });
});