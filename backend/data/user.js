exports.joinUserInfo = {
    userId: "user",
    email: "user@sogang.ac.kr",
    nickname: "유신",
    password: "1234567890",
    confirmPassword: "1234567890",
};

exports.newJoinUserInfo = {
    userId: "newUser",
    email: "newUser@sogang.ac.kr",
    nickname: "새로운유신",
    password: "1234567890",
    confirmPassword: "1234567890",
};

exports.loginUserInfo = {
    userId: "user",
    password: "1234567890",
};

exports.wrongLoginUserInfo = {
    userId: "user",
    password: "12345678901",
};

exports.gottenUserInfo = {
    userId: "user",
    email: "user@sogang.ac.kr",
    nickname: "유신",
};

exports.correctModifyInfo = {
    newNickname: "새로운닉네임1",
    newPassword: "newPassword1",
    newConfirmPassword: "newPassword1",
    password: "1234567890",
};

exports.wrongPasswordModifyInfo = {
    newNickname: "새로운닉네임1",
    newPassword: "newPassword1",
    newConfirmPassword: "newPassword1",
    password: "wrongPassword",
};

exports.wrongConfirmPasswordModifyInfo = {
    newNickname: "새로운닉네임1",
    newPassword: "newPassword1",
    newConfirmPassword: "newPassword2",
    password: "1234567890",
};

exports.wrongSameModifyInfo = {
    newNickname: "유신",
    newPassword: "1234567890",
    newConfirmPassword: "1234567890",
    password: "1234567890",
};

exports.wrongSamePasswordModifyInfo = {
    newNickname: "유신이",
    newPassword: "1234567890",
    newConfirmPassword: "1234567890",
    password: "1234567890",
};