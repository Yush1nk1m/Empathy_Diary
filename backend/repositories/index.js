const Emotion = require("../models/emotion");

exports.setEmotion = async () => {
    const emotions = ["기쁨", "사랑", "뿌듯함", "우울함", "불안함", "분노", "놀람", "외로움", "공포", "후회", "부끄러움"];

    for (const emotion of emotions) {
        await Emotion.findOrCreate({
            where: { typeName: emotion },
            defaults: { typeName: emotion },
        });
        console.log(`[EMOTION: ${emotion}] FOUND OR CREATED.`);
    }
};