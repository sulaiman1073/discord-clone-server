/* eslint-disable no-param-reassign */
const logger = require("../config/logger");
const { subscriber } = require("../config/pubSub");
const { HELLO, PING } = require("../config/constants");
const sender = require("./sender");
const closeHandler = require("./closeHandler");
const messageHandler = require("./messageHandler");
const config = require("../config");

module.exports = (app, wss) => {
  subscriber.on("message", async (channel, message) => {
    const parsedMessage = JSON.parse(message);
    const messageType = parsedMessage.type;
    const messagePayload = parsedMessage.payload;

    sender(wss, messageType, messagePayload);
  });

  app.ws("/ws", async (ws, req) => {
    try {
      if (!req.isAuthenticated()) {
        ws.terminate();
      }

      ws.userId = req.user.id;
      ws.isAlive = true;

      closeHandler(ws, ws.userId);
      messageHandler(ws, ws.userId);

      ws.send(
        JSON.stringify({
          type: HELLO,
          payload: {
            heartbeatInterval: Number(config.heartbeatInterval)
          }
        })
      );
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: "authenticationError",
          payload: {}
        })
      );
      logger.error(error);
      ws.terminate();
    }
  });

  setInterval(() => {
    wss.getWss().clients.forEach(client => {
      try {
        if (client.isAlive === false) return client.terminate();

        client.isAlive = false;
        if (client.readyState === 1) {
          client.send(
            JSON.stringify({
              type: PING
            })
          );
        } else {
          client.terminate();
        }
      } catch (error) {
        logger.error(error);
      }
    });
  }, config.heartbeatInterval);
};
