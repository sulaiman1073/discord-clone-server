const knex = require("../../config/knex");
const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async (
  { id, username, email, password, avatar, removeAvatar, status },
  db = database
) => {
  try {
    const query = knex
      .update({
        updated_at: knex.raw("NOW()")
      })
      .from("users")
      .where("id", id)
      .returning([
        "id",
        "username",
        "discriminator",
        "avatar",
        "email",
        "email_verified AS emailVerified",
        "status",
        "created_at AS createdAt"
      ]);

    if (username) {
      query.update({
        username
      });
    }

    if (email) {
      query.update({
        email,
        email_verified: false
      });
    }

    if (password) {
      query.update({
        password
      });
    }

    if (status) {
      query.update({
        status
      });
    }

    if (removeAvatar) {
      query.update({
        avatar: null
      });
    } else if (avatar) {
      query.update({
        avatar
      });
    }

    const response = (await db.query(query.toString())).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
