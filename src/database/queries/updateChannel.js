const knex = require("../../config/knex");
const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async (
  { channelId, userId, name, position, topic },
  db = database
) => {
  try {
    const query = knex
      .update({
        name,
        position,
        topic,
        updated_at: knex.raw("NOW()")
      })
      .from("channels")
      .where("id", channelId)
      .whereExists(q => {
        q.select(1)
          .from("guilds")
          .whereRaw("guilds.id = channels.guild_id")
          .andWhere("guilds.owner_id", userId);
      })
      .returning(["id", "name", "position", "topic", "guild_id AS guildId"]);

    const response = (await db.query(query.toString())).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
