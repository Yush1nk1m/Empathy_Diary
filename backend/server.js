const app = require("./app");
const fs = require("fs");
const https = require("https");

https.createServer(options, app).listen(8080, () => {
    console.log("Server is running on port 8080.");
});