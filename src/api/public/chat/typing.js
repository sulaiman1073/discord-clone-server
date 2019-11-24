/* eslint-disable prefer-destructuring */
const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { publisher } = require("../../../config/pubSub");
const { MEMBER_TYPING } = require("../../../config/constants");
const state = require("../../../config/state");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");

router.post(
  "/typing",
  authenticateUser,
  celebrate({
    body: Joi.object()
      .keys({
        guildId: Joi.string()
          .uuid()
          .required(),
        channelId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { guildId, channelId } = req.body;
    try {
      if (!state[userId].guilds.has(guildId))
        throw new ApiError(`Couldn't set typing Status`, 404);

      res.json({});

      publisher({
        type: MEMBER_TYPING,
        guildId,
        payload: {
          guildId,
          channelId,
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
