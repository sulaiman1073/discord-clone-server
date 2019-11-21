const knex = require("../../config/knex");
const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ id, username, email }, db = database) => {
  try {
    const query = knex
      .select(
        "email_verification_tokens.verification_token AS verificationToken"
      )
      .from("email_verification_tokens")
      .whereExists(q => {
        q.select("*")
          .from("users")
          .whereRaw("users.id = email_verification_tokens.user_id");
        if (id) {
          q.where("users.id", id);
        } else if (username) {
          q.where("users.username", username);
        } else if (email) {
          q.where("users.email", email);
        }
      });

    const response = (await db.query(query.toString())).rows[0];

    if (!response) return null;

    return response.verificationToken;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
