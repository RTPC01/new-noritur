const messageModel = require("../models/messages.model");

const getToken = (sender, receiver) => {
    const key = [sender, receiver].sort().join("_");
    return key;
}

const savedMessages = async ({ from, to, message, time }) => {
    try {
        const token = getToken(from, to);
        const data = { from, message, time, to };
        const res = await messageModel.updateOne({ userToken: token }, { $push: { messages: data } });

        if (res.matchedCount === 0) {
            console.log('일치하는 것이 없음.');
        } else if (res.modifiedCount === 0) {
            console.log('일치하나 수정이 발생하지 않음.');
        } else {
            console.log(`메시지가 업데이트되었습니다. Token: ${token}`);
            console.log(data);
        }
    } catch (err) {
        console.error(err);
    }
};

const fetchMessages = async (io, sender, receiver) => {
    let token = getToken(sender, receiver);
    const foundToken = await messageModel.findOne({ userToken: token });
    if (foundToken) {
        console.log(`토큰을 찾아 DB에 업데이트 ${token}`);
        io.to(sender).emit('stored-messages', { messages: foundToken.messages })
    } else {
        console.log('토큰을 찾지 못해 생성한다.')
        let data = {
            userToken: token,
            messages: []
        }
        console.log(data.userToken)
        const message = new messageModel(data);
        const savedMessage = await message.save();
        console.log(savedMessage)
        if (savedMessage) {
            console.log(`메시지가 생성되었습니다. ${data.userToken}`);
        } else {
            console.log('메시지 생성 중 에러가 발생했습니다.');
        }
    }
}

module.exports = {
    savedMessages,
    fetchMessages
}