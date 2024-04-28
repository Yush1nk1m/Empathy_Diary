const passport = require("passport");
const local = require("./localStrategy");
const User = require("../models/user");

module.exports = () => {
    // 로그인 시 실행된다.
    // req.session 객체에 어떤 데이터를 저장할지 정한다.
    passport.serializeUser((user, done) => {
        done(null, user.userId);
    });

    // 매 요청마다 passport.session 미들웨어에 의해 실행된다.
    passport.deserializeUser((userId, done) => {
        User.findOne({ where: { userId } })
            .then(user => done(null, user))
            .catch(err => done(err));
    });

    local();
}