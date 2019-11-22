const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ userId, inviteCode }, db = database) => {
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
        (
        SELECT
          (
            SELECT
              id
            FROM
              guilds
            WHERE
              invite_code = $2
          ) AS "guild_id",
          $1 AS "user_id"
        )
    RETURNING
      guild_id AS "guildId",
      user_id AS "userId",
      created_at AS "createdAt"`,
        [userId, inviteCode]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
