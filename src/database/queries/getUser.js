const knex = require("../../config/knex");
const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async (
  { id, username, email, withPassword },
  db = database
) => {
  try {
    const query = knex
      .select("id")
      .select("username")
      .select("discriminator")
      .select("email")
      .select("avatar")
      .select("email_verified AS emailVerified")
      .select("status")
      .select("created_at AS createdAt")
      .from("users");

    if (id) {
      query.where("id", id);
    } else if (username) {
      query.where("username", username);
    } else if (email) {
      query.where("email", email);
    }

    if (withPassword) {
      query.select("password");
    }

    const response = (await db.query(query.toString())).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
