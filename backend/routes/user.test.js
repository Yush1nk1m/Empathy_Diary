const request = require("supertest");
const { sequelize } = require("../models");
const app = require("../app");

jest.setTimeout(2000);

// 로그인된 에이전트
const agent = request.agent(app);

beforeEach(async () => {
    await sequelize.sync({ force: true });
    
    await agent.post("/users").send({
            userId: "agent",  
            email: "agent@sogang.ac.kr",
            nickname: "테스트사용자",
            password: "test",
            confirmPassword: "test",
    }).expect(200);

    await agent.post("/users/login").send({
        userId: "agent",
        password: "test",
    }).expect(200);

    await request(app).post("/users").send({
        userId: "user",
        email: "user@sogang.ac.kr",
        nickname: "테스트사용자",
        password: "test",
        confirmPassword: "test",
    }).expect(200);
});

// [u-01] 회원 정보 조회
describe("[u-01] GET /users", () => {
    test("로그인되어 있지 않으면 회원 정보 조회에 실패한다.", async () => {
        return request(app)
            .get("/users")
            .expect(403)
            .expect("로그인이 필요합니다.");
    });

    test("로그인되어 있으면 회원 정보 조회에 성공한다.", async () => {
        return agent
            .get("/users")
            .expect(200)
            .expect({
                userId: "agent",
                email: "agent@sogang.ac.kr",
                nickname: "테스트사용자",
            });
    });
});

// [u-02] 회원 가입
describe("[u-02] POST /users", () => {
    test("비밀번호와 확인 비밀번호가 불일치하면 회원 가입에 실패한다.", async () => {
        return request(app)
            .post("/users")
            .send({
                userId: "test",
                email: "test@sogang.ac.kr",
                nickname: "테스트",
                password: "비밀번호",
                confirmPassword: "호번밀비",
            })
            .expect(400)
            .expect("비밀번호와 확인 비밀번호가 일치하지 않습니다.");
    });

    test("이미 로그인되어 있으면 회원 가입에 실패한다.", async () => {
        return agent
            .post("/users")
            .send({
                userId: "test",
                email: "test@sogang.ac.kr",
                nickname: "테스트",
                password: "비밀번호",
                confirmPassword: "비밀번호",
            })
            .expect(409)
            .expect("이미 로그인된 상태입니다.");
    });

    test("이미 존재하는 회원 ID로 회원 가입 요청 시 회원 가입에 실패한다.", async () => {
        return request(app)
            .post("/users")
            .send({
                userId: "agent",  
                email: "agent@sogang.ac.kr",
                nickname: "테스트사용자",
                password: "test",
                confirmPassword: "test",
            })
            .expect(409)
            .expect("이미 존재하는 회원 ID입니다.");
    });

    test("유효한 요청을 보내면 회원 가입에 성공한다.", async () => {
        return request(app)
            .post("/users")
            .send({
                userId: "test",
                email: "test@sogang.ac.kr",
                nickname: "테스트",
                password: "비밀번호",
                confirmPassword: "비밀번호",
            })
            .expect(200)
            .expect("회원 가입에 성공했습니다.");
    });
});

// [u-03] 로그인
describe("[u-03] POST /users/login", () => {
    test("회원 정보가 일치하지 않을 시 로그인에 실패한다.", async () => {
        return request(app)
            .post("/users/login")
            .send({
                userId: "agent",
                password: ".",
            })
            .expect(400)
            .expect("사용자 정보가 일치하지 않습니다.");
    });

    test("이미 로그인되어 있으면 로그인에 실패한다.", async () => {
        return agent
            .post("/users/login")
            .send({
                userId: "agent",
                password: "test",
            })
            .expect(409)
            .expect("이미 로그인된 상태입니다.");
    });

    test("유효한 요청을 보내면 로그인에 성공한다.", async () => {
        return request(app)
            .post("/users/login")
            .send({
                userId: "user",
                password: "test",
            })
            .expect(200)
            .expect("로그인에 성공했습니다.");
    })
});

// [u-04] 회원 정보 수정
describe("[u-04] PATCH /users", () => {
    test("로그인되어 있지 않으면 회원 정보 수정에 실패한다.", async () => {
        return request(app)
            .patch("/users")
            .send({
                newNickname: "새로운 닉네임",
                newPassword: "newpassword",
                newConfirmPassword: "newpassword",
                password: "test",
            })
            .expect(403)
            .expect("로그인이 필요합니다.");
    });

    test("현재 비밀번호가 불일치하면 회원 정보 수정에 실패한다.", async () => {
        return agent
            .patch("/users")
            .send({
                newNickname: "새로운 닉네임",
                newPassword: "newpassword",
                newConfirmPassword: "newpassword",
                password: "wrong",
            })
            .expect(400)
            .expect("비밀번호가 일치하지 않습니다.");
    });

    test("변경될 정보가 없으면 회원 정보 수정에 실패한다.", async () => {
        return agent
            .patch("/users")
            .send({
                newNickname: "테스트사용자",
                newPassword: "",
                newConfirmPassword: "",
                password: "test",
            })
            .expect(400)
            .expect("변경될 정보가 존재하지 않습니다.");
    });

    test("변경할 비밀번호와 확인 비밀번호가 일치하지 않으면 회원 정보 수정에 실패한다.", async () => {
        return agent
            .patch("/users")
            .send({
                newNickname: "테스트사용자",
                newPassword: "new",
                newConfirmPassword: "wrong",
                password: "test",
            })
            .expect(400)
            .expect("변경할 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
    });

    test("변경할 비밀번호와 원래의 비밀번호가 같으면 회원 정보 수정에 실패한다.", async () => {
        return agent
            .patch("/users")
            .send({
                newNickname: "테스트사용자",
                newPassword: "test",
                newConfirmPassword: "test",
                password: "test",
            })
            .expect(400)
            .expect("변경할 비밀번호는 원래의 비밀번호와 달라야 합니다.");        
    });

    test("유효한 요청을 보내면 회원 정보 수정에 성공한다.", async () => {
        return agent
            .patch("/users")
            .send({
                newNickname: "새로운 닉네임",
                newPassword: "jest",
                newConfirmPassword: "jest",
                password: "test",
            })
            .expect(200)
            .expect("회원 정보가 수정되었습니다.");        
    });
});

// [u-05] 회원 탈퇴
describe("[u-05] DELETE /users", () => {
    test("로그인되어 있지 않으면 회원 탈퇴에 실패한다.", async () => {
        return request(app)
            .delete("/users")
            .expect(403)
            .expect("로그인이 필요합니다.");
    });

    test("확인 메시지가 불일치하면 회원 탈퇴에 실패한다.", async () => {
        const agent = request.agent(app);
        await agent.post("/users/login").send({
            userId: "user",
            password: "test",
        }).expect(200);
        
        return agent
            .delete("/users")
            .send({ confirmMessage: "회원 탈퇴를 희망하지 않습니다." })
            .expect(400)
            .expect("확인 메시지가 잘못되었습니다.");
    });

    test("확인 메시지가 일치하면 회원 탈퇴에 성공하고 다시 로그인할 수 없다.", async () => {
        const agent = request.agent(app);
        await agent.post("/users/login").send({
            userId: "user",
            password: "test",
        }).expect(200);

        await agent
            .delete("/users")
            .send({ confirmMessage: "회원 탈퇴를 희망합니다." })
            .expect(200)
            .expect("회원 탈퇴가 완료되었습니다.");

        return agent.post("/users/login").send({
            userId: "user",
            password: "test",
        }).expect(400);
    });
});

// [u-06] 로그아웃
describe("[u-06] POST /users/logout", () => {
    test("로그인되지 않은 상태면 로그아웃에 실패한다.", async () => {
        return request(app)
            .post("/users/logout")
            .expect(403)
            .expect("로그인이 필요합니다.");
    });

    test("로그인된 상태면 로그아웃에 성공하고 다시 로그인할 수 있다.", async () => {
        await agent
            .post("/users/logout")
            .expect(200)
            .expect("로그아웃에 성공하였습니다.");
        
        return agent
            .post("/users/login")
            .send({ userId: "agent", password: "test" })
            .expect(200);
    });
});