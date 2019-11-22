const database = require("../../config/database");
const createDatabaseError = require("../../helpers/createDatabaseError");

module.exports = async ({ firstUser, secondUser }, db = database) => {
  try {
    const response = (
      await db.query(
        /* SQL */ `
    INSERT INTO
      friends
        (
          first_user_id,
          second_user_id
        )
    VALUES
      ($1, $2)
    RETURNING
      first_user_id AS "firstUserId",
      second_user_id AS "secondUserId",
      created_at AS "createdAt"`,
        [firstUser, secondUser]
      )
    ).rows[0];

    if (!response) return null;

    return response;
  } catch (error) {
    throw createDatabaseError(error);
  }
};
