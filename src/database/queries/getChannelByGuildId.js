const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ guildId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    SELECT
      channels.id,
      channels.name,
      channels.position,
      channels.topic
    FROM
      channels
    WHERE
      channels.guild_id = $1`,
        [guildId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
