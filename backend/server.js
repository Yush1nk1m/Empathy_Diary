const app = require("./app");

app.listen(app.get("port"), () => console.log(app.get("port"), "번 포트에서 서버 실행 중입니다."));