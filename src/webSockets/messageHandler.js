/* eslint-disable no-param-reassign */
const { PONG } = require("../config/constants");

const messageHandler = (ws, userId) => {
  ws.on("message", async message => {
    const parsedMessage = JSON.parse(message);
    const messageType = parsedMessage.type;
    // const messagePayload = parsedMessage.payload;

    if (messageType === PONG) {
      ws.isAlive = true;
    }
  });
};

module.exports = messageHandler;
