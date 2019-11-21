const _ = require("lodash");
const state = require("../config/state");
const {
  GUILD_UPDATE,
  GUILD_DELETE,
  CHANNELS_UPDATE,
  MEMBER_ADD,
  MEMBER_DELETE,
  MEMBER_TYPING,
  MESSAGE_ADD,
  USER_UPDATE
} = require("../config/constants");

const guildEvents = [
  GUILD_UPDATE,
  GUILD_DELETE,
  CHANNELS_UPDATE,
  MEMBER_ADD,
  MEMBER_DELETE,
  MEMBER_TYPING,
  MESSAGE_ADD
];

const userEvents = [USER_UPDATE];

const sender = (wss, messageType, messagePayload) => {
  if (guildEvents.includes(messageType)) {
    const { guildId } = messagePayload;

    wss.getWss().clients.forEach(client => {
      const userGuilds = state[client.userId] && state[client.userId].guilds;

      if (userGuilds.has(guildId) && client.readyState === 1) {
        client.send(
          JSON.stringify({
            type: messageType,
            payload: messagePayload
          })
        );

        if (messageType === GUILD_DELETE) {
          state[client.userId].guilds.delete(guildId);
        }
      }
    });
  } else if (userEvents.includes(messageType)) {
    const { guildIds } = messagePayload;

    wss.getWss().clients.forEach(client => {
      const userGuilds = state[client.userId] && state[client.userId].guilds;
      const guildsInCommon =
        userGuilds && _.intersection([...userGuilds], guildIds);

      if (
        userGuilds &&
        guildsInCommon.length !== 0 &&
        client.readyState === 1
      ) {
        client.send(
          JSON.stringify({
            type: messageType,
            payload: {
              ...messagePayload,
              guildIds: guildsInCommon
            }
          })
        );
      }
    });
  }
};

module.exports = sender;
