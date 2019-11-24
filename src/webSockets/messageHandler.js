/* eslint-disable no-param-reassign */
const { PONG } = require("../config/constants");

const messageHandler = (ws, userId) => {
  ws.on("message", async message => {
    const parsedMessage = JSON.parse(message);
    const messageType = parsedMessage.type;

    if (messageType === PONG) {
      ws.isAlive = true;
    }
  });
};

module.exports = messageHandler;
