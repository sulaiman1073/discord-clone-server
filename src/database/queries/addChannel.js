const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ name, position, topic, guildId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    INSERT INTO
      channels
        (
          name,
          position,
          topic,
          guild_id
        )
    VALUES
      ($1, $2, $3, $4)
    RETURNING
      id AS "id",
      name AS "name",
      position AS "position",
      topic AS "topic",
      guild_id AS "guildId",
      created_at AS "createdAt"`,
        [name, position, topic, guildId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
