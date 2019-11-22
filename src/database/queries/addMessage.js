const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ message, channelId, userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    INSERT INTO
      messages
        (
          message,
          channel_id,
          user_id
        )
      SELECT
        $1 AS "message",
        channels.id AS "channel_id",
        members.user_id AS "user_id"
      FROM
        members
      JOIN
        channels
      ON
        channels.guild_id = members.guild_id
      WHERE
        channels.id = $2
        AND members.user_id = $3
    RETURNING
      id AS "id",
      message AS "message",
      user_id AS "userId",
      channel_id AS "channelId",
      created_at AS "createdAt",
      (
        SELECT
          guild_id
        FROM
          channels
        WHERE
          channels.id = $2
      ) AS "guildId"
      `,
        [message, channelId, userId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
