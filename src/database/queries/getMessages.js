const knex = require("../../config/knex");
const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async (
  { channelId, userId, afterMessageId, beforeMessageId },
  db = database
) => {
  try {
    const query = knex
      .select("*")
      .from(q => {
        q.select("id")
          .select("user_id AS userId")
          .select("message")
          .select(
            knex.raw(/* SQL */ `
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
          `)
          )
          .select("created_at AS createdAt")
          .from("messages")
          .where("channel_id", channelId)
          .andWhere(
            knex.raw(
              /* SQL */ `
            EXISTS (
              SELECT
                1
              FROM
                members
              WHERE
                members.user_id = ?
                AND EXISTS (
                  SELECT
                    1
                  FROM
                    channels
                  WHERE
                    channels.guild_id = members.guild_id
                    AND channels.id = messages.channel_id
                )
            )`,
              [userId]
            )
          )
          .orderBy("created_at", "desc")
          .limit(50)
          .as("m");
        if (afterMessageId) {
          q.andWhere(
            knex.raw(
              /* SQL */ `
            created_at > (
              SELECT
                m.created_at
              FROM
                messages AS m
              WHERE
                m.id = ?
            )`,
              [afterMessageId]
            )
          );
        }
        if (beforeMessageId) {
          q.andWhere(
            knex.raw(
              /* SQL */ `
            created_at < (
              SELECT
                m.created_at
              FROM
                messages AS m
              WHERE
                m.id = ?
            )`,
              [beforeMessageId]
            )
          );
        }
      })
      .orderBy("createdAt", "asc");

    const response = (await db.query(query.toString())).rows;

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
