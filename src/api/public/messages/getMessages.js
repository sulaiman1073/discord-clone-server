const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const getMessages = require("../../../database/queries/getMessages");

router.get(
  "/:channelId",
  // cache,
  celebrate({
    params: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required()
      })
      .required(),
    query: Joi.object()
      .keys({
        afterMessageId: Joi.string()
          .uuid()
          .optional(),
        beforeMessageId: Joi.string()
          .uuid()
          .optional()
      })
      .optional()
  }),
  async (req, res, next) => {
    const { channelId } = req.params;
    const { afterMessageId, beforeMessageId } = req.query;
    const { id: userId } = req.user;

    try {
      const messages = await getMessages({
        channelId,
        userId,
        afterMessageId,
        beforeMessageId
      });

      if (!messages) throw new ApiError(`Messages couldn't be retrieved`, 404);

      res.json(messages);
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
