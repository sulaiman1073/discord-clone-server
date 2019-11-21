const Redis = require("ioredis");
const config = require("../config");
const redis = require("../config/redis");
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

const pub = new Redis({
  host: config.redisHost || "localhost",
  port: config.redisPort || 6379,
  db: config.redisIndex || 0,
  password: config.redisPassword || null
});

const subscriber = new Redis({
  host: config.redisHost || "localhost",
  port: config.redisPort || 6379,
  db: config.redisIndex || 0,
  password: config.redisPassword || null
});

subscriber.subscribe(config.serverId);

const publisher = async ({ type, guildId, userId, payload }) => {
  if (guildEvents.includes(type)) {
    const memberIds = await redis.smembers(guildId);
    const serverIds = new Set();

    for await (const memberId of memberIds) {
      const serverId = await redis.get(memberId);
      serverIds.add(serverId);
    }

    for await (const serverId of serverIds) {
      await pub.publish(
        serverId,
        JSON.stringify({
          type,
          payload
        })
      );
    }
  } else if (userEvents.includes(type)) {
    const memberServers = {};

    for await (const gid of state[userId].guilds) {
      const gids = await redis.smembers(gid);

      for await (const memberId of gids) {
        const sid = await redis.get(memberId);
        if (!memberServers[sid]) memberServers[sid] = new Set();

        memberServers[sid].add(gid);
      }
    }

    Object.entries(memberServers).forEach(([sid, gids]) => {
      pub.publish(
        sid,
        JSON.stringify({
          type,
          payload: {
            guildIds: [...gids],
            userId,
            ...payload
          }
        })
      );
    });
  }
};

module.exports = { publisher, subscriber, pub };
