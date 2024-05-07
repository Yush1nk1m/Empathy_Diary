const request = require("supertest");
const { sequelize } = require("../models");
const app = require("../app");

const agent = request.agent(app);

beforeAll(async () => {
    await sequelize.sync();
    await agent.post("/users").send({
            userId: "agent",  
            email: "agent@sogang.ac.kr",
            nickname: "테스트사용자",
            password: "test",
            confirmPassword: "test",
    });
    await agent.post("/users/login").send({
            userId: "agent",
            password: "test",
    });
});

// [u-02] 회원 가입
describe("[u-02] POST /users", () => {
    test("비밀번호와 확인 비밀번호가 불일치하면 회원 가입에 실패한다.", (done) => {
        request(app)
            .post("/users")
            .send({
                userId: "test",
                email: "test@sogang.ac.kr",
                nickname: "테스트",
                password: "비밀번호",
                confirmPassword: "호번밀비",
            })
            .expect(400, done);
    });

    test("이미 로그인되어 있으면 회원 가입에 실패한다.", (done) => {
        agent
            .post("/users")
            .send({
                userId: "test",
                email: "test@sogang.ac.kr",
                nickname: "테스트",
                password: "비밀번호",
                confirmPassword: "비밀번호",
            })
            .expect(409, done);
    });

    test("이미 존재하는 회원 ID로 회원 가입 요청 시 회원 가입에 실패한다.", (done) => {
        request(app)
            .post("/users")
            .send({
                userId: "agent",  
                email: "agent@sogang.ac.kr",
                nickname: "테스트사용자",
                password: "test",
                confirmPassword: "test",
            })
            .expect(409, done);
    });

    test("유효한 요청을 보내면 회원 가입에 성공한다.", (done) => {
        request(app)
            .post("/users")
            .send({
                userId: "test",
                email: "test@sogang.ac.kr",
                nickname: "테스트",
                password: "비밀번호",
                confirmPassword: "비밀번호",
            })
            .expect(200, done);
    });
});

afterAll(async () => {
    await sequelize.sync({ force: true });
});