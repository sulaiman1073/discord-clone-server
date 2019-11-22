const state = require("../config/state");
const redis = require("../config/redis");
const { pub } = require("../config/pubSub");
const { USER_UPDATE } = require("../config/constants");

const closeHandler = (ws, userId) => {
  ws.on("close", async () => {
    const memberServers = {};

    for await (const gid of state[userId].guilds) {
      const gids = await redis.smembers(gid);

      for await (const mid of gids) {
        const sid = await redis.get(mid);
        if (!memberServers[sid]) memberServers[sid] = new Set();

        memberServers[sid].add(gid);
      }
    }

    const pipeline = await redis.pipeline();

    for await (const guildId of state[userId].guilds) {
      await pipeline.srem(guildId, userId);
    }

    await pipeline.del(userId);
    await pipeline.exec();

    Object.entries(memberServers).forEach(([sid, gids]) => {
      pub.publish(
        sid,
        JSON.stringify({
          type: USER_UPDATE,
          payload: {
            guildIds: [...gids],
            userId,
            online: false
          }
        })
      );
    });
  });
};

module.exports = closeHandler;
