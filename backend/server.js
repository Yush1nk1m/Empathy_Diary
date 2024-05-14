const app = require("./app");
const fs = require("fs");
const https = require("https");

// SSL 옵션 설정
const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
};

https.createServer(options, app).listen(8080, () => {
    console.log("Server is running on port 8080.");
});