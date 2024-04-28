const { isLoggedIn, isNotLoggedIn } = require("./");

describe ("isLoggedIn", () => {

    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
    };
    const next = jest.fn();

    test("로그인되어 있으면 isLoggedIn이 next를 호출한다.", () => {
        const req = {
            isAuthenticated: jest.fn(() => true),
        };

        isLoggedIn(req, res, next);

        expect(next).toBeCalledTimes(1);
    });

    test("로그인되어 있지 않으면 isLoggedIn이 오류를 응답한다.", () => {
        const req = {
            isAuthenticated: jest.fn(() => false),
        };

        isLoggedIn(req, res, next);

        expect(res.status).toBeCalledWith(403);
        expect(res.send).toBeCalledWith("로그인이 필요합니다.");
    });
});

describe("isNotLoggedIn", () => {
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
    };
    const next = jest.fn();

    test("로그인되어 있으면 isNotLoggedIn이 오류를 응답해야 한다.", () => {
        const req = {
            isAuthenticated: jest.fn(() => true),
        };

        isNotLoggedIn(req, res, next);

        expect(res.status).toBeCalledWith(409);
        expect(res.send).toBeCalledWith("이미 로그인된 상태입니다.");
    });

    test("로그인되어 있지 않으면 isNotLoggedIn이 next를 호출해야 한다.", () => {
        const req = {
            isAuthenticated: jest.fn(() => false),
        };

        isNotLoggedIn(req, res, next);

        expect(next).toBeCalledTimes(1);
    });
});