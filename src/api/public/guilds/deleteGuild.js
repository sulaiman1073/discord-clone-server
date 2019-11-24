const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { invalidateCache } = require("../../../helpers/middleware/cache");
const deleteGuild = require("../../../database/queries/deleteGuild");
const { publisher } = require("../../../config/pubSub");
const { GUILD_DELETE } = require("../../../config/constants");
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
      const deletedGuild = await deleteGuild({
        guildId,
        userId
      });

      if (!deletedGuild)
        throw new ApiError(
          `User not the owner of the guild with the id of ${guildId}`,
          404
        );

      res.json({});

      publisher({
        type: GUILD_DELETE,
        guildId,
        payload: {
          guildId
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
