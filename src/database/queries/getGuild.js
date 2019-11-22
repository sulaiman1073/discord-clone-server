const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ guildId, userId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    SELECT
      guilds.name,
      guilds.icon,
      guilds.owner_id AS "ownerId",
      guilds.invite_code AS "inviteCode",
      (
        SELECT
          JSON_OBJECT_AGG(
            channels.id,
            JSON_BUILD_OBJECT(
              'name',
              channels.name,
              'position',
              channels.position,
              'topic',
              channels.topic,
              'firstMessageId',
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
              ),
              'lastMessageAt',
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
              )
            )
          )
        FROM
          channels
        WHERE
          channels.guild_id = guilds.id
      ) AS "channels",
      (
        SELECT
          JSON_OBJECT_AGG(
            users.id,
            JSON_BUILD_OBJECT(
              'username',
              users.username,
              'discriminator',
              users.discriminator,
              'avatar',
              users.avatar,
              'status',
              users.status
            )
          )
        FROM
          members
        JOIN
          users
        ON
          members.user_id = users.id
        WHERE
          members.guild_id = guilds.id
      ) AS "members"
    FROM
      guilds
    WHERE
      guilds.id = $1
      AND EXISTS (
        SELECT
          1
        FROM
          members
        WHERE
          members.guild_id = guilds.id
          AND members.user_id = $2
      )`,
        [guildId, userId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
