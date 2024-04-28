const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/user");

// 회원 가입 컨트롤러
exports.join = async (req, res, next) => {
    const { userId, email, nickname, password } = req.body;

    try {
        const exUser = await User.findOne({ where: { userId } });
        if (exUser) {
            return res.status(409).send("이미 존재하는 회원 ID입니다.");
        }

        const hashedPassword = await bcrypt.hash(password, 50);
        await User.create({
            userId,
            email,
            nickname,
            password: hashedPassword,
        });

        return res.status(200).send("회원 가입에 성공했습니다.");

    } catch (error) {
        console.error(error);
        return next(error);
    }
}

exports.login = (req, res, next) => {
    passport.authenticate("local", (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }

        if (!user) {
            return res.status(404).send("사용자 정보가 존재하지 않습니다.");
        }

        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }

            return res.status(200).send("로그인 성공");
        })
    })(req, res, next);     // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙인다.
};

exports.logout = (req, res) => {
    req.logout(() => {
        return res.status(200).send("로그아웃에 성공하였습니다.");
    })
};