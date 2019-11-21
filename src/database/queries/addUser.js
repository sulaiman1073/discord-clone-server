const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async (
  { username, discriminator, password, avatar, email },
  db = database
) => {
  try {
    const response = (await db.query(
      /* SQL */ `
    INSERT INTO
      users
        (
          username,
          discriminator,
          password,
          avatar,
          email
        )
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING
      id AS "id",
      username AS "username",
      discriminator AS "discriminator",
      avatar AS "avatar",
      email AS "email",
      email_verified AS "emailVerified",
      status AS "status",
      created_at AS "createdAt"`,
      [username, discriminator, password, avatar, email]
    )).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
