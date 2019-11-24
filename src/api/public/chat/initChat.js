/* eslint-disable prefer-destructuring */
const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
// const { cache } = require("../../../helpers/middleware/cache");
const initChat = require("../../../database/queries/initChat");
const getMessages = require("../../../database/queries/getMessages");
const config = require("../../../config");
const redis = require("../../../config/redis");
const { publisher } = require("../../../config/pubSub");
const { USER_UPDATE } = require("../../../config/constants");
const state = require("../../../config/state");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");

router.get(
  "/",
  authenticateUser,
  // cache,
  celebrate({
    query: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .optional()
      })
      .optional()
  }),
  async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(`Couldn't initiate chat`, 404);
      }
      const { id: userId } = req.user;
      let { channelId } = req.query;
      let guildId;
      let guildIds;
      let activeChannelMessages;
      let foundActiveChannel = false;
      const guilds = {};
      const channels = {};
      const members = {};
      const messages = {};
      state[userId] = {
        guilds: new Set()
      };

      const chatInfo = await initChat({ userId, channelId });

      if (!chatInfo) throw new ApiError(`Couldn't initiate chat`, 404);

      const pipeline = redis.pipeline();
      await pipeline.set(userId, config.serverId);

      if (chatInfo.guilds) {
        Object.entries(chatInfo.guilds).forEach(([gid, guild]) => {
          guilds[gid] = {
            name: guild.name,
            icon: guild.icon,
            ownerId: guild.ownerId,
            inviteCode: guild.inviteCode
          };

          members[gid] = { ...guild.members };
          channels[gid] = { ...guild.channels };
        });

        Object.values(channels)
          .map(channel => Object.keys(channel))
          .flat()
          .forEach(cid => {
            messages[cid] = [];
          });

        guildIds = Object.keys(chatInfo.guilds);

        Object.entries(chatInfo.guilds).forEach(([gid, guild]) => {
          Object.keys(guild.channels).forEach(cid => {
            if (channelId === cid) {
              foundActiveChannel = true;
              guildId = gid;
            }
          });
        });

        if (!foundActiveChannel) {
          guildId = guildIds[0];
          channelId = Object.keys(
            Object.values(chatInfo.guilds)[0].channels
          )[0];

          activeChannelMessages = await getMessages({
            channelId,
            userId
          });

          messages[channelId] = [...activeChannelMessages];
        } else {
          messages[channelId] = channels[guildId][channelId].messages;
          delete channels[guildId][channelId].messages;
        }

        for await (const gid of guildIds) {
          await pipeline.sadd(gid, userId);
          state[userId].guilds.add(gid);
        }
      }

      await pipeline.exec();

      if (chatInfo.guilds) {
        for await (const gid of guildIds) {
          const onlineMembers = await redis.smembers(gid);

          Object.entries(members[gid]).forEach(([mid, member]) => {
            if (onlineMembers.includes(mid)) {
              members[gid][mid] = {
                ...member,
                online: true
              };
            }
          });
        }
      }

      const response = {
        guilds,
        members,
        channels,
        messages,
        activeGuild: guildId,
        activeChannel: channelId
      };

      res.json(response);

      if (chatInfo.guilds) {
        publisher({
          type: USER_UPDATE,
          userId,
          payload: {
            online: true
          }
        });
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        next(new ApiError(undefined, undefined, error));
      } else {
        next(error);
      }
    }
  }
);

module.exports = router;
