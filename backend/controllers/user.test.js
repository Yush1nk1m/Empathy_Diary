jest.mock("passport");
jest.mock("../models/user");
const passport = require("passport");
const User = require("../models/user");
const { join, login, logout } = require("./user");

describe("join", () => {
    const req = {
        body: {
            "userId": "yush1nk1m",
            "email": "yush1nk1m@github.com",
            "nickname": "유신",
            "password": "12345",
        }
    };
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
    };
    const next = jest.fn();
    
    User.create.mockReturnValue(Promise.resolve(true));

    test("같은 ID를 가진 사용자가 존재하지 않으면 회원 가입에 성공한다.", async () => {
        User.findOne.mockReturnValue(Promise.resolve(false));

        await join(req, res, next);

        expect(res.status).toBeCalledWith(200);
        expect(res.send).toBeCalledWith("회원 가입에 성공했습니다.");
    });

    test("같은 ID를 가진 사용자가 존재할 경우 회원 가입에 실패한다.", async () => {
        User.findOne.mockReturnValue(Promise.resolve(true));

        await join(req, res, next);

        expect(res.status).toBeCalledWith(409);
        expect(res.send).toBeCalledWith("이미 존재하는 회원 ID입니다.");
    });

    test("데이터베이스 작업 중 에러가 발생하면 next(error)를 호출한다.", async () => {
        const message = "데이터베이스 에러가 발생하였습니다.";
        User.findOne.mockReturnValue(Promise.reject(message));

        await join(req, res, next);

        expect(next).toBeCalledWith(message);
    });
});

describe("login", () => {
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
    };
    const next = jest.fn();
    
    test("인증 및 로그인 과정에 에러가 없고, 사용자 정보가 존재하면 로그인에 성공한다.", () => {
        const req = {
            login: jest.fn((null, jest.fn((user, callback) => {
                callback(false);
            }))),
        }
        passport.authenticate.mockImplementation((strategy, callback) => 
            (req, res, next) => callback(null, true, {})
        );

        login(req, res, next);

        expect(res.status).toBeCalledWith(200);
        expect(res.send).toBeCalledWith("로그인에 성공했습니다.");
    });

    test("로그인 에러가 발생하면 next(loginError)가 호출된다.", () => {
        const loginError = new Error("로그인 중 에러가 발생했습니다.");
        const req = {
            login: jest.fn((null, jest.fn((user, callback) => {
                callback(loginError);
            }))),
        }
        passport.authenticate.mockImplementation((strategy, callback) => 
            (req, res, next) => callback(null, true, {})
        );

        login(req, res, next);

        expect(next).toBeCalledWith(loginError);
    });

    test("사용자 정보가 존재하지 않으면 로그인에 실패한다.", () => {
        const req = {
            login: jest.fn(),
        };
        passport.authenticate.mockImplementation((strategy, callback) => 
            (req, res, next) => callback(null, false, {})
        );

        login(req, res, next);

        expect(res.status).toBeCalledWith(404);
        expect(res.send).toBeCalledWith("사용자 정보가 존재하지 않습니다.");
        expect(req.login).toBeCalledTimes(0);
    });

    test("인증 에러가 발생하면 로그인에 실패한다.", () => {
        const authError = new Error("인증 에러가 발생했습니다.");
        const req = {
            login: jest.fn(),
        };
        passport.authenticate.mockImplementation((strategy, callback) => 
            (req, res, next) => callback(authError, true, {})
        );

        login(req, res, next);

        expect(next).toBeCalledWith(authError);
        expect(req.login).toBeCalledTimes(0);
    });
});

describe("logout", () => {
    const req = {
        logout: jest.fn(callback => callback()),
    };
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
    };

    test("로그아웃을 시도하면 로그아웃에 성공한다.", () => {
        logout(req, res);

        expect(res.status).toBeCalledWith(200);
        expect(res.send).toBeCalledWith("로그아웃에 성공하였습니다.");
    });
});