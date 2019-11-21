const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const verifyEmail = require("../../../database/queries/verifyEmail");
const { sendVerificationEmail } = require("../../../config/jobs");
const config = require("../../../config");

router.put(
  "/verifyEmail",
  celebrate({
    body: Joi.object()
      .keys({
        email: Joi.string()
          .email()
          .required(),
        verificationToken: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { email, verificationToken } = req.body;

    try {
      const user = await verifyEmail({ email, verificationToken });

      if (!user)
        throw new ApiError(
          "Couldn't find a email with that verification token",
          404
        );

      if (!config.benchmark) {
        await sendVerificationEmail(email);
      }

      res.status(200).json(user);
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
