const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ guildId, userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    INSERT INTO
      members
        (
          guild_id,
          user_id
        )
    VALUES
      ($1, $2)
    RETURNING
      guild_id AS "guildId",
      user_id AS "userId",
      created_at AS "createdAt"`,
        [guildId, userId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
