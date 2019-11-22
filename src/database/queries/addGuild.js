const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ name, icon, ownerId }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    INSERT INTO
      guilds
        (
          name,
          icon,
          owner_id
        )
    VALUES
      ($1, $2, $3)
    RETURNING
      id AS "id",
      name AS "name",
      icon AS "icon",
      invite_code AS "inviteCode",
      owner_id AS "ownerId",
      created_at AS "createdAt"`,
        [name, icon, ownerId]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
