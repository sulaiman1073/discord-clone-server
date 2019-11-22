/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-loop-func */
const authenticateUser = require("../helpers/middleware/authenticateUser");
const { ApiError, DatabaseError } = require("../helpers/errors");
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

  app.ws("/", async (ws, req) => {
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
      // wss.disconnect()
    }
  });

  setInterval(() => {
    wss.getWss().clients.forEach(client => {
      if (client.isAlive === false) return client.terminate();

      client.isAlive = false;
      client.send(
        JSON.stringify({
          type: PING
        })
      );
    });
  }, config.heartbeatInterval);
};
