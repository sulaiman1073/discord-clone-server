const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { invalidateCache } = require("../../../helpers/middleware/cache");
const deleteMember = require("../../../database/queries/deleteMember");
const state = require("../../../config/state");
const redis = require("../../../config/redis");
const { publisher } = require("../../../config/pubSub");
const { MEMBER_DELETE } = require("../../../config/constants");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");

router.delete(
  "/:guildId",
  authenticateUser,
  // invalidateCache,
  celebrate({
    params: Joi.object()
      .keys({
        guildId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { guildId } = req.params;
    const { id: userId } = req.user;

    try {
      const deletedMember = await deleteMember({
        guildId,
        userId
      });

      if (!deletedMember)
        throw new ApiError(
          `User not a member of the guild with the id of ${guildId}`,
          404
        );

      res.json({});

      state[userId].guilds.delete(guildId);
      await redis.srem(guildId, userId);

      publisher({
        type: MEMBER_DELETE,
        guildId,
        payload: {
          guildId,
          userId
        }
      });
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
