const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ userId, channelId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    SELECT
      JSON_OBJECT_AGG(
        guilds.id,
        JSON_BUILD_OBJECT(
          'name',
          guilds.name,
          'icon',
          guilds.icon,
          'inviteCode',
          guilds.invite_code,
          'ownerId',
          guilds.owner_id,
          'members',
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
              users
            JOIN
              members
            ON
              members.user_id = users.id
              AND members.guild_id = guilds.id
          ),
          'channels',
          (
            SELECT
            JSON_OBJECT_AGG(
              channels.id,
              CASE
              WHEN $2::uuid = channels.id THEN (
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
                      id
                    FROM
                      messages
                    WHERE
                      messages.channel_id = channels.id
                    ORDER BY
                      created_at ASC
                    LIMIT
                      1
                  ),
                  'lastMessageAt',
                  (
                    SELECT
                      created_at
                    FROM
                      messages
                    WHERE
                      messages.channel_id = channels.id
                    ORDER BY
                      created_at DESC
                    LIMIT
                      1
                  ),
                  'messages',
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
                  ), '[]')
                )
              )
              ELSE (
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
                      id
                    FROM
                      messages
                    WHERE
                      messages.channel_id = channels.id
                    ORDER BY
                      created_at ASC
                    LIMIT
                      1
                  ),
                  'lastMessageAt',
                  (
                    SELECT
                      created_at
                    FROM
                      messages
                    WHERE
                      messages.channel_id = channels.id
                    ORDER BY
                      created_at DESC
                    LIMIT
                      1
                  )
                )
              )
              END
            )
          FROM
            channels
          WHERE
            channels.guild_id = guilds.id
          )
        )
      ) AS "guilds"
    FROM
      guilds
    WHERE
      EXISTS (
        SELECT
          1
        FROM
          members
        WHERE
          members.user_id = $1
          AND members.guild_id = guilds.id
      )
    `,
        [userId, channelId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
