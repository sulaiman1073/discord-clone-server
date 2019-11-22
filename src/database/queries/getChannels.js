const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ guildId, userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    SELECT
      channels.id,
      channels.name,
      channels.position,
      (
        SELECT
          messages.id
        FROM
          messages
        WHERE
          messages.channel_id = channels.id
        ORDER BY
          messages.created_at ASC
        LIMIT
          1
      ) AS "firstMessageId",
      (
        SELECT
          messages.created_at
        FROM
          messages
        WHERE
          messages.channel_id = channels.id
        ORDER BY
          messages.created_at DESC
        LIMIT
          1
      ) AS "lastMessageAt"
    FROM
      channels
    WHERE
      channels.guild_id = $1
      AND EXISTS (
        SELECT
          1
        FROM
          guilds
        WHERE
          guilds.id = channels.guild_id
          AND guilds.owner_id = $2
      )`,
        [guildId, userId]
      )
    ).rows;

    if (response.length === 0) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
