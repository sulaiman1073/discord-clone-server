const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const fileType = require("file-type");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { invalidateCache } = require("../../../helpers/middleware/cache");
const updateGuild = require("../../../database/queries/updateGuild");
const { publisher } = require("../../../config/pubSub");
const { GUILD_UPDATE } = require("../../../config/constants");
const { uploadFile } = require("../../../config/aws");
const multer = require("../../../helpers/middleware/multer");

router.put(
  "/:guildId",
  authenticateUser,
  // invalidateCache,
  multer.single("icon"),
  celebrate({
    params: Joi.object()
      .keys({
        guildId: Joi.string()
          .uuid()
          .required()
      })
      .required(),
    body: Joi.object()
      .keys({
        name: Joi.string()
          .min(2)
          .optional(),
        removeIcon: Joi.boolean().optional()
      })
      .required()
  }),
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { name, removeIcon } = req.body;
    const { guildId } = req.params;

    const icon = req.file;
    let uploadedIcon;

    try {
      if (icon && removeIcon)
        throw new ApiError(`Either icon must be provided or removeIcon.`, 400);

      if (icon) {
        const { buffer } = icon;
        const type = fileType(buffer);
        const fileName = `guildIcon-${guildId}`;
        const uploadedImage = await uploadFile(buffer, fileName, type);

        if (!uploadedImage) throw new ApiError(`Couldn't upload avatar`, 500);

        uploadedIcon = uploadedImage.Location;
      }

      const newGuild = await updateGuild({
        guildId,
        name,
        userId,
        icon: uploadedIcon,
        removeIcon
      });

      if (!newGuild)
        throw new ApiError(`Only guild owner can update guild`, 404);

      res.status(200).json({});

      publisher({
        type: GUILD_UPDATE,
        guildId,
        payload: {
          guildId,
          ...(name && { name: newGuild.name }),
          ...((removeIcon || icon) && { icon: newGuild.icon })
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
