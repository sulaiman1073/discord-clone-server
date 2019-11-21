const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { celebrate, Joi } = require("celebrate");
const pgErrorCodes = require("pg-error-codes");
const { sendRegistrationEmail } = require("../../../config/jobs");
const addUser = require("../../../database/queries/addUser");
const config = require("../../../config");
const { ApiError, DatabaseError } = require("../../../helpers/errors");

router.post(
  "/",
  celebrate({
    body: Joi.object()
      .keys({
        username: Joi.string()
          .min(3)
          .max(30)
          .required(),
        email: Joi.string()
          .email()
          .required(),
        password: Joi.string()
          .min(6)
          .regex(/[a-z]/)
          .regex(/[A-Z]/)
          .regex(/\d+/)
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await addUser({
        username,
        password: hashedPassword,
        email
      });

      if (!newUser) throw new ApiError();

      if (!config.benchmark) {
        await sendRegistrationEmail(email);
      }

      res.location(`${req.baseUrl}/${newUser.id}`);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (
          error.codeName === "unique_violation" &&
          error.constraint === "unique_email"
        ) {
          next(new ApiError("Email already in use", 409, error));
        } else if (
          (error.codeName === "not_null_violation" &&
            error.column === "discriminator") ||
          (error.codeName === "exclusion_violation" &&
            error.constraint === "unique_username_discriminator")
        ) {
          next(new ApiError("Username unavailable", 409, error));
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
