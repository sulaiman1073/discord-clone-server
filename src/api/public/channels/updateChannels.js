const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const database = require("../../../config/database");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { invalidateCache } = require("../../../helpers/middleware/cache");
const getChannels = require("../../../database/queries/getChannels");
const addChannel = require("../../../database/queries/addChannel");
const updateChannel = require("../../../database/queries/updateChannel");
const deleteChannel = require("../../../database/queries/deleteChannel");
const { publisher } = require("../../../config/pubSub");
const { CHANNELS_UPDATE } = require("../../../config/constants");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");

router.put(
  "/",
  authenticateUser,
  // invalidateCache,
  celebrate({
    body: Joi.object()
      .keys({
        guildId: Joi.string()
          .uuid()
          .required(),
        addedChannels: Joi.array()
          .items(
            Joi.object()
              .keys({
                id: Joi.string()
                  .uuid()
                  .required(),
                name: Joi.string()
                  .min(2)
                  .required(),
                position: Joi.number()
                  .integer()
                  .min(1)
                  .required()
              })
              .required()
          )
          .optional(),
        updatedChannels: Joi.array()
          .items(
            Joi.object()
              .keys({
                id: Joi.string()
                  .uuid()
                  .required(),
                name: Joi.string()
                  .min(2)
                  .required(),
                position: Joi.number()
                  .integer()
                  .min(1)
                  .required()
              })
              .required()
          )
          .optional(),
        deletedChannels: Joi.array()
          .items(
            Joi.object()
              .keys({
                id: Joi.string()
                  .uuid()
                  .required(),
                name: Joi.string()
                  .min(2)
                  .required(),
                position: Joi.number()
                  .integer()
                  .min(1)
                  .required()
              })
              .required()
          )
          .optional()
      })
      .required()
  }),
  async (req, res, next) => {
    const {
      guildId,
      addedChannels,
      updatedChannels,
      deletedChannels
    } = req.body;
    const { id: userId } = req.user;

    const client = await database.connect();
    try {
      await client.query("BEGIN");

      if (deletedChannels) {
        for await (const { id: channelId } of deletedChannels) {
          const deletedChannel = await deleteChannel(
            { channelId, userId },
            client
          );

          if (!deletedChannel) throw new ApiError();
        }
      }

      if (updatedChannels) {
        for await (const { id: channelId, name, position } of updatedChannels) {
          const updatedChannel = await updateChannel(
            { channelId, userId, name, position },
            client
          );

          if (!updatedChannel) throw new ApiError();
        }
      }

      if (addedChannels) {
        for await (const { name, position } of addedChannels) {
          const newChannel = await addChannel(
            { name, position, guildId },
            client
          );

          if (!newChannel) throw new ApiError();
        }
      }

      const guildChannels = await getChannels({ guildId, userId }, client);

      publisher({
        type: CHANNELS_UPDATE,
        guildId,
        payload: {
          guildId,
          channels: {
            [guildId]: Object.fromEntries(
              guildChannels.map(channel => [
                channel.id,
                {
                  name: channel.name,
                  position: channel.position,
                  firstMessageId: channel.firstMessageId,
                  lastMessageAt: channel.lastMessageAt
                }
              ])
            )
          }
        }
      });

      res.json({});

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      if (error instanceof DatabaseError) {
        next(new ApiError(undefined, undefined, error));
      } else {
        next(error);
      }
    } finally {
      client.release();
    }
  }
);

module.exports = router;
