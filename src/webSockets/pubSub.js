const Redis = require("ioredis");
const config = require("../config");
const redis = require("../config/redis");
const state = require("../config/state");

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

const publisher = (channel, message) => {
  pub.publish(channel, message);
};

const publishToUserGuilds = async (type, userId, payload) => {
  const memberServers = {};

  for await (const guildId of state[userId].guilds) {
    const gids = await redis.smembers(guildId);

    for await (const memberId of gids) {
      const sid = await redis.get(memberId);
      if (!memberServers[sid]) memberServers[sid] = new Set();

      memberServers[sid].add(guildId);
    }
  }

  Object.entries(memberServers).forEach(([sid, gids]) => {
    publisher(
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
};

const publishToGuild = async (type, guildId, payload) => {
  const memberIds = await redis.smembers(guildId);
  const serverIds = new Set();

  for await (const memberId of memberIds) {
    const serverId = await redis.get(memberId);
    serverIds.add(serverId);
  }

  for await (const serverId of serverIds) {
    await publisher(
      serverId,
      JSON.stringify({
        type,
        payload
      })
    );
  }
};

module.exports = { publisher, subscriber, publishToUserGuilds, publishToGuild };
