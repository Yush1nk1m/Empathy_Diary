module.exports = {
  // 테스트 환경이 구동되기 전 실행할 모듈을 지정합니다.
  setupFiles: ["dotenv/config"],
  
  // 기존에 설정되어 있던 옵션들...
  testEnvironment: "node",
  verbose: true,
};