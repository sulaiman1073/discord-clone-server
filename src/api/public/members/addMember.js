const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { invalidateCache } = require("../../../helpers/middleware/cache");
const addMemberByInviteCode = require("../../../database/queries/addMemberByInviteCode");
const getGuild = require("../../../database/queries/getGuild");
const getMessages = require("../../../database/queries/getMessages");
const state = require("../../../config/state");
const redis = require("../../../config/redis");
const { publisher } = require("../../../config/pubSub");
const { MEMBER_ADD } = require("../../../config/constants");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");

router.post(
  "/",
  authenticateUser,
  // invalidateCache,
  celebrate({
    body: Joi.object()
      .keys({
        inviteCode: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { inviteCode } = req.body;
    const { id: userId } = req.user;

    try {
      const newMember = await addMemberByInviteCode({
        inviteCode,
        userId
      });

      if (!newMember) throw new ApiError("Couldn't add member", 500);

      const { guildId } = newMember;

      const guild = await getGuild({
        guildId,
        userId
      });

      if (!guild)
        throw new ApiError(`Guild with id of ${guild} not found`, 404);

      const guildChannels = Object.keys(guild.channels);

      const channelId = guildChannels[0];

      const channelMessages = await getMessages({
        channelId,
        userId
      });

      const onlineMembers = await redis.smembers(guildId);

      const channels = {
        [guildId]: {
          ...guild.channels
        }
      };

      const members = {
        [guildId]: {
          ...guild.members
        }
      };

      const messages = {
        [channelId]: channelMessages
      };

      delete guild.channels;
      delete guild.members;

      const guilds = {
        [guildId]: {
          ...guild
        }
      };

      Object.entries(members[guildId]).forEach(([mid, member]) => {
        if (onlineMembers.includes(mid)) {
          members[guildId][mid] = {
            ...member,
            online: true
          };
        }
      });

      members[guildId][userId] = {
        ...members[guildId][userId],
        online: true
      };

      const response = {
        guilds,
        channels,
        members,
        messages,
        guildId,
        channelId
      };

      res.json(response);

      state[userId].guilds.add(guildId);
      await redis.sadd(guildId, userId);

      publisher({
        type: MEMBER_ADD,
        guildId,
        payload: {
          guildId,
          userId,
          member: {
            ...members[guildId][userId],
            online: true
          }
        }
      });
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (
          error.codeName === "unique_violation" &&
          error.constraint === "members_pkey"
        ) {
          next(new ApiError("You are already in this guild.", 409, error));
        } else if (
          error.codeName === "not_null_violation" &&
          error.table === "members" &&
          error.column === "guild_id"
        ) {
          next(new ApiError("Invite code is invalid or expired.", 409, error));
        } else {
          next(new ApiError(undefined, undefined, error));
        }
      } else {
        next(error);
      }
    }
  }
);

module.exports = router;
