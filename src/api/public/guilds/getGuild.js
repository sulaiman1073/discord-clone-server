const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const getGuild = require("../../../database/queries/getGuild");
const getChannel = require("../../../database/queries/getChannel");
const redis = require("../../../config/redis");

router.get(
  "/",
  // cache,
  celebrate({
    query: Joi.object()
      .keys({
        guildId: Joi.string()
          .uuid()
          .required(),
        channelId: Joi.string()
          .uuid()
          .optional()
      })
      .required()
  }),
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { guildId } = req.query;
    let { channelId } = req.query;

    try {
      const guild = await getGuild({ guildId, userId });

      if (!guild)
        throw new ApiError(`Guild with id of ${guildId} not found`, 404);

      const guildChannels = Object.keys(guild.channels);

      if (!guildChannels.includes(channelId)) {
        [channelId] = guildChannels;
      }

      const channel = await getChannel({ channelId });

      const onlineMembers = await redis.smembers(guildId);

      const members = { ...guild.members };

      Object.entries(members).forEach(([mid, member]) => {
        if (onlineMembers.includes(mid)) {
          members[mid] = {
            ...member,
            online: true
          };
        }
      });

      const response = {
        guildId,
        channelId,
        guilds: {
          [guildId]: {
            name: guild.name,
            icon: guild.icon,
            ownerId: guild.ownerId,
            inviteCode: guild.inviteCode
          }
        },
        members: {
          [guildId]: members
        },
        channels: {
          [guildId]: {
            ...guild.channels,
            [channelId]: {
              name: channel.name,
              position: channel.position,
              topic: channel.topic,
              firstMessageId: channel.firstMessageId,
              lastMessageAt: channel.lastMessageAt
            }
          }
        },
        messages: {
          [channelId]: channel.messages
        }
      };

      res.json(response);
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
