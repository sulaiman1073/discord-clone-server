const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ guildId, userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    DELETE FROM
      members
    WHERE
      members.guild_id = $1
      AND members.user_id = $2
    RETURNING
      guild_id AS "guildId",
      user_id AS "userId"`,
        [guildId, userId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
