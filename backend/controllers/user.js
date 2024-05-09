const bcrypt = require("bcrypt");
const passport = require("passport");
const { sequelize, User } = require("../models");

// [u-01] 회원 정보 조회
exports.getUserInfo = (req, res) => {
    const { userId, email, nickname } = req.user;

    return res.status(200).json({ userId, email, nickname });
};

// [u-02] 회원 가입
exports.join = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    const { userId, email, nickname, password, confirmPassword } = req.body;

    try {
        if (password !== confirmPassword) {
            return res.status(400).send("비밀번호와 확인 비밀번호가 일치하지 않습니다.");
        }
        
        const exUser = await User.findOne({ where: { userId } });
        if (exUser) {
            return res.status(409).send("이미 존재하는 회원 ID입니다.");
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await User.create({
            userId,
            email,
            nickname,
            password: hashedPassword,
        }, {
            transaction,
        });

        await transaction.commit();

        return res.status(200).send("회원 가입에 성공했습니다.");

    } catch (error) {
        await transaction.rollback();
        return next(error);
    }
};

// [u-03] 로그인
exports.login = (req, res, next) => {
    passport.authenticate("local", (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }

        if (!user) {
            return res.status(400).send("사용자 정보가 일치하지 않습니다.");
        }

        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }

            return res.status(200).send("로그인에 성공했습니다.");
        });
    })(req, res, next);     // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙인다.
};

// [u-04] 회원 정보 수정
exports.modifyUserInfo = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { userId, nickname } = req.user;
        const { newNickname, newPassword, newConfirmPassword, password } = req.body;
        
        const isPasswordCorrect = await bcrypt.compare(password, req.user.password);
        if (!isPasswordCorrect) {
            return res.status(400).send("비밀번호가 일치하지 않습니다.");
        }

        if (!newPassword && newNickname === nickname) {
            return res.status(400).send("변경될 정보가 존재하지 않습니다.");
        }

        if (newPassword) {
            if (newPassword !== newConfirmPassword)
                return res.status(400).send("변경할 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            if (newPassword === password)
                return res.status(400).send("변경할 비밀번호는 원래의 비밀번호와 달라야 합니다.");
        }

        const user = await User.findOne({ where: { userId } });
        if (newNickname)
            user.nickname = newNickname;
        if (newPassword)
            user.password = await bcrypt.hash(newPassword, 12);

        await user.save({ transaction });

        await transaction.commit();

        return res.status(200).send("회원 정보가 수정되었습니다.");

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

// [u-05] 회원 탈퇴
exports.deleteUserInfo = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { confirmMessage } = req.body;
        if (confirmMessage !== "회원 탈퇴를 희망합니다.") {
            return res.status(400).send("확인 메시지가 잘못되었습니다.");
        }
        
        await User.destroy({
            where: {
                userId: req.user.userId,
            },
            transaction,
        });
        
        await transaction.commit();

        req.logout(() => {
            return res.status(200).send("회원 탈퇴가 완료되었습니다.");
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

// [u-06] 로그아웃
exports.logout = (req, res) => {
    req.logout(() => {
        return res.status(200).send("로그아웃에 성공하였습니다.");
    });
};