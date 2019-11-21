const knex = require("../../config/knex");
const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async (
  { guildId, name, icon, removeIcon, userId },
  db = database
) => {
  try {
    const query = knex
      .update({
        updated_at: knex.raw("NOW()")
      })
      .from("guilds")
      .where("id", guildId)
      .andWhere("owner_id", userId)
      .returning([
        "id",
        "name",
        "icon",
        "invite_code AS inviteCode",
        "owner_id AS ownerId",
        "created_at AS createdAt"
      ]);

    if (name) {
      query.update({
        name
      });
    }
    if (removeIcon) {
      query.update({
        icon: null
      });
    } else if (icon) {
      query.update({
        icon
      });
    }

    const response = (await db.query(query.toString())).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
