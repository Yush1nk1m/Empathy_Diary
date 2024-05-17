jest.mock("../models");
const { Emotion } = require("../models");
const { setEmotion } = require("./index");

let exitSpy;

beforeAll(() => {
    exitSpy = jest.spyOn(process, "exit").mockImplementation((code) => {
        console.log(`process.exit called with code: ${code}`);
    });
});

afterAll(() => {
    exitSpy.mockRestore();
});

describe("setEmotion", () => {
    test("데이터베이스 작업 중 에러가 발생하면 프로세스를 종료한다.", async () => {
        const error = new Error("데이터베이스 작업 중 에러가 발생했습니다.");
        Emotion.findOrCreate.mockReturnValueOnce(Promise.reject(error));

        await setEmotion();

        expect(process.exit).toBeCalledTimes(1);
    });
});