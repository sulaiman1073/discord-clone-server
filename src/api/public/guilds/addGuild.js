const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { invalidateCache } = require("../../../helpers/middleware/cache");
const addGuild = require("../../../database/queries/addGuild");
const addMember = require("../../../database/queries/addMember");
const getUser = require("../../../database/queries/getUser");
const getChannelByGuildId = require("../../../database/queries/getChannelByGuildId");
const state = require("../../../config/state");
const redis = require("../../../config/redis");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");

router.post(
  "/",
  authenticateUser,
  // invalidateCache,
  celebrate({
    body: Joi.object()
      .keys({
        name: Joi.string()
          .min(2)
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { name } = req.body;
    const { id: userId } = req.user;

    try {
      const newGuild = await addGuild({
        name,
        ownerId: userId
      });

      if (!newGuild) throw new ApiError();

      const newChannel = await getChannelByGuildId({
        guildId: newGuild.id
      });

      await addMember({
        guildId: newGuild.id,
        userId
      });

      const newMember = await getUser({
        id: userId
      });

      res.location(`${req.baseUrl}/${newGuild.id}`);
      res.status(201).json({
        guildId: newGuild.id,
        channelId: newChannel.id,
        guilds: {
          [newGuild.id]: {
            name: newGuild.name,
            icon: newGuild.icon,
            ownerId: newGuild.ownerId,
            inviteCode: newGuild.inviteCode
          }
        },
        members: {
          [newGuild.id]: {
            [newMember.id]: {
              username: newMember.username,
              discriminator: newMember.discriminator,
              avatar: newMember.avatar,
              status: newMember.status,
              online: true
            }
          }
        },
        channels: {
          [newGuild.id]: {
            [newChannel.id]: {
              name: newChannel.name,
              position: newChannel.position,
              topic: newChannel.topic,
              firstMessageId: null,
              lastMessageAt: null
            }
          }
        },
        messages: {
          [newChannel.id]: []
        }
      });

      state[userId].guilds.add(newGuild.id);
      await redis.sadd(newGuild.id, userId);
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
