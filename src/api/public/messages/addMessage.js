const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { invalidateCache } = require("../../../helpers/middleware/cache");
const addMessage = require("../../../database/queries/addMessage");
const { publisher } = require("../../../config/pubSub");
const { MESSAGE_ADD } = require("../../../config/constants");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");

router.post(
  "/",
  authenticateUser,
  // invalidateCache,
  celebrate({
    body: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required(),
        message: Joi.string()
          .min(1)
          .max(2000)
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { channelId, message } = req.body;
    const { id: userId, username, discriminator, avatar } = req.user;

    try {
      const newMessage = await addMessage({
        message,
        channelId,
        userId
      });

      if (!newMessage) throw new ApiError();

      res.location(`${req.baseUrl}/${newMessage.id}`);
      res.status(201).json(newMessage);

      publisher({
        type: MESSAGE_ADD,
        guildId: newMessage.guildId,
        payload: {
          guildId: newMessage.guildId,
          channelId: newMessage.channelId,
          message: {
            id: newMessage.id,
            userId: newMessage.userId,
            message: newMessage.message,
            author: {
              username,
              discriminator,
              avatar
            },
            createdAt: newMessage.createdAt
          }
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
