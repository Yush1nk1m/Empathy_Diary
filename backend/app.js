const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const passport = require("passport");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const redis = require("redis");
const RedisStore = require('connect-redis').default;

dotenv.config();
const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD,
});
redisClient.connect().catch(console.error);
const indexRouter = require("./routes");
const { sequelize } = require("./models");
const passportConfig = require("./passport");
const { setEmotion } = require("./repositories");

const app = express();
passportConfig();
app.set("port", process.env.PORT || 8080);
app.set("view engine", "html");
nunjucks.configure("views", {
    express: app,
    watch: true,
});
sequelize.sync({ force: false })
    .then(() => {
        console.log("데이터베이스 연결 성공");
    })
    .then(async () => {
        await setEmotion();
    })
    .catch((err) => {
        console.error(err);
    });

app.use(cors({
    credentials: true,
}));
if (process.env.NODE_ENV === "production") {
    app.use(morgan("combined"));
    app.use(
        helmet({
            contentSecurityPolicy: false,
            crossOriginEmbedderPolicy: false,
            crossOriginResourcePolicy: false,
        }),
    );
    app.use(hpp());
} else {
    app.use(morgan("dev"));
}
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
const sessionOption = {
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
    store: new RedisStore({ client: redisClient }),
};
if (process.env.NODE_ENV === "production") {
    sessionOption.proxy = true;
}
app.use(session(sessionOption));
app.use(passport.initialize());     // 1. req 객체에 passport 설정을 저장한다.
app.use(passport.session());        // 2. req.session 객체에 passport 정보를 저장한다.

app.use("/", indexRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
    res.status(err.status || 500).send("서버 에러가 발생했습니다.");
});

module.exports = app;