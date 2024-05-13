const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");
const { setEmotion } = require("../repositories");
const { joinUserInfo, loginUserInfo, newJoinUserInfo, loginNewUserInfo } = require("../data/user");

jest.setTimeout(5000);

const wait = (timeToDelay) => new Promise((resolve) => setTimeout(resolve, timeToDelay))

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

    // 모든 테스트 종료 후: 회원 탈퇴
    afterAll(async () => {
        await agent.post("/users/login").send(loginUserInfo);
        await agent.delete("/users").send({ confirmMessage: "회원 탈퇴를 희망합니다." });
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

// [cr-02] POST /chatrooms/summarize
describe("[cr-02] POST /chatrooms/summarize", () => {
    
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
    
    test("[crit-02-1] 로그인되지 않은 상태에서 대화 제출 요청", async () => {
        const response = await request(app).post("/chatrooms/summarize");

        expect(response.status).toBe(403);
        expect(response.text).toBe("로그인이 필요합니다.");
    });

    test("[crit-02-2] 채팅방이 존재하지 않는 상태에서 대화 제출 요청", async () => {
        const response = await agent.post("/chatrooms/summarize");

        expect(response.status).toBe(404);
        expect(response.text).toEqual("서버 에러가 발생했습니다.");
    });

    test("[crit-02-3] 성공적인 대화 제출 요청", async () => {
        await agent.post("/chatrooms");
        const response = await agent.post("/chatrooms/summarize");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ content: expect.any(String) });
    });
});

// [cr-03] GET /chatrooms
describe("[cr-03] GET /chatrooms", () => {

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

    test("[crit-03-1] 로그인되지 않은 상태에서 대화 불러오기 요청", async () => {
        const response = await request(app).get("/chatrooms");

        expect(response.status).toBe(403);
        expect(response.text).toBe("로그인이 필요합니다.");
    });

    test("[crit-03-2] 채팅방이 존재하지 않는 상태에서 대화 불러오기 요청", async () => {
        const response = await agent.get("/chatrooms");

        expect(response.status).toBe(404);
        expect(response.text).toBe("서버 에러가 발생했습니다.");
    });

    test("[crit-03-3] 성공적인 대화 불러오기 요청", async () => {
        // 미리 채팅방을 생성한다.
        // agent는 채팅방을 2개 생성해 최근의 채팅방이 불러와지는지를 검증한다.
        await agent.post("/chatrooms");
        await wait(2000);
        const chatroom1 = await agent.post("/chatrooms");
        const chatroom2 = await agent2.post("/chatrooms");

        // 메시지를 agent는 1개, agent2는 2개 보낸다.
        const chats1 = [];
        const chats2 = [];
        chats1.push(chatroom1.body.chat);
        chats2.push(chatroom2.body.chat);

        let response = await agent.post("/chatrooms/chats").send({ content: "대화 1"});
        chats1.push({ role: "user", content: "대화 1" });
        chats1.push(response.body.chat);

        response = await agent2.post("/chatrooms/chats").send({ content: "대화 2" });
        chats2.push({ role: "user", content: "대화 2" });
        chats2.push(response.body.chat);
        response = await agent2.post("/chatrooms/chats").send({ content: "대화 3" });
        chats2.push({ role: "user", content: "대화 3" });
        chats2.push(response.body.chat);

        const response1 = await agent.get("/chatrooms");
        const response2 = await agent2.get("/chatrooms");

        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);
        expect(response1.body).toEqual({
            roomId: chatroom1.body.roomId,
            chats: chats1,
        });
    });
});