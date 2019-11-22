const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ channelId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    SELECT
      channels.name,
      channels.position,
      channels.topic,
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
      ) AS "lastMessageAt",
      COALESCE((
        SELECT
          JSON_AGG(m1 ORDER BY "createdAt")
        FROM
        (
          SELECT
            messages.id,
            messages.user_id AS "userId",
            messages.message,
            messages.created_at AS "createdAt",
            (
              SELECT
                JSON_BUILD_OBJECT(
                  'username',
                  users.username,
                  'discriminator',
                  users.discriminator,
                  'avatar',
                  users.avatar
                )
              FROM
                users
              WHERE
                users.id = messages.user_id
            ) AS "author"
          FROM
            messages
          WHERE
            messages.channel_id = channels.id
          ORDER BY
            messages.created_at DESC
          LIMIT
            50
        ) AS "m1"
      ), '[]') AS "messages"
    FROM
      channels
    WHERE
      channels.id = $1`,
        [channelId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
