const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId, userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    DELETE FROM
      channels
    WHERE
      channels.id = $1
      AND EXISTS (
        SELECT
          1
        FROM
          guilds
        WHERE
          guilds.id = channels.guild_id
          AND guilds.owner_id = $2
      )
    RETURNING
      id AS "id",
      name AS "name",
      position AS "position",
      topic AS "topic",
      guild_id AS "guildId",
      created_at AS "createdAt"`,
        [channelId, userId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
